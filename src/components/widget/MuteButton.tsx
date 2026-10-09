import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import IconButton from '../ui/IconButton';
import { SpeakerIcon, SpeakerMutedIcon } from '../ui/icons';

export default function MuteButton() {
  const [muted, setMuted] = useState(false);

  // The tray menu changes the same flag, so the button follows the backend's event instead of
  // trusting what it read at startup.
  useEffect(() => {
    let active = true;
    invoke<boolean>('get_mute')
      .then((value) => active && setMuted(value))
      .catch((err) => console.error('could not read the mute state', err));
    const stop = listen<boolean>('mute-changed', (event) => setMuted(event.payload));
    return () => {
      active = false;
      stop.then((fn) => fn());
    };
  }, []);

  async function toggle() {
    const next = !muted;
    try {
      await invoke('set_mute', { muted: next });
      setMuted(next);
    } catch (err) {
      console.error('could not change the mute state', err);
    }
  }

  return (
    <IconButton
      label="Mute adhan"
      title={muted ? 'Adhan is muted. Select to unmute.' : 'Mute adhan'}
      aria-pressed={muted}
      onClick={toggle}
    >
      {muted ? <SpeakerMutedIcon /> : <SpeakerIcon />}
    </IconButton>
  );
}
