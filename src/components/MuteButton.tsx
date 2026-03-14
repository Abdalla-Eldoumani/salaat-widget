import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface MuteButtonProps {
  className?: string;
}

export default function MuteButton({ className = '' }: MuteButtonProps) {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    invoke<boolean>('get_mute').then(setMuted).catch(() => {});
  }, []);

  async function toggle() {
    const next = !muted;
    try {
      await invoke('set_mute', { muted: next });
      setMuted(next);
    } catch {
      // ignore — state stays as-is
    }
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors
        ${muted ? 'text-[#4A5568] hover:text-[#7B89A1]' : 'text-[#7B89A1] hover:text-[#E8E2D6]'}
        focus:outline-none focus:ring-1 focus:ring-[#C8A84E] ${className}`}
      aria-label={muted ? 'Unmute adhan' : 'Mute adhan'}
      title={muted ? 'Unmute adhan' : 'Mute adhan'}
    >
      {muted ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </button>
  );
}
