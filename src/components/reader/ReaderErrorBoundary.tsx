import React from "react";

interface ReaderErrorBoundaryState {
  error: Error | null;
}

/** Keeps a reader render failure from becoming an unexplained white screen. */
export class ReaderErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ReaderErrorBoundaryState
> {
  state: ReaderErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ReaderErrorBoundaryState {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <h1 className="font-serif text-2xl font-bold text-[#111111]">
          The reader could not load
        </h1>
        <p className="max-w-md font-mono text-xs leading-relaxed text-[#666666]">
          {this.state.error.message}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="border border-[#111111] bg-[#B8FF01] px-4 py-2 font-mono text-xs font-bold cursor-pointer"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="border border-[#111111] bg-white px-4 py-2 font-mono text-xs font-bold cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>
    );
  }
}
