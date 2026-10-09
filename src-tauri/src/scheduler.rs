use std::collections::HashSet;

use chrono::{DateTime, Utc};
use serde::Deserialize;
use tauri::{AppHandle, Emitter, Manager};
use tokio::time::{interval, Duration};

use crate::state::{AppState, TrayState};
use crate::tray::update_tray_icon;

/// A prayer fires when the clock is 0 to 59 seconds past its time, so a 5 s tick cannot miss it.
const TRIGGER_WINDOW_SECS: i64 = 60;

/// How long a fired prayer is remembered. The frontend re-sends the schedule on every settings
/// change, so the memory has to outlive a re-send; a day is longer than any trigger window.
const FIRED_RETENTION_SECS: i64 = 24 * 60 * 60;

#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PrayerTimeEntry {
    pub name: String,
    pub time: String,
    pub has_adhan: bool,
    pub send_notification: bool,
    pub reciter: String,
}

/// One prayer at one instant, so the same prayer on a later day is a different key.
type FiredKey = (String, i64);

pub struct SchedulerState {
    pub prayer_times: Vec<PrayerTimeEntry>,
    /// Kept across `set_prayer_times`, which is why a re-sent schedule cannot fire twice.
    pub fired: HashSet<FiredKey>,
}

impl SchedulerState {
    pub fn new() -> Self {
        Self {
            prayer_times: Vec::new(),
            fired: HashSet::new(),
        }
    }
}

/// The first entry that is due at `now` and has not fired for that instant.
pub fn find_due<'a>(
    entries: &'a [PrayerTimeEntry],
    fired: &HashSet<FiredKey>,
    now: DateTime<Utc>,
) -> Option<(&'a PrayerTimeEntry, FiredKey)> {
    entries.iter().find_map(|entry| {
        let at = DateTime::parse_from_rfc3339(&entry.time).ok()?.to_utc();
        let age = (now - at).num_seconds();
        let key = (entry.name.clone(), at.timestamp());
        ((0..TRIGGER_WINDOW_SECS).contains(&age) && !fired.contains(&key)).then_some((entry, key))
    })
}

pub fn start_scheduler(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        let mut tick = interval(Duration::from_secs(5));
        loop {
            tick.tick().await;
            check_prayer_times(&app);
        }
    });
}

fn display_name(name: &str) -> &str {
    match name {
        "fajr" => "Fajr",
        "dhuhr" => "Dhuhr",
        "asr" => "Asr",
        "maghrib" => "Maghrib",
        "isha" => "Isha",
        other => other,
    }
}

fn check_prayer_times(app: &AppHandle) {
    let state = app.state::<AppState>();
    let now = Utc::now();

    // Find the due entry and mark it fired under one lock, so a concurrent re-send cannot slip between.
    let due = {
        let mut scheduler = state.scheduler.lock().unwrap();
        scheduler
            .fired
            .retain(|(_, at)| now.timestamp() - at < FIRED_RETENTION_SECS);
        let found = find_due(&scheduler.prayer_times, &scheduler.fired, now)
            .map(|(entry, key)| (entry.clone(), key));
        if let Some((_, key)) = &found {
            scheduler.fired.insert(key.clone());
        }
        found
    };

    let Some((entry, _)) = due else { return };

    let _ = app.emit(
        "prayer-time",
        serde_json::json!({ "prayer": entry.name, "time": entry.time }),
    );

    if entry.send_notification {
        use tauri_plugin_notification::NotificationExt;
        let _ = app
            .notification()
            .builder()
            .title("Prayer Time")
            .body(format!("It's time for {} prayer", display_name(&entry.name)))
            .show();
    }

    let muted = *state.muted.lock().unwrap();
    if muted || !entry.has_adhan || !crate::audio::is_known_reciter(&entry.reciter) {
        return;
    }
    let audio = state.audio.lock().unwrap();
    let (Some(handle), Ok(resource_dir)) = (audio.as_ref(), app.path().resource_dir()) else {
        return;
    };
    let path = resource_dir.join(format!("audio/{}.mp3", entry.reciter));
    if handle.play(&path).is_ok() {
        // Show "playing" tray icon during adhan
        *state.tray_state.lock().unwrap() = TrayState::Playing;
        update_tray_icon(app, TrayState::Playing);

        // Revert to default after playback (~2min typical adhan)
        let app_clone = app.clone();
        tauri::async_runtime::spawn(async move {
            tokio::time::sleep(Duration::from_secs(120)).await;
            let st = app_clone.state::<AppState>();
            let current = *st.tray_state.lock().unwrap();
            // Only revert if still in Playing state (not manually muted since)
            if current == TrayState::Playing {
                let muted_now = *st.muted.lock().unwrap();
                let new_state = if muted_now { TrayState::Muted } else { TrayState::Default };
                *st.tray_state.lock().unwrap() = new_state;
                update_tray_icon(&app_clone, new_state);
            }
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn entry(name: &str, time: &str) -> PrayerTimeEntry {
        PrayerTimeEntry {
            name: name.into(),
            time: time.into(),
            has_adhan: true,
            send_notification: true,
            reciter: "adhan-makkah".into(),
        }
    }

    fn at(s: &str) -> DateTime<Utc> {
        DateTime::parse_from_rfc3339(s).unwrap().to_utc()
    }

    #[test]
    fn fires_inside_the_window_and_not_before_or_after() {
        let entries = [entry("asr", "2026-10-09T22:18:44.000Z")];
        let none = HashSet::new();
        assert!(find_due(&entries, &none, at("2026-10-09T22:18:43Z")).is_none());
        assert!(find_due(&entries, &none, at("2026-10-09T22:18:44Z")).is_some());
        assert!(find_due(&entries, &none, at("2026-10-09T22:19:43Z")).is_some());
        assert!(find_due(&entries, &none, at("2026-10-09T22:19:44Z")).is_none());
    }

    #[test]
    fn a_fired_prayer_is_not_due_again_when_the_same_schedule_is_sent_again() {
        let now = at("2026-10-09T22:18:50Z");
        let first = [entry("asr", "2026-10-09T22:18:44.000Z")];
        let mut fired = HashSet::new();
        let (_, key) = find_due(&first, &fired, now).unwrap();
        fired.insert(key);

        // The frontend replaces the schedule after a settings change; the memory of what fired stays.
        let resent = [entry("asr", "2026-10-09T22:18:44.000Z")];
        assert!(find_due(&resent, &fired, now).is_none());
    }

    #[test]
    fn the_same_prayer_on_the_next_day_is_a_new_event() {
        let mut fired = HashSet::new();
        fired.insert(("fajr".to_string(), at("2026-10-09T12:00:00Z").timestamp()));
        let entries = [entry("fajr", "2026-10-10T12:01:00.000Z")];
        assert!(find_due(&entries, &fired, at("2026-10-10T12:01:10Z")).is_some());
    }

    #[test]
    fn skips_entries_with_unreadable_times() {
        let entries = [entry("isha", "not a time"), entry("asr", "2026-10-09T22:18:44.000Z")];
        let (due, _) = find_due(&entries, &HashSet::new(), at("2026-10-09T22:18:50Z")).unwrap();
        assert_eq!(due.name, "asr");
    }
}
