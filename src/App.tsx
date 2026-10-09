import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { listen } from '@tauri-apps/api/event';
import { Window } from '@tauri-apps/api/window';
import { usePrayerTimes } from './hooks/usePrayerTimes';
import { useWindowDock, type Overlay } from './hooks/useWindowDock';
import { useGeolocation } from './hooks/useGeolocation';
import { useSettings } from './hooks/useSettings';
import { PRAYER_NAMES } from './lib/constants';
import { locationUpdates } from './lib/location';
import type { PrayerTimeEventPayload } from './types';
import Page from './components/Page';
import Widget from './components/widget/Widget';
import SettingsPanel from './components/settings/SettingsPanel';
import Onboarding from './components/onboarding/Onboarding';

// How long the frame stays lit after a prayer time arrives.
const ARRIVAL_MS = 10_000;
// Controls keep their own clicks; everything else on the card drags the window.
const INTERACTIVE = 'button, a, input, select, textarea, label, [role="switch"], [role="radio"]';

function startDrag(event: MouseEvent<HTMLElement>) {
  if (event.button !== 0 || (event.target as Element).closest(INTERACTIVE)) return;
  Window.getCurrent().startDragging().catch((err) => console.error('could not start dragging', err));
}

function App() {
  const { settings, loading, updateSetting } = useSettings();
  // Onboarding shows a detected location even before the setting is saved.
  const geo = useGeolocation(!loading && (settings.autoDetectLocation || !settings.onboardingComplete));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const overlay: Overlay | null = !settings.onboardingComplete ? 'onboarding' : settingsOpen ? 'settings' : null;
  const { layout } = useWindowDock({
    enabled: !loading,
    savedEdge: settings.dockEdge,
    overlay,
    onEdgeChange: (edge) => {
      updateSetting('dockEdge', edge).catch((err) => console.error('could not save dock edge', err));
    },
  });
  const [arrived, setArrived] = useState<string | null>(null);

  // The saved location is used until a real detection succeeds, and again if detection fails.
  const detected = settings.autoDetectLocation ? geo.location : null;
  const latitude = detected?.latitude ?? settings.latitude;
  const longitude = detected?.longitude ?? settings.longitude;

  const prayerTimes = usePrayerTimes({
    latitude,
    longitude,
    method: settings.calculationMethod,
    madhab: settings.madhab,
    highLatitudeRule: settings.highLatitudeRule,
    adhanEnabled: settings.adhanEnabled,
    adhanReciter: settings.adhanReciter,
    mutedPrayers: settings.mutedPrayers,
    notificationsEnabled: settings.notificationsEnabled,
  });

  // Keep the last real detection for the next launch. Onboarding saves the first value itself.
  const { onboardingComplete, latitude: savedLatitude, longitude: savedLongitude, locationName: savedName } = settings;
  useEffect(() => {
    if (!onboardingComplete) return;
    const changes = locationUpdates(detected, { latitude: savedLatitude, longitude: savedLongitude, locationName: savedName });
    const saves: Promise<void>[] = [];
    if (changes.latitude !== undefined) saves.push(updateSetting('latitude', changes.latitude));
    if (changes.longitude !== undefined) saves.push(updateSetting('longitude', changes.longitude));
    if (changes.locationName !== undefined) saves.push(updateSetting('locationName', changes.locationName));
    Promise.all(saves).catch((err) => console.error('could not save the detected location', err));
  }, [detected, onboardingComplete, savedLatitude, savedLongitude, savedName, updateSetting]);

  // Restore alwaysOnTop preference (config defaults to true, but user may have turned it off)
  useEffect(() => {
    if (!loading) {
      Window.getCurrent().setAlwaysOnTop(settings.alwaysOnTop).catch(() => {});
    }
  }, [loading, settings.alwaysOnTop]);

  // Show the widget and light the frame when a prayer time arrives. The window does not take
  // focus: the time can come while the user is typing somewhere else.
  useEffect(() => {
    const unlisten = listen<PrayerTimeEventPayload>('prayer-time', (event) => {
      Window.getCurrent().show().catch(() => {});
      setArrived(PRAYER_NAMES[event.payload.prayer]?.english ?? '');
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    if (arrived === null) return;
    const timer = setTimeout(() => setArrived(null), ARRIVAL_MS);
    return () => clearTimeout(timer);
  }, [arrived]);

  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  useEffect(() => {
    if (!settingsOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSettings();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [settingsOpen, closeSettings]);

  // Closing settings puts keyboard focus back on the button that opened them.
  const settingsWasOpen = useRef(false);
  useEffect(() => {
    if (settingsOpen) {
      settingsWasOpen.current = true;
    } else if (settingsWasOpen.current) {
      settingsWasOpen.current = false;
      document.querySelector<HTMLElement>('[data-settings-trigger]')?.focus();
    }
  }, [settingsOpen]);

  if (loading) return null;

  let screen;
  if (!settings.onboardingComplete) {
    screen = (
      <Page>
        <Onboarding
          settings={settings}
          onUpdate={updateSetting}
          geoLocation={geo.location}
          geoDetecting={geo.detecting}
          geoError={geo.error}
          onGeoDetect={geo.detect}
        />
      </Page>
    );
  } else if (settingsOpen) {
    screen = (
      <Page>
        <SettingsPanel
          settings={settings}
          onUpdate={updateSetting}
          onClose={closeSettings}
          geoLocation={detected}
          geoDetecting={geo.detecting}
          geoError={geo.error}
          onGeoDetect={geo.detect}
        />
      </Page>
    );
  } else {
    screen = (
      <Page arriving={arrived !== null} onMouseDown={startDrag}>
        <Widget
          layout={layout}
          prayerTimes={prayerTimes}
          showCountdown={settings.showCountdown}
          timeFormat={settings.timeFormat}
          onSettingsOpen={() => setSettingsOpen(true)}
        />
      </Page>
    );
  }

  return (
    <>
      <div role="status" className="sr-only">{arrived ? `Time for ${arrived}` : ''}</div>
      {screen}
    </>
  );
}

export default App;
