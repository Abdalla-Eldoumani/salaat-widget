use std::sync::{Mutex, OnceLock};

use crate::audio::AudioHandle;
use crate::scheduler::SchedulerState;

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum TrayState {
    Default,
    Playing,
    Muted,
}

impl TrayState {
    /// The icon to show when nothing is playing.
    pub fn resting(muted: bool) -> Self {
        if muted {
            TrayState::Muted
        } else {
            TrayState::Default
        }
    }
}

pub struct AppState {
    /// Set once from `setup`, because the audio thread needs the app handle to report back.
    pub audio: OnceLock<AudioHandle>,
    pub muted: Mutex<bool>,
    pub scheduler: Mutex<SchedulerState>,
    pub tray_state: Mutex<TrayState>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            audio: OnceLock::new(),
            muted: Mutex::new(false),
            scheduler: Mutex::new(SchedulerState::new()),
            tray_state: Mutex::new(TrayState::Default),
        }
    }
}
