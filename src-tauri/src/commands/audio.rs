use tauri::{AppHandle, State};

use crate::state::{AppState, TrayState};
use crate::tray::update_tray_icon;

#[tauri::command]
pub fn set_mute(app: AppHandle, state: State<'_, AppState>, muted: bool) -> Result<(), String> {
    *state.muted.lock().map_err(|e| e.to_string())? = muted;
    if muted {
        if let Some(handle) = state.audio.get() {
            handle.stop()?;
        }
    }

    let tray = TrayState::resting(muted);
    *state.tray_state.lock().map_err(|e| e.to_string())? = tray;
    update_tray_icon(&app, tray);

    Ok(())
}

#[tauri::command]
pub fn get_mute(state: State<'_, AppState>) -> Result<bool, String> {
    let m = state.muted.lock().map_err(|e| e.to_string())?;
    Ok(*m)
}
