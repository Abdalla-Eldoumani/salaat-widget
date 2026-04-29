import { Window } from '@tauri-apps/api/window';

interface HideButtonProps {
  className?: string;
}

export default function HideButton({ className = '' }: HideButtonProps) {
  async function hide() {
    try {
      await Window.getCurrent().hide();
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={hide}
      className={`flex items-center justify-center w-6 h-6 rounded-full text-[#7B89A1] hover:text-[#E8E2D6] hover:bg-[rgba(200,168,78,0.10)] transition-colors
        focus:outline-none focus:ring-1 focus:ring-[#C8A84E] ${className}`}
      aria-label="Hide widget"
      title="Hide widget (click tray icon to show)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
}
