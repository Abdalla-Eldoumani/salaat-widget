mod audio;
mod commands;
mod scheduler;
mod state;
mod tray;

use state::AppState;
use tauri::Manager;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            commands::audio::set_mute,
            commands::audio::get_mute,
            commands::prayer::set_prayer_times,
        ])
        .setup(|app| {
            let _ = app.state::<AppState>().audio.set(audio::AudioHandle::spawn(app.handle().clone()));
            tray::create_tray(app.handle())?;

            // A hotkey another program already holds must not stop the widget from starting.
            let handle = app.handle().clone();
            if let Err(e) = app.global_shortcut().on_shortcut("ctrl+shift+p", move |_app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    tray::toggle_window_visibility(&handle);
                }
            }) {
                eprintln!("could not register ctrl+shift+p: {e}");
            }

            // Start the prayer time scheduler
            scheduler::start_scheduler(app.handle().clone());

            Ok(())
        })
        .on_window_event(|window, event| {
            // Hide instead of close - the app lives in the tray
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
