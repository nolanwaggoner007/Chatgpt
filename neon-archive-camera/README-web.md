# Neon Archive Camera — web app

A mobile-first iPhone camera web app with a 4:3 viewfinder and independently adjustable recording treatments. The optional controls for the soft reference look, scanlines, amber burned-in HUD, Day filming, and Night filming are saved on the device and can be combined. Day and Night effects stack when both are on. Settings lock while recording so the clip keeps a consistent look.

The app requests 24 fps and uses either 960×720 for the soft look or 1440×1080 for the clean look; actual camera resolution and browser encoding depend on iOS/Safari.

## Run it on iPhone

Open the live site in **Safari** and allow camera/microphone access. Add it to the Home Screen with Share → **Add to Home Screen** → Add. [Apple's guide](https://support.apple.com/guide/iphone/turn-a-website-into-an-app-in-safari-iph42ab2f3a7/ios) has current steps.

Tap **Enable Camera**, set your recording switches, then tap **Record**. Stop the clip and tap **Save Clip**. If iOS opens the movie preview, use Share → **Save Video** to put it in Photos.

## Files

- `index.html` — app interface and independent look switches
- `style.css` — styling
- `app.js` — camera capture, effects, and recording
- `manifest.webmanifest` and `icon.svg` — Home Screen metadata/icon

The app is deployed at https://neon-archive-camera.onrender.com. The look is an original approximation of the supplied footage; results depend on light and autofocus.

