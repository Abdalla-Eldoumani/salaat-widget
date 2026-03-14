use chrono::DateTime;
use serde::Deserialize;
use tauri::{AppHandle, Emitter, Manager};
use tokio::time::{interval, Duration};

use crate::state::{AppState, TrayState};
use crate::tray::update_tray_icon;

#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PrayerTimeEntry {
    pub name: String,
    pub time: String,
    pub has_adhan: bool,
    pub send_notification: bool,
    pub reciter: String,
}

pub struct SchedulerState {
    pub prayer_times: Vec<PrayerTimeEntry>,
    pub last_triggered: Option<String>,
}

impl SchedulerState {
    pub fn new() -> Self {
        Self {
            prayer_times: Vec::new(),
            last_triggered: None,
        }
    }
}

pub fn start_scheduler(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        let mut tick = interval(Duration::from_secs(30));
        loop {
            tick.tick().await;
            check_prayer_times(&app);
        }
    });
}

fn check_prayer_times(app: &AppHandle) {
    let state = app.state::<AppState>();
    let now = chrono::Utc::now();

    // Read prayer times under the lock, find one that's due
    let triggered = {
        let scheduler = state.scheduler.lock().unwrap();

        let mut found = None;
        for entry in &scheduler.prayer_times {
            let prayer_time = match DateTime::parse_from_rfc3339(&entry.time) {
                Ok(t) => t.to_utc(),
                Err(_) => continue,
            };

            let diff = (now - prayer_time).num_seconds();
            // Trigger if 0-29 seconds past the prayer time
            if diff >= 0 && diff < 30 {
                if scheduler.last_triggered.as_deref() == Some(&entry.name) {
                    continue;
                }
                found = Some((entry.name.clone(), entry.time.clone(), entry.has_adhan, entry.send_notification, entry.reciter.clone()));
                break;
            }
        }

        found
    };

    let (name, time_str, has_adhan, send_notification, reciter) = match triggered {
        Some(t) => t,
        None => return,
    };

    // Mark as triggered
    {
        let mut scheduler = state.scheduler.lock().unwrap();
        scheduler.last_triggered = Some(name.clone());
    }

    // Emit event to frontend
    let _ = app.emit(
        "prayer-time",
        serde_json::json!({
            "prayer": name,
            "time": time_str,
        }),
    );

    // Send native notification (if enabled by user)
    if send_notification {
        let display_name = match name.as_str() {
            "fajr" => "Fajr",
            "sunrise" => "Sunrise",
            "dhuhr" => "Dhuhr",
            "asr" => "Asr",
            "maghrib" => "Maghrib",
            "isha" => "Isha",
            _ => &name,
        };

        use tauri_plugin_notification::NotificationExt;
        let _ = app
            .notification()
            .builder()
            .title("Prayer Time")
            .body(format!("It's time for {display_name} prayer"))
            .show();
    }

    // Play adhan if not muted and this prayer has adhan
    let muted = *state.muted.lock().unwrap();
    if !muted && has_adhan {
        let audio = state.audio.lock().unwrap();
        if let Some(handle) = audio.as_ref() {
            if let Ok(resource_dir) = app.path().resource_dir() {
                let path = resource_dir.join(format!("audio/{reciter}.mp3"));
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
        }
    }
}
