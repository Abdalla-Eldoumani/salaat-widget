use tauri::{AppHandle, Manager, State};

use crate::audio::is_known_reciter;
use crate::state::{AppState, TrayState};
use crate::tray::update_tray_icon;

#[tauri::command]
pub fn play_adhan(app: AppHandle, state: State<'_, AppState>, reciter: String) -> Result<(), String> {
    if !is_known_reciter(&reciter) {
        return Err(format!("unknown reciter: {reciter}"));
    }

    let resource_dir = app.path().resource_dir().map_err(|e| e.to_string())?;
    let path = resource_dir.join(format!("audio/{reciter}.mp3"));

    if !path.exists() {
        return Err(format!("audio file not found: {}", path.display()));
    }

    let audio = state.audio.lock().map_err(|e| e.to_string())?;
    match audio.as_ref() {
        Some(handle) => handle.play(&path),
        None => Err("no audio device available".to_string()),
    }
}

#[tauri::command]
pub fn stop_adhan(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    let audio = state.audio.lock().map_err(|e| e.to_string())?;
    if let Some(handle) = audio.as_ref() {
        handle.stop()?;
    }

    // Revert tray icon from Playing if needed
    let current = *state.tray_state.lock().unwrap();
    if current == TrayState::Playing {
        let muted = *state.muted.lock().unwrap();
        let new_state = if muted { TrayState::Muted } else { TrayState::Default };
        *state.tray_state.lock().unwrap() = new_state;
        update_tray_icon(&app, new_state);
    }

    Ok(())
}

#[tauri::command]
pub fn set_mute(app: AppHandle, state: State<'_, AppState>, muted: bool) -> Result<(), String> {
    let mut m = state.muted.lock().map_err(|e| e.to_string())?;
    *m = muted;
    if muted {
        let audio = state.audio.lock().map_err(|e| e.to_string())?;
        if let Some(handle) = audio.as_ref() {
            handle.stop()?;
        }
    }

    // Update tray icon to reflect mute state
    let new_tray = if muted { TrayState::Muted } else { TrayState::Default };
    *state.tray_state.lock().unwrap() = new_tray;
    update_tray_icon(&app, new_tray);

    Ok(())
}

#[tauri::command]
pub fn get_mute(state: State<'_, AppState>) -> Result<bool, String> {
    let m = state.muted.lock().map_err(|e| e.to_string())?;
    Ok(*m)
}
