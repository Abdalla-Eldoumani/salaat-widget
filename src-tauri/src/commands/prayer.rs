use tauri::State;

use crate::scheduler::PrayerTimeEntry;
use crate::state::AppState;

#[tauri::command]
pub fn set_prayer_times(state: State<'_, AppState>, times: Vec<PrayerTimeEntry>) -> Result<(), String> {
    let mut scheduler = state.scheduler.lock().map_err(|e| e.to_string())?;
    scheduler.prayer_times = times;
    scheduler.last_triggered = None;
    Ok(())
}
