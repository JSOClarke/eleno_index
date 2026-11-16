import React from "react";

interface SignInNoticeProps {
  title: string;
  message: string;
  onSignIn: () => void;
}

/** Full-page prompt for routes that are meaningless without an account. */
export const SignInNotice: React.FC<SignInNoticeProps> = ({
  title,
  message,
  onSignIn,
}) => (
  <div className="space-y-4">
    <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">{title}</h2>
    <div className="flex flex-col items-center gap-3.5 rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-16 text-center">
      <p className="max-w-sm text-sm leading-relaxed text-slate-500">{message}</p>
      <button
        type="button"
        onClick={onSignIn}
        className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-600 transition cursor-pointer shadow-xs"
      >
        Sign in
      </button>
    </div>
  </div>
);
