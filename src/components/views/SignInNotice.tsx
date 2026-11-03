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
    <h2 className="text-lg font-bold text-[#111111]">{title}</h2>
    <div className="flex flex-col items-center gap-3 border border-dashed border-[#111111] px-6 py-16 text-center">
      <p className="max-w-sm font-mono text-xs leading-relaxed text-[#666666]">{message}</p>
      <button
        type="button"
        onClick={onSignIn}
        className="border border-[#111111] bg-[#B8FF01] px-4 py-2 font-mono text-xs font-bold text-[#111111] cursor-pointer"
      >
        Sign in →
      </button>
    </div>
  </div>
);
