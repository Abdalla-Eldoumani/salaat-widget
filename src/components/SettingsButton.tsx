interface SettingsButtonProps {
  onClick: () => void;
  className?: string;
}

export default function SettingsButton({ onClick, className = '' }: SettingsButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-6 h-6 rounded-full text-[#7B89A1] hover:text-[#E8E2D6] transition-colors
        focus:outline-none focus:ring-1 focus:ring-[#C8A84E] ${className}`}
      aria-label="Open settings"
      title="Settings"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    </button>
  );
}
