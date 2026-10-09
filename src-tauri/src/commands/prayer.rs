use tauri::State;

use crate::scheduler::PrayerTimeEntry;
use crate::state::AppState;

#[tauri::command]
pub fn set_prayer_times(state: State<'_, AppState>, times: Vec<PrayerTimeEntry>) -> Result<(), String> {
    state.scheduler.lock().map_err(|e| e.to_string())?.prayer_times = times;
    Ok(())
}
