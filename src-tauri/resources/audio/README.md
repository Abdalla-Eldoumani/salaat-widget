# Adhan Audio Files

Bundled adhan recordings. These get packaged into the app at build time via `tauri.conf.json` resource mapping.

## Included reciters

| File | Reciter |
|------|---------|
| `adhan-makkah.mp3` | Makkah |
| `adhan-madinah.mp3` | Madinah |
| `adhan-alaqsa.mp3` | Al-Aqsa |
| `adhan-abdul-basit.mp3` | Abdul Basit |
| `adhan-minshawi.mp3` | Minshawi |
| `adhan-egypt.mp3` | Egypt |

## Source

Recordings from [praytimes.org](https://praytimes.org/). These are widely-distributed adhan recordings shared for Islamic educational and devotional use.

## File naming

```
adhan-{identifier}.mp3
```

To add a new reciter, place the MP3 here and add a matching entry to `RECITERS` in `src/lib/constants.ts`.

## Format

MP3, 128kbps minimum. rodio's Symphonia decoder handles standard MP3 without issues.
