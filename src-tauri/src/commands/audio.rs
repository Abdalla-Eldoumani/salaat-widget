use tauri::{AppHandle, Emitter, Manager, State};

use crate::state::{AppState, TrayState};
use crate::tray::update_tray_icon;

/// Event the widget listens to so its mute button follows changes made from the tray.
pub const MUTE_EVENT: &str = "mute-changed";

/// Single path for every mute change (widget button, tray menu): stops a playing adhan,
/// updates the tray icon and tells the widget.
pub fn apply_mute(app: &AppHandle, muted: bool) -> Result<(), String> {
    let state = app.state::<AppState>();
    *state.muted.lock().map_err(|e| e.to_string())? = muted;

    if muted {
        if let Some(handle) = state.audio.get() {
            handle.stop()?;
        }
    }

    let tray = TrayState::resting(muted);
    *state.tray_state.lock().map_err(|e| e.to_string())? = tray;
    update_tray_icon(app, tray);

    app.emit(MUTE_EVENT, muted).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_mute(app: AppHandle, muted: bool) -> Result<(), String> {
    apply_mute(&app, muted)
}

#[tauri::command]
pub fn get_mute(state: State<'_, AppState>) -> Result<bool, String> {
    let m = state.muted.lock().map_err(|e| e.to_string())?;
    Ok(*m)
}
