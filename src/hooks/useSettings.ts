import { useState, useEffect, useCallback, useRef } from 'react';
import { LazyStore } from '@tauri-apps/plugin-store';
import type { SalaatSettings } from '../types';
import { DEFAULT_SETTINGS } from '../lib/constants';

interface UseSettingsResult {
  settings: SalaatSettings;
  loading: boolean;
  updateSetting: <K extends keyof SalaatSettings>(key: K, value: SalaatSettings[K]) => Promise<void>;
}

const STORE_PATH = 'settings.json';

// Singleton store instance - shared across hook calls
let storeInstance: LazyStore | null = null;

function getStore(): LazyStore {
  if (!storeInstance) {
    storeInstance = new LazyStore(STORE_PATH, {
      autoSave: 100,
      defaults: DEFAULT_SETTINGS as unknown as Record<string, unknown>,
    });
  }
  return storeInstance;
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<SalaatSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function loadSettings() {
      const store = getStore();
      const loaded = { ...DEFAULT_SETTINGS };

      try {
        for (const [key, value] of await store.entries()) {
          // Keys from older versions that no longer exist are ignored.
          if (key in DEFAULT_SETTINGS && value !== undefined) Object.assign(loaded, { [key]: value });
        }
      } catch (err) {
        console.error('could not read saved settings, using defaults', err);
      }

      setSettings(loaded);
      setLoading(false);
    }

    loadSettings();
  }, []);

  // The screen changes at once; a failed write is logged and the choice lasts until restart.
  const updateSetting = useCallback(async <K extends keyof SalaatSettings>(
    key: K,
    value: SalaatSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    try {
      await getStore().set(key, value);
    } catch (err) {
      console.error(`could not save ${key}`, err);
    }
  }, []);

  return { settings, loading, updateSetting };
}
