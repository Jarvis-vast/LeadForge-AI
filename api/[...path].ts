import type { IncomingMessage, ServerResponse } from "node:http";

type ProxyRequest = IncomingMessage & {
  method?: string;
  url?: string;
  body?: unknown;
};
type ProxyResponse = ServerResponse & {
  status?: (code: number) => ProxyResponse;
  json?: (body: unknown) => void;
};

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "expect",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const RESPONSE_HEADERS = new Set([
  "cache-control",
  "content-type",
  "etag",
  "last-modified",
  "retry-after",
  "www-authenticate",
]);

function replyError(res: ProxyResponse, status: number, error: string): void {
  if (typeof res.status === "function" && typeof res.json === "function") {
    res.status(status).json({ error });
    return;
  }

  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify({ error }));
}

function normalizeHost(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "";
  try {
    return new URL(raw.includes("://") ? raw : `https://${raw}`).host.toLowerCase();
  } catch {
    return "";
  }
}

function getBackendOrigin(req: ProxyRequest): string | null {
  const configured = process.env.LEADFORGE_BACKEND_URL?.trim();
  if (!configured || configured.includes("YOUR-CLOUD-RUN-SERVICE")) return null;

  try {
    const backend = new URL(configured);
    const isLocalDevelopment =
      backend.hostname === "localhost" ||
      backend.hostname === "127.0.0.1" ||
      backend.hostname === "::1";

    if (
      (backend.protocol !== "https:" && !isLocalDevelopment) ||
      backend.username ||
      backend.password ||
      backend.search ||
      backend.hash ||
      (backend.pathname !== "/" && backend.pathname !== "")
    ) {
      return null;
    }

    const incomingHost = normalizeHost(req.headers.host);
    const deploymentHosts = [
      process.env.VERCEL_URL,
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
    ]
      .map(normalizeHost)
      .filter(Boolean);

    // Prevent accidental proxy loops back to this Vercel deployment.
    if (backend.host.toLowerCase() === incomingHost || deploymentHosts.includes(backend.host.toLowerCase())) {
      return null;
    }

    return backend.origin;
  } catch {
    return null;
  }
}

async function readRequestBody(req: ProxyRequest, method: string): Promise<Buffer | undefined> {
  if (method === "GET" || method === "HEAD") return undefined;

  // Vercel's Node runtime may parse JSON bodies before invoking the handler.
  if (req.body !== undefined) {
    if (Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === "string") return Buffer.from(req.body);
    return Buffer.from(JSON.stringify(req.body));
  }

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 15 * 1024 * 1024) {
      throw new Error("Request body exceeds the 15 MB limit.");
    }
    chunks.push(buffer);
  }
  return chunks.length ? Buffer.concat(chunks) : undefined;
}

/**
 * Vercel function bridge for the existing /api/* client routes.
 *
 * The durable application server (currently the Express/SQLite service)
 * remains the source of truth for identities and workspace data. Configure
 * LEADFORGE_BACKEND_URL to that server's HTTPS origin in Vercel. Do not point
 * this variable at the Vercel site itself.
 */
export default async function handler(req: ProxyRequest, res: ProxyResponse): Promise<void> {
  const method = (req.method || "GET").toUpperCase();
  const requestUrl = req.url || "/";

  if (!requestUrl.startsWith("/api/") || requestUrl.startsWith("//")) {
    replyError(res, 404, "Not found.");
    return;
  }

  const backendOrigin = getBackendOrigin(req);
  if (!backendOrigin) {
    replyError(
      res,
      503,
      "LeadForge backend is not configured. Set LEADFORGE_BACKEND_URL to the HTTPS origin of the existing persistent backend service."
    );
    return;
  }

  let body: Buffer | undefined;
  try {
    body = await readRequestBody(req, method);
  } catch (error) {
    replyError(res, 413, error instanceof Error ? error.message : "Request body is too large.");
    return;
  }

  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    const key = name.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(key) || key === "accept-encoding") continue;
    if (typeof value === "string") headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(", "));
  }

  headers.set("x-forwarded-host", typeof req.headers.host === "string" ? req.headers.host : "");
  headers.set("x-forwarded-proto", "https");

  try {
    const upstream = await fetch(`${backendOrigin}${requestUrl}`, {
      method,
      headers,
      body: body as unknown as BodyInit | undefined,
      redirect: "manual",
      signal: AbortSignal.timeout(55_000),
    });

    res.statusCode = upstream.status;
    upstream.headers.forEach((value, name) => {
      const key = name.toLowerCase();
      if (RESPONSE_HEADERS.has(key)) res.setHeader(key, value);
    });

    if (requestUrl.startsWith("/api/auth/")) {
      res.setHeader("cache-control", "no-store");
    }

    if (method === "HEAD" || upstream.status === 204 || upstream.status === 304) {
      res.end();
      return;
    }

    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    replyError(
      res,
      502,
      "LeadForge backend could not be reached. Check LEADFORGE_BACKEND_URL and the backend service health."
    );
  }
}
