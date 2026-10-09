import Page from './Page';

// The Tauri bridge is missing when the front end is opened in an ordinary browser, and every
// setting and prayer time depends on it.
export default function DesktopOnly() {
  return (
    <Page>
      <main className="flex h-full flex-col justify-center gap-3 p-6">
        <h1 className="font-display text-xl font-bold text-ink">Open Salaat Widget as a desktop app</h1>
        <p className="text-sm text-muted">
          This page needs the Tauri shell. Run <code className="text-gold-hi">pnpm tauri dev</code> to open it in its own window.
        </p>
      </main>
    </Page>
  );
}
