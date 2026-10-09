import { Window } from '@tauri-apps/api/window';
import IconButton from '../ui/IconButton';
import { MinusIcon } from '../ui/icons';

export default function HideButton() {
  function hide() {
    Window.getCurrent().hide().catch((err) => console.error('could not hide the window', err));
  }

  return (
    <IconButton label="Hide widget" title="Hide widget (show it again from the tray icon or with Ctrl+Shift+P)" onClick={hide}>
      <MinusIcon />
    </IconButton>
  );
}
