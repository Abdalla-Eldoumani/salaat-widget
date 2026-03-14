use std::sync::Mutex;

use crate::audio::AudioHandle;
use crate::scheduler::SchedulerState;

#[derive(Clone, Copy, PartialEq)]
pub enum TrayState {
    Default,
    Playing,
    Muted,
}

pub struct AppState {
    pub audio: Mutex<Option<AudioHandle>>,
    pub muted: Mutex<bool>,
    pub scheduler: Mutex<SchedulerState>,
    pub tray_state: Mutex<TrayState>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            audio: Mutex::new(AudioHandle::try_new()),
            muted: Mutex::new(false),
            scheduler: Mutex::new(SchedulerState::new()),
            tray_state: Mutex::new(TrayState::Default),
        }
    }
}
