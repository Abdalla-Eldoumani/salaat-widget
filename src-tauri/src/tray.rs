use tauri::{
    image::Image,
    menu::{MenuBuilder, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};

use crate::state::{AppState, TrayState};

const SHOW_HIDE_ID: &str = "show_hide";
const MUTE_ID: &str = "mute";
const QUIT_ID: &str = "quit";

const TRAY_ID: &str = "salaat-tray";

const ICON_DEFAULT: &[u8] = include_bytes!("../icons/tray-default.png");
const ICON_PLAYING: &[u8] = include_bytes!("../icons/tray-playing.png");
const ICON_MUTED: &[u8] = include_bytes!("../icons/tray-muted.png");

pub fn create_tray(app: &AppHandle) -> tauri::Result<()> {
    let show_hide = MenuItem::with_id(app, SHOW_HIDE_ID, "Show/Hide", true, None::<&str>)?;
    let mute = MenuItem::with_id(app, MUTE_ID, "Mute Adhan", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, QUIT_ID, "Quit", true, None::<&str>)?;

    let menu = MenuBuilder::new(app)
        .item(&show_hide)
        .separator()
        .item(&mute)
        .separator()
        .item(&quit)
        .build()?;

    let icon = Image::from_bytes(ICON_DEFAULT).unwrap_or_else(|_| Image::new(&[], 0, 0));

    TrayIconBuilder::with_id(TRAY_ID)
        .icon(icon)
        .menu(&menu)
        .tooltip("Salaat Widget")
        .show_menu_on_left_click(false)
        .on_menu_event(move |app, event| {
            handle_menu_event(app, event.id().as_ref());
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                toggle_window_visibility(tray.app_handle());
            }
        })
        .build(app)?;

    Ok(())
}

/// Switch the tray icon to match the current state. Call this after mute/play changes.
pub fn update_tray_icon(app: &AppHandle, state: TrayState) {
    let bytes = match state {
        TrayState::Default => ICON_DEFAULT,
        TrayState::Playing => ICON_PLAYING,
        TrayState::Muted => ICON_MUTED,
    };

    if let Some(tray) = app.tray_by_id(TRAY_ID) {
        if let Ok(icon) = Image::from_bytes(bytes) {
            let _ = tray.set_icon(Some(icon));
        }

        let tooltip = match state {
            TrayState::Default => "Salaat Widget",
            TrayState::Playing => "Salaat Widget - Adhan playing",
            TrayState::Muted => "Salaat Widget - Muted",
        };
        let _ = tray.set_tooltip(Some(tooltip));
    }
}

fn handle_menu_event(app: &AppHandle, id: &str) {
    match id {
        SHOW_HIDE_ID => toggle_window_visibility(app),
        MUTE_ID => toggle_mute(app),
        QUIT_ID => app.exit(0),
        _ => {}
    }
}

fn toggle_window_visibility(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}

fn toggle_mute(app: &AppHandle) {
    let state = app.state::<AppState>();
    let new_muted;
    {
        let mut muted = state.muted.lock().unwrap();
        *muted = !*muted;
        new_muted = *muted;
    }

    // Update tray icon to reflect mute state
    let new_tray = if new_muted { TrayState::Muted } else { TrayState::Default };
    *state.tray_state.lock().unwrap() = new_tray;
    update_tray_icon(app, new_tray);
}
