import { useState, useEffect, useCallback, useRef } from 'react';
import { LazyStore } from '@tauri-apps/plugin-store';
import type { SalaatSettings } from '../types';
import { DEFAULT_SETTINGS } from '../lib/constants';

interface UseSettingsResult {
  settings: SalaatSettings;
  loading: boolean;
  updateSetting: <K extends keyof SalaatSettings>(key: K, value: SalaatSettings[K]) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const STORE_PATH = 'settings.json';

// Singleton store instance — shared across hook calls
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
        const entries = await store.entries();
        for (const [key, val] of entries) {
          if (key in loaded && val !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (loaded as any)[key] = val;
          }
        }
      } catch {
        // Fall back to defaults if store read fails entirely
      }

      setSettings(loaded);
      setLoading(false);
    }

    loadSettings();
  }, []);

  const updateSetting = useCallback(async <K extends keyof SalaatSettings>(
    key: K,
    value: SalaatSettings[K],
  ) => {
    const store = getStore();
    await store.set(key, value);
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(async () => {
    const store = getStore();
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await store.set(key, value);
    }
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, loading, updateSetting, resetSettings };
}
