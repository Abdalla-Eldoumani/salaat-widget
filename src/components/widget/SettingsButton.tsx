import IconButton from '../ui/IconButton';
import { GearIcon } from '../ui/icons';

// The marker lets the app hand keyboard focus back here when settings close.
export default function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <IconButton label="Open settings" data-settings-trigger="" onClick={onClick}>
      <GearIcon />
    </IconButton>
  );
}
