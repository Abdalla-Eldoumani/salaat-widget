import { useCallback, useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { Window } from '@tauri-apps/api/window';
import { usePrayerTimes } from './hooks/usePrayerTimes';
import { useCountdown } from './hooks/useCountdown';
import { useWindowDock, type Overlay } from './hooks/useWindowDock';
import { useGeolocation } from './hooks/useGeolocation';
import { useSettings } from './hooks/useSettings';
import type { PrayerTimeEventPayload } from './types';
import PrayerTimesBar from './components/PrayerTimesBar';
import PrayerTimesSidebar from './components/PrayerTimesSidebar';
import PrayerTimesCompact from './components/PrayerTimesCompact';
import SettingsPanel from './components/SettingsPanel';
import Onboarding from './components/Onboarding';

function App() {
  const { settings, loading, updateSetting } = useSettings();
  const geo = useGeolocation(settings.autoDetectLocation);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const overlay: Overlay | null = !settings.onboardingComplete ? 'onboarding' : settingsOpen ? 'settings' : null;
  const { layout, onDragEnd } = useWindowDock({
    enabled: !loading,
    savedEdge: settings.dockEdge,
    overlay,
    onEdgeChange: (edge) => {
      updateSetting('dockEdge', edge).catch((err) => console.error('could not save dock edge', err));
    },
  });
  const [flashing, setFlashing] = useState(false);

  // Use detected location if auto-detect is on, otherwise use stored settings
  const latitude = settings.autoDetectLocation ? geo.location.latitude : settings.latitude;
  const longitude = settings.autoDetectLocation ? geo.location.longitude : settings.longitude;

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

  const rawCountdown = useCountdown(prayerTimes.nextPrayerTime);
  const countdown = settings.showCountdown ? rawCountdown : '';

  // When geolocation detects a new location, persist it to settings
  useEffect(() => {
    if (settings.autoDetectLocation && geo.location.city !== 'Unknown') {
      updateSetting('latitude', geo.location.latitude);
      updateSetting('longitude', geo.location.longitude);
      updateSetting('timezone', geo.location.timezone);
      updateSetting('locationName', `${geo.location.city}, ${geo.location.countryCode}`);
    }
  }, [geo.location, settings.autoDetectLocation, updateSetting]);

  // Restore alwaysOnTop preference (config defaults to true, but user may have turned it off)
  useEffect(() => {
    if (!loading) {
      Window.getCurrent().setAlwaysOnTop(settings.alwaysOnTop).catch(() => {});
    }
  }, [loading, settings.alwaysOnTop]);

  // Show the widget and flash when a prayer time arrives
  useEffect(() => {
    const unlisten = listen<PrayerTimeEventPayload>('prayer-time', () => {
      const appWindow = Window.getCurrent();
      appWindow.show().catch(() => {});
      appWindow.setFocus().catch(() => {});
      appWindow.requestUserAttention(1).catch(() => {});
      setFlashing(true);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // Auto-clear flash after animation completes (10 seconds)
  useEffect(() => {
    if (!flashing) return;
    const timer = setTimeout(() => setFlashing(false), 10_000);
    return () => clearTimeout(timer);
  }, [flashing]);

  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  // Escape key closes settings
  useEffect(() => {
    if (!settingsOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSettings();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [settingsOpen, closeSettings]);

  if (loading) return null;

  if (!settings.onboardingComplete) {
    return (
      <Onboarding
        settings={settings}
        onUpdate={updateSetting}
        geoLocation={geo.location}
        geoDetecting={geo.detecting}
        onGeoDetect={geo.detect}
      />
    );
  }

  if (settingsOpen) {
    return (
      <SettingsPanel
        settings={settings}
        onUpdate={updateSetting}
        onClose={closeSettings}
        geoLocation={settings.autoDetectLocation ? geo.location : null}
        geoDetecting={geo.detecting}
        onGeoDetect={geo.detect}
      />
    );
  }

  return (
    <div className={`h-full w-full bg-[rgba(15,23,42,0.88)] backdrop-blur-xl border border-[rgba(200,168,78,0.06)] rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.3)] khatam-pattern${flashing ? ' animate-prayer-flash' : ''}`}>
      {layout === 'horizontal' && (
        <PrayerTimesBar
          prayerTimes={prayerTimes}
          countdown={countdown}
          timeFormat={settings.timeFormat}
          onDragEnd={onDragEnd}
          onSettingsOpen={() => setSettingsOpen(true)}
        />
      )}
      {layout === 'vertical' && (
        <PrayerTimesSidebar
          prayerTimes={prayerTimes}
          countdown={countdown}
          timeFormat={settings.timeFormat}
          onDragEnd={onDragEnd}
          onSettingsOpen={() => setSettingsOpen(true)}
        />
      )}
      {layout === 'compact' && (
        <PrayerTimesCompact
          prayerTimes={prayerTimes}
          countdown={countdown}
          timeFormat={settings.timeFormat}
          onDragEnd={onDragEnd}
          onSettingsOpen={() => setSettingsOpen(true)}
        />
      )}
    </div>
  );
}

export default App;
