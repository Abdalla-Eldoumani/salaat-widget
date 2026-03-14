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
        <path d="M12 1l1.09 2.41a7 7 0 0 1 2.18.9l2.55-.77.9 1.56-1.46 2.18a7 7 0 0 1 0 2.38l1.46 2.18-.9 1.56-2.55-.77a7 7 0 0 1-2.18.9L12 23l-1.09-2.41a7 7 0 0 1-2.18-.9l-2.55.77-.9-1.56 1.46-2.18a7 7 0 0 1 0-2.38L5.28 12.16l.9-1.56 2.55.77a7 7 0 0 1 2.18-.9L12 1z" />
      </svg>
    </button>
  );
}
