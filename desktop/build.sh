#!/usr/bin/env bash
# Builds dist/GoingToTheEnd.exe from ../index.html. Runs on Linux or macOS with Go 1.24+ and python3 + Pillow.
set -euo pipefail
cd "$(dirname "$0")"
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

rm -rf web && mkdir -p web/fonts
# fonts are bundled so the game looks the same offline
css=$(curl -fsSL -A "$UA" 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=IBM+Plex+Mono:wght@400;500&display=swap')
i=0
while read -r u; do
  i=$((i + 1))
  curl -fsSL "$u" -o "web/fonts/f$i.woff2"
  css=${css//"$u"/"f$i.woff2"}
done < <(grep -o 'https://fonts.gstatic.com/[^)]*' <<<"$css")
printf '%s\n' "$css" > web/fonts/fonts.css

# swap the Google Fonts links for the bundled stylesheet
grep -v 'fonts.googleapis.com\|fonts.gstatic.com\|claude:viewport-fit-sides' ../index.html \
  | sed 's|<title>Going to the End</title>|<title>Going to the End</title>\n<link rel="stylesheet" href="fonts/fonts.css">|' > web/index.html

python3 make_icon.py icon.ico
go run github.com/akavel/rsrc@v0.10.2 -manifest app.manifest -ico icon.ico -arch amd64 -o rsrc_windows_amd64.syso

mkdir -p ../dist
GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -ldflags '-H windowsgui -s -w' -o ../dist/GoingToTheEnd.exe .
ls -lh ../dist/GoingToTheEnd.exe
