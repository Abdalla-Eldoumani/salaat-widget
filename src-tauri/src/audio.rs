use std::fs::File;
use std::io::BufReader;
use std::path::PathBuf;
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

use rodio::{Decoder, OutputStream, OutputStreamHandle, Sink};
use tauri::{AppHandle, Manager};

use crate::state::{AppState, TrayState};
use crate::tray::update_tray_icon;

/// Audio file keys shipped under `resources/audio/`. The frontend's RECITERS
/// map (src/lib/constants.ts) is the source of truth for the UI, but the
/// backend validates against this list before joining `reciter` into a file
/// path so a malformed string from IPC can't escape the resource directory.
pub const ALLOWED_RECITERS: &[&str] = &[
    "adhan-makkah",
    "adhan-madinah",
    "adhan-alaqsa",
    "adhan-abdul-basit",
    "adhan-minshawi",
    "adhan-egypt",
];

pub fn is_known_reciter(reciter: &str) -> bool {
    ALLOWED_RECITERS.contains(&reciter)
}

/// How often the audio thread checks whether the adhan has finished.
const POLL: Duration = Duration::from_millis(500);

enum AudioCommand {
    Play(PathBuf),
    Stop,
}

/// Handle to a dedicated audio thread. OutputStream is !Send so it must
/// live on its own thread. We talk to it through an mpsc channel.
pub struct AudioHandle {
    tx: mpsc::Sender<AudioCommand>,
}

impl AudioHandle {
    /// The output device is opened on the first `Play`, and again after a failure, so a
    /// machine that starts with no audio device (autostart at login) still plays later.
    pub fn spawn(app: AppHandle) -> Self {
        let (tx, rx) = mpsc::channel::<AudioCommand>();

        thread::spawn(move || {
            let mut output: Option<(OutputStream, OutputStreamHandle)> = None;
            let mut sink: Option<Sink> = None;

            loop {
                match rx.recv_timeout(POLL) {
                    Ok(AudioCommand::Play(path)) => {
                        if let Some(s) = sink.take() {
                            s.stop();
                        }
                        sink = start_playback(&mut output, &path);
                        if sink.is_none() {
                            report_finished(&app);
                        }
                    }
                    Ok(AudioCommand::Stop) => {
                        if let Some(s) = sink.take() {
                            s.stop();
                        }
                    }
                    Err(mpsc::RecvTimeoutError::Timeout) => {
                        if sink.as_ref().is_some_and(Sink::empty) {
                            sink = None;
                            report_finished(&app);
                        }
                    }
                    Err(mpsc::RecvTimeoutError::Disconnected) => return,
                }
            }
        });

        Self { tx }
    }

    pub fn play(&self, path: &std::path::Path) -> Result<(), String> {
        self.tx
            .send(AudioCommand::Play(path.to_path_buf()))
            .map_err(|e| format!("audio thread disconnected: {e}"))
    }

    pub fn stop(&self) -> Result<(), String> {
        self.tx
            .send(AudioCommand::Stop)
            .map_err(|e| format!("audio thread disconnected: {e}"))
    }
}

/// A stale device handle (headphones unplugged, default device changed) fails at `Sink::try_new`,
/// so one retry reopens the default device before giving up.
fn start_playback(output: &mut Option<(OutputStream, OutputStreamHandle)>, path: &std::path::Path) -> Option<Sink> {
    let file = File::open(path).map_err(|e| eprintln!("adhan file {}: {e}", path.display())).ok()?;
    let source = Decoder::new(BufReader::new(file)).map_err(|e| eprintln!("adhan decode: {e}")).ok()?;

    for attempt in 0..2 {
        if output.is_none() {
            match OutputStream::try_default() {
                Ok(pair) => *output = Some(pair),
                Err(e) => {
                    eprintln!("no audio output device: {e}");
                    return None;
                }
            }
        }
        let handle = &output.as_ref()?.1;
        match Sink::try_new(handle) {
            Ok(sink) => {
                sink.append(source);
                return Some(sink);
            }
            Err(e) => {
                eprintln!("audio sink (attempt {}): {e}", attempt + 1);
                *output = None;
            }
        }
    }
    None
}

/// Return the tray icon to its resting state once playback ends or fails to start.
fn report_finished(app: &AppHandle) {
    let state = app.state::<AppState>();
    let muted = *state.muted.lock().unwrap();
    let mut tray = state.tray_state.lock().unwrap();
    if *tray == TrayState::Playing {
        *tray = TrayState::resting(muted);
        update_tray_icon(app, *tray);
    }
}
