# Neon Archive Camera — web app

This is a mobile-first camera web app with a retro-futurist 4:3 viewfinder and optional baked-in HUD/scanlines. It uses the iPhone browser camera and records the styled canvas plus microphone audio. Recording runs at a requested 24 fps; actual camera resolution and browser encoding depend on iOS/Safari.

## Run it on iPhone

Camera access requires a secure website (`https://`). The files must be hosted online; opening `index.html` directly from Files will not grant camera access. Upload this folder to any HTTPS static web host, then open its URL in **Safari** and allow camera/microphone access. To add it to the Home Screen: tap Share → **Add to Home Screen** → Add. [Apple's guide](https://support.apple.com/guide/iphone/turn-a-website-into-an-app-in-safari-iph42ab2f3a7/ios) has the current steps.

Tap **Enable Camera**, then **Record**. Stop recording, tap **Save Clip**, and if iOS opens the movie preview, use Share → **Save Video** to put it in Photos.

## Files

- `index.html` — app interface
- `style.css` — styling
- `app.js` — camera, viewfinder rendering, and recording
- `manifest.webmanifest` and `icon.svg` — Home Screen metadata/icon

The default option applies a low-resolution, soft-focus, cool-washed look with gentle highlight bloom to the saved clip. Turn it off for a cleaner 4:3 recording. The look is inspired by the supplied reference clip; results depend on light and camera autofocus. This app is not hosted yet; it needs a public HTTPS URL to run as an iPhone camera app. Safari's media recording support is based on WebKit's MediaRecorder implementation.


