#!/usr/bin/env bash
# Encode an exercise clip for the app: square loop, WebM + MP4 (iOS), poster frame.
#
#   tools/encode_anim.sh <exercise-id> <source> [fps] [size]
#
# <source> is either a video file (any format ffmpeg reads) or a printf-style
# frame pattern such as frames/curl_%04d.png. Output lands in img/anim/.
# Then add the id to js/anims.js and bump the version.
set -euo pipefail
ID="${1:?exercise id, e.g. ar-db-curl}"
SRC="${2:?source video or frame pattern}"
FPS="${3:-12}"
SIZE="${4:-480}"
OUT="$(dirname "$0")/../img/anim"
mkdir -p "$OUT"
FF="${FFMPEG:-ffmpeg}"

# centre-crop to square, scale, strip audio
VF="crop='min(iw,ih)':'min(iw,ih)',scale=${SIZE}:${SIZE}:flags=lanczos"
case "$SRC" in
  *%0*d*) IN=(-framerate "$FPS" -i "$SRC") ;;
  *)      IN=(-i "$SRC") ;;
esac

"$FF" -hide_banner -loglevel error -y "${IN[@]}" -an -vf "$VF" -r "$FPS" \
  -c:v libx264 -profile:v main -pix_fmt yuv420p -crf 23 -movflags +faststart "$OUT/$ID.mp4"
"$FF" -hide_banner -loglevel error -y "${IN[@]}" -an -vf "$VF" -r "$FPS" \
  -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 "$OUT/$ID.webm"
"$FF" -hide_banner -loglevel error -y "${IN[@]}" -vf "$VF" -frames:v 1 -q:v 4 "$OUT/$ID.jpg"
ls -la "$OUT/$ID".*
