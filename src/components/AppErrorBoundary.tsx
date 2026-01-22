import React from "react";

type Props = {
  children: React.ReactNode;
  title?: string;
};

type State = {
  hasError: boolean;
  error?: Error;
};

/**
 * Prevents a hard-white-screen by rendering a friendly fallback UI if any route crashes.
 */
export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Keep this as console.error so it surfaces in user debugging.
    console.error("AppErrorBoundary caught an error:", error);
    console.error(info);
  }

  private reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <section className="w-full max-w-xl rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold">
            {this.props.title ?? "Something went wrong"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The page crashed while rendering. This usually indicates a runtime error in a component.
          </p>

          {this.state.error?.message ? (
            <pre className="mt-4 max-h-56 overflow-auto rounded-md bg-muted p-3 text-xs text-foreground">
              {this.state.error.message}
            </pre>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              onClick={this.reset}
            >
              Try again
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
            >
              Go to home
            </a>
          </div>
        </section>
      </main>
    );
  }
}
