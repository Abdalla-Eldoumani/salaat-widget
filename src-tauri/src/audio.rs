use std::fs::File;
use std::io::BufReader;
use std::path::PathBuf;
use std::sync::mpsc;
use std::thread;

use rodio::{Decoder, OutputStream, Sink};

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
    pub fn try_new() -> Option<Self> {
        let (tx, rx) = mpsc::channel::<AudioCommand>();

        thread::spawn(move || {
            let (_stream, stream_handle) = match OutputStream::try_default() {
                Ok(s) => s,
                Err(_) => return, // no audio device - thread exits silently
            };

            let mut sink: Option<Sink> = None;

            for cmd in rx {
                match cmd {
                    AudioCommand::Play(path) => {
                        if let Some(s) = sink.take() {
                            s.stop();
                        }
                        let file = match File::open(&path) {
                            Ok(f) => f,
                            Err(_) => continue,
                        };
                        let source = match Decoder::new(BufReader::new(file)) {
                            Ok(s) => s,
                            Err(_) => continue,
                        };
                        let new_sink = match Sink::try_new(&stream_handle) {
                            Ok(s) => s,
                            Err(_) => continue,
                        };
                        new_sink.append(source);
                        sink = Some(new_sink);
                    }
                    AudioCommand::Stop => {
                        if let Some(s) = sink.take() {
                            s.stop();
                        }
                    }
                }
            }
        });

        Some(Self { tx })
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
