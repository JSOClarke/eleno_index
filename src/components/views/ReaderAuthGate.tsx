import React, { useState } from "react";
import { AuthModal } from "@/components/layout/AuthModal";
import { ReaderErrorBoundary } from "@/components/reader/ReaderErrorBoundary";
import { SignInNotice } from "@/components/views/SignInNotice";

interface ReaderAuthGateProps {
  loading: boolean;
  isAuthenticated: boolean;
  onSignIn: (email: string, password: string) => Promise<unknown>;
  onSignUp: (email: string, password: string) => Promise<unknown>;
  children: React.ReactNode;
}

/** Blocks reader routes until the session is resolved and a user is present. */
export const ReaderAuthGate: React.FC<ReaderAuthGateProps> = ({
  loading,
  isAuthenticated,
  onSignIn,
  onSignUp,
  children,
}) => {
  const [authOpen, setAuthOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center font-mono text-xs text-[#666666]">
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <SignInNotice
          title="Reader"
          message="Sign in to read this book and keep your reading progress."
          onSignIn={() => setAuthOpen(true)}
        />
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          onSignIn={onSignIn}
          onSignUp={onSignUp}
        />
      </div>
    );
  }

  return <ReaderErrorBoundary>{children}</ReaderErrorBoundary>;
};
