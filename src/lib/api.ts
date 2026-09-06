// Production API client connecting frontend to LeadForge backend services

const TOKEN_KEY = 'leadforge_session_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) errorMsg = errorJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  auth: {
    login: (email: string, password?: string) =>
      request<{ user: any; workspace: any; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password?: string, name?: string) =>
      request<{ user: any; workspace: any; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }),
    getMe: () => request<{ user: any; workspace: any }>('/api/auth/me'),
    logout: () =>
      request<{ success: boolean }>('/api/auth/logout', {
        method: 'POST',
      }),
  },

  // Workspace
  workspace: {
    get: () => request<any>('/api/workspace'),
    update: (data: any) =>
      request<any>('/api/workspace', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  // ICP
  icp: {
    get: () => request<any>('/api/icp'),
    update: (data: any) =>
      request<any>('/api/icp', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    parse: (prompt: string) =>
      request<{ criteria: any; source: string }>('/api/icp/parse', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      }),
  },

  // Accounts
  accounts: {
    list: () => request<any[]>('/api/accounts'),
    get: (id: string) => request<any>(`/api/accounts/${id}`),
    create: (data: any) =>
      request<{ accountId: string; opportunityId: string }>('/api/accounts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<{ success: boolean }>(`/api/accounts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/accounts/${id}`, {
        method: 'DELETE',
      }),
  },

  // Contacts
  contacts: {
    list: () => request<any[]>('/api/contacts'),
    create: (data: any) =>
      request<{ id: string; success: boolean }>('/api/contacts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<{ success: boolean }>(`/api/contacts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/contacts/${id}`, {
        method: 'DELETE',
      }),
  },

  // Opportunities
  opportunities: {
    list: () => request<any[]>('/api/opportunities'),
    today: () => request<any[]>('/api/opportunities/today'),
    get: (id: string) => request<any>(`/api/opportunities/${id}`),
    update: (id: string, data: any) =>
      request<{ success: boolean }>(`/api/opportunities/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    runResearch: (id: string) =>
      request<{ runId: string; score: number; findingsCount: number; research: any }>(
        `/api/opportunities/${id}/research`,
        { method: 'POST' }
      ),
    getResearch: (id: string) =>
      request<{ runs: any[]; sources: any[]; evidence: any[] }>(`/api/opportunities/${id}/research`),
    updateScore: (id: string, breakdown: any) =>
      request<any>(`/api/opportunities/${id}/score`, {
        method: 'POST',
        body: JSON.stringify(breakdown),
      }),
    generateOutreach: (id: string, data: { contactId?: string; tone?: string; channel?: string }) =>
      request<{ draftId: string; draft: any }>(`/api/opportunities/${id}/outreach`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Follow-ups
  followUps: {
    list: () => request<any[]>('/api/follow-ups'),
    create: (data: { opportunityId: string; contactId?: string; reason: string; dueAt: string }) =>
      request<{ id: string; success: boolean }>('/api/follow-ups', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { status?: string; dueAt?: string }) =>
      request<{ success: boolean }>(`/api/follow-ups/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  // Tasks
  tasks: {
    list: () => request<any[]>('/api/tasks'),
  },

  // Activity
  activity: {
    list: () => request<any[]>('/api/activity'),
  },

  // Notifications
  notifications: {
    list: () => request<any[]>('/api/notifications'),
    markRead: (id: string) =>
      request<{ success: boolean }>(`/api/notifications/${id}`, {
        method: 'PATCH',
      }),
    markAllRead: () =>
      request<{ success: boolean }>('/api/notifications/mark-all-read', {
        method: 'POST',
      }),
  },

  // CSV Import
  import: {
    csv: (rows: any[]) =>
      request<{ imported: number; duplicates: number }>('/api/import/csv', {
        method: 'POST',
        body: JSON.stringify({ rows }),
      }),
  },

  // Sample Data management (Spec #8)
  demo: {
    seed: () => request<{ success: boolean; sampleCount: number }>('/api/demo/seed', { method: 'POST' }),
    clear: () => request<{ success: boolean }>('/api/demo/clear', { method: 'POST' }),
  },
};
