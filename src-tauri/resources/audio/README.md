# Adhan audio files

Bundled adhan recordings, packaged into the app at build time through the resource mapping in `tauri.conf.json`.

## Included reciters

| File | Reciter | Length |
|------|---------|--------|
| `adhan-makkah.mp3` | Makkah (default) | 3 min 21 s |
| `adhan-madinah.mp3` | Madinah | 1 min 36 s |
| `adhan-alaqsa.mp3` | Al-Aqsa | 3 min 45 s |
| `adhan-abdul-basit.mp3` | Abdul Basit | 3 min 26 s |
| `adhan-minshawi.mp3` | Minshawi | 3 min 55 s |
| `adhan-egypt.mp3` | Egypt | 3 min 3 s |

## Source and licence

The six files are byte-identical to the recordings listed under Sunni on the [PrayTimes.org adhan audio page](https://praytimes.org/docs/adhan), checked by MD5 against `https://praytimes.org/audio/sunni/`. Their ID3 tags name `www.PrayTimes.org` as composer and "Adhan - Sunni" as album.

That page publishes the recordings without a licence: on 10 October 2026 it carries only the notice "© 2007–2026 PrayTimes.org". The MIT licence PrayTimes.org gives its calculation code does not mention them, and an older copy of the site's wiki pages showed a CC BY-NC 3.0 footer that has not been confirmed for the audio. The recordings are therefore not covered by this repository's MIT licence, and their redistribution terms are not recorded. Confirm the terms with the site before distributing a build outside personal use.

## File naming

```
adhan-{identifier}.mp3
```

To add a reciter, place the MP3 here and add a matching entry to `RECITERS` in `src/lib/constants.ts`.

## Format

Mono MP3 at 8 kbps and 11,025 Hz, which is telephone-grade audio. rodio's Symphonia decoder plays it without trouble, but a higher-quality source would sound clearly better.
