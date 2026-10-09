import { useState } from 'react';
import { Window } from '@tauri-apps/api/window';
import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart';
import type { SalaatSettings, UpdateSetting } from '../../types';
import Section from '../ui/Section';
import Switch from '../ui/Switch';

interface SystemSectionProps {
  settings: SalaatSettings;
  onUpdate: UpdateSetting;
}

export default function SystemSection({ settings, onUpdate }: SystemSectionProps) {
  const [autostartError, setAutostartError] = useState<string | null>(null);
  const [onTopError, setOnTopError] = useState<string | null>(null);

  // The setting changes only after the system accepted the change, so the switch never
  // claims something that did not happen.
  async function setAutostart(next: boolean) {
    setAutostartError(null);
    try {
      if (next) await enable();
      else await disable();
      await onUpdate('autostart', await isEnabled());
    } catch (err) {
      setAutostartError(`Could not change launch at startup: ${String(err)}`);
    }
  }

  async function setAlwaysOnTop(next: boolean) {
    setOnTopError(null);
    try {
      await Window.getCurrent().setAlwaysOnTop(next);
      await onUpdate('alwaysOnTop', next);
    } catch (err) {
      setOnTopError(`Could not change always on top: ${String(err)}`);
    }
  }

  return (
    <Section title="System">
      <Switch label="Launch at startup" checked={settings.autostart} onChange={setAutostart} />
      {autostartError && <p role="alert" className="text-xs text-gold-hi">{autostartError}</p>}
      <Switch label="Keep above other windows" checked={settings.alwaysOnTop} onChange={setAlwaysOnTop} />
      {onTopError && <p role="alert" className="text-xs text-gold-hi">{onTopError}</p>}
      <p className="text-xs text-muted">Show or hide the widget: Ctrl+Shift+P. Close settings: Escape.</p>
    </Section>
  );
}
