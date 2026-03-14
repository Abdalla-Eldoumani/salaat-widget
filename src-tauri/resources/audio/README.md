# Adhan Audio Files

Place MP3 adhan recordings here. They get bundled into the app at build time.

## File naming

```
adhan-{identifier}.mp3
```

Examples: `adhan-makkah.mp3`, `adhan-madinah.mp3`

## Sourcing

Every recording needs a clear license. Public domain, Creative Commons, or explicit written permission from the copyright holder.

Do not include recordings ripped from apps, YouTube, or streaming services.

For development, any short MP3 renamed to `adhan-makkah.mp3` works as a placeholder.

## Format

MP3, 128kbps minimum. rodio's Symphonia decoder handles standard MP3 without issues.
