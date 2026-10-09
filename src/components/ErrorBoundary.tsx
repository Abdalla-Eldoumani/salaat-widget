import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import Button from './ui/Button';
import Page from './Page';

interface ErrorBoundaryState {
  error: Error | null;
}

// The webview is the only view the app has, so an uncaught render error would leave a blank
// window with no way to recover or to say what happened.
export default class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('render failed', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <Page>
        <main role="alert" className="flex h-full flex-col justify-center gap-3 p-6">
          <h1 className="font-display text-xl font-bold text-ink">Salaat Widget could not start</h1>
          <p className="text-sm text-muted">{error.message}</p>
          <div>
            <Button onClick={() => window.location.reload()}>Reload</Button>
          </div>
        </main>
      </Page>
    );
  }
}
