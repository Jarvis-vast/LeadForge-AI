import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NetworkConstellation } from "./NetworkConstellation";
import { useLeadForge } from "../context/LeadForgeContext";
import { Loader2, Eye, EyeOff, Check, AlertCircle } from "lucide-react";

export const WelcomeScreen: React.FC = () => {
  const { loginWithEmail, registerWithEmail } = useLeadForge();

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const switchMode = (newMode: "signin" | "register") => {
    setMode(newMode);
    setErrorMessage(null);
  };

  const isPasswordValid = password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password;
    const trimmedName = name.trim();

    // Client-side validations
    if (mode === "register" && !trimmedName) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage("Please enter your work email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid work email address (e.g. you@company.com).");
      return;
    }

    if (!trimmedPassword) {
      setErrorMessage("Please enter your password.");
      return;
    }

    if (trimmedPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "signin") {
        await loginWithEmail(trimmedEmail, trimmedPassword);
      } else {
        await registerWithEmail(trimmedEmail, trimmedPassword, trimmedName);
      }
    } catch (err: any) {
      const msg = err?.message || (mode === "signin" ? "Sign in failed. Please check your credentials." : "Registration failed. Please try again.");
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  // Shared motion variant for entrance
  const entranceVariant = {
    initial: { opacity: 0, filter: "blur(10px)", y: 18 },
    animate: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="relative min-h-screen w-full bg-[#000000] text-white flex flex-col justify-between overflow-x-hidden font-ui select-none">
      {/* Abstract cinematic intelligence & signal flow background */}
      <NetworkConstellation />

      {/* Main Content Area */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-between max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-8 lg:py-12">
        {/* Top Header / Brand Mark */}
        <motion.header
          className="flex items-center justify-between w-full"
          variants={entranceVariant}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center gap-3.5">
            {/* 44-48px liquid-glass circular mark with white LF */}
            <div className="w-11 h-11 rounded-full glass-strong border border-white/[0.18] flex items-center justify-center shadow-lg luminous-edge">
              <span className="font-ui font-semibold text-sm tracking-wider text-white">
                LF
              </span>
            </div>
            <span className="font-ui font-medium text-base sm:text-lg text-white tracking-tight">
              LeadForge
            </span>
          </div>

          {/* Subtle live signal pulse pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[11px] text-white/50 font-ui">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
            <span>Autonomous Intelligence Stream</span>
          </div>
        </motion.header>

        {/* Center Two-Zone Composition */}
        <div className="w-full flex-1 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 my-8 sm:my-12">
          {/* Left Side: Brand & Narrative (~52-55% width) */}
          <div className="w-full lg:w-[54%] flex flex-col justify-center space-y-6 lg:space-y-8">
            {/* Editorial Headline */}
            <motion.div
              variants={entranceVariant}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.15 }}
            >
              <h1 className="font-editorial italic text-white text-[46px] sm:text-[58px] lg:text-[72px] leading-[0.91] tracking-[-0.025em] font-normal">
                Know who matters.
                <br />
                Know what to do next.
              </h1>
            </motion.div>

            {/* Supporting Copy */}
            <motion.p
              className="max-w-[460px] text-[15px] sm:text-[16px] text-white/[0.68] font-light leading-[1.52]"
              variants={entranceVariant}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.25 }}
            >
              LeadForge turns prospecting into an intelligent daily workflow — finding promising accounts, explaining why they matter, and keeping the next action clear.
            </motion.p>

            {/* Small Product Signal Pill */}
            <motion.div
              className="flex items-center pt-1"
              variants={entranceVariant}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.35 }}
            >
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full glass-pill border border-white/[0.14] shadow-sm">
                <span className="font-ui font-medium text-[10.5px] uppercase tracking-[0.16em] text-white/80">
                  AI SALES INTELLIGENCE
                </span>
              </div>
            </motion.div>

            {/* Trust / Product Statement */}
            <motion.div
              className="text-[13px] sm:text-sm font-light text-white/[0.48]"
              variants={entranceVariant}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.45 }}
            >
              Built for founders who still own the pipeline.
            </motion.div>
          </div>

          {/* Right Side: Authentication Panel (~45-48% width) */}
          <div className="w-full lg:w-[46%] flex justify-center lg:justify-end">
            <motion.div
              className="w-full sm:w-[430px] p-7 sm:p-9 rounded-[24px] liquid-glass-strong border border-white/[0.14] flex flex-col space-y-5"
              variants={entranceVariant}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3 }}
            >
              {/* Panel Header */}
              <div className="space-y-1.5">
                <div className="font-ui font-medium text-[11px] uppercase tracking-[0.15em] text-white/[0.52]">
                  {mode === "signin" ? "WELCOME TO LEADFORGE" : "START PROSPECTING"}
                </div>
                <h2 className="font-editorial italic text-white text-[32px] sm:text-[38px] leading-[1.0] font-normal">
                  {mode === "signin" ? "Access your command center." : "Create your founder workspace."}
                </h2>
                <p className="text-[13.5px] sm:text-[14px] text-white/[0.62] font-light leading-[1.45]">
                  {mode === "signin"
                    ? "Sign in to access your priority opportunities and daily intelligence briefing."
                    : "Provision your dedicated workspace with automated B2B pipeline scoring."}
                </p>
              </div>

              {/* Mode Toggle Switcher (Sign In vs Create Account) */}
              <div className="flex p-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className={`flex-1 py-1.5 text-xs font-ui font-medium rounded-full transition-all duration-200 ${
                    mode === "signin"
                      ? "bg-white text-black shadow-md"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className={`flex-1 py-1.5 text-xs font-ui font-medium rounded-full transition-all duration-200 ${
                    mode === "register"
                      ? "bg-white text-black shadow-md"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error state message (semantic restrained red) */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs font-ui leading-snug flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Authentication Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Full Name field (Create Account mode only) */}
                {mode === "register" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1"
                  >
                    <label className="text-xs font-ui text-white/70 block pl-1">
                      Full name
                    </label>
                    <input
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="e.g. Alex Vance"
                      disabled={isSubmitting}
                      className="w-full h-[46px] px-4 rounded-full bg-white/[0.035] border border-white/[0.10] text-sm text-white placeholder-white/40 focus:outline-none input-luminous-focus transition-all duration-200 disabled:opacity-50"
                    />
                  </motion.div>
                )}

                {/* Work Email field */}
                <div className="space-y-1">
                  <label className="text-xs font-ui text-white/70 block pl-1">
                    Work email
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="you@company.com"
                    disabled={isSubmitting}
                    className="w-full h-[46px] px-4 rounded-full bg-white/[0.035] border border-white/[0.10] text-sm text-white placeholder-white/40 focus:outline-none input-luminous-focus transition-all duration-200 disabled:opacity-50"
                  />
                </div>

                {/* Password field with toggle */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between pl-1 pr-1">
                    <label className="text-xs font-ui text-white/70 block">
                      Password
                    </label>
                    {mode === "register" && (
                      <span className={`text-[11px] font-ui transition-colors ${isPasswordValid ? "text-emerald-400" : "text-white/40"}`}>
                        {isPasswordValid ? (
                          <span className="inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Minimum met
                          </span>
                        ) : (
                          "At least 8 characters"
                        )}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder={mode === "register" ? "Minimum 8 characters" : "Enter your password"}
                      disabled={isSubmitting}
                      className="w-full h-[46px] pl-4 pr-11 rounded-full bg-white/[0.035] border border-white/[0.10] text-sm text-white placeholder-white/40 focus:outline-none input-luminous-focus transition-all duration-200 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[48px] mt-2 rounded-full bg-white text-black font-ui font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#f0f0f0] active:scale-[0.99] transition-all shadow-md duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>{mode === "signin" ? "Signing in…" : "Creating account…"}</span>
                    </div>
                  ) : (
                    <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px bg-white/[0.08]" />
                <span className="font-ui text-[11px] text-white/[0.35]">or</span>
                <div className="flex-1 h-px bg-white/[0.08]" />
              </div>

              {/* Google Sign-in: Explicitly indicates not configured in this build */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  disabled
                  className="w-full h-[44px] rounded-full bg-white/[0.04] border border-white/[0.08] text-white/40 font-ui font-medium text-xs flex items-center justify-center gap-2.5 cursor-not-allowed select-none"
                  title="Google sign-in is not configured in this build"
                >
                  <svg className="w-4 h-4 shrink-0 opacity-40 grayscale" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-white/50 border border-white/[0.06]">
                    Not configured
                  </span>
                </button>
                <p className="text-[11px] text-white/35 text-center leading-normal">
                  Google sign-in is not configured in this build. Please use work email.
                </p>
              </div>

              {/* Mode switch helper link */}
              <div className="text-center text-xs font-ui text-white/50 pt-1">
                {mode === "signin" ? (
                  <span>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      disabled={isSubmitting}
                      className="text-white hover:underline font-medium ml-1 cursor-pointer transition-colors"
                    >
                      Create account
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signin")}
                      disabled={isSubmitting}
                      className="text-white hover:underline font-medium ml-1 cursor-pointer transition-colors"
                    >
                      Sign in
                    </button>
                  </span>
                )}
              </div>

              {/* Legal Copy */}
              <p className="text-center text-[11px] text-white/[0.35] leading-relaxed pt-1">
                By continuing, you agree to LeadForge&apos;s{" "}
                <span className="text-white/60 hover:underline cursor-pointer">
                  Terms
                </span>{" "}
                and{" "}
                <span className="text-white/60 hover:underline cursor-pointer">
                  Privacy Policy
                </span>
                .
              </p>
            </motion.div>
          </div>
        </div>

        {/* Bottom Left Microcopy & Viewport Footer */}
        <motion.footer
          className="w-full flex items-center justify-between text-[11px] text-white/[0.32] pt-4"
          variants={entranceVariant}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.55 }}
        >
          <div className="flex items-center gap-4">
            <span className="font-ui">LeadForge v1</span>
            <span>•</span>
            <span className="font-ui">AI sales intelligence</span>
          </div>

          <div className="hidden sm:block font-mono text-[10px] text-white/[0.28]">
            DETERMINISTIC SCORING ENGINE • REAL-TIME AUDIT LOG
          </div>
        </motion.footer>
      </div>
    </div>
  );
};
