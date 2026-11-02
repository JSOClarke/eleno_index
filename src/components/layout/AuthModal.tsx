import React, { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<unknown>;
  onSignUp: (email: string, password: string) => Promise<unknown>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSignIn,
  onSignUp,
}) => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signin") {
        await onSignIn(email, password);
      } else {
        await onSignUp(email, password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-[#111111] shadow-[6px_6px_0px_#111111] w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[#111111] pb-3">
          <div className="flex items-center gap-2 font-mono text-sm font-bold">
            <span className="bg-[#B8FF01] px-1.5 py-0.5">/es</span>
            <span>{mode === "signin" ? "SIGN IN TO INDEX" : "CREATE INDEX ACCOUNT"}</span>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs px-2 py-0.5 border border-[#111111] hover:bg-[#F4F4F2] cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase text-[#555555] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#111111] px-3 py-2 font-mono text-sm outline-none focus:bg-[#B8FF01]/10"
              placeholder="reader@example.com"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase text-[#555555] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#111111] px-3 py-2 font-mono text-sm outline-none focus:bg-[#B8FF01]/10"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="border border-red-600 bg-red-50 px-3 py-2 font-mono text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-[#111111] text-[#B8FF01] font-mono text-xs font-bold uppercase tracking-wider border border-[#111111] hover:bg-[#222222] cursor-pointer"
          >
            {submitting
              ? "Processing..."
              : mode === "signin"
              ? "Sign In →"
              : "Create Account →"}
          </button>
        </form>

        <div className="border-t border-[#E2E2DF] pt-3 flex justify-between items-center font-mono text-xs">
          <span className="text-[#666666]">
            {mode === "signin" ? "Need an account?" : "Already registered?"}
          </span>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="underline font-semibold text-[#111111] cursor-pointer"
          >
            {mode === "signin" ? "Register" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};
