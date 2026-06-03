# Install Mind Scope as an app (with icon)

Mind Scope can be used as an **installable app** on your phone or computer — not only in a browser tab.

---

## Option 1: Install on your phone (easiest — no App Store)

This uses a **PWA** (Progressive Web App). You get a **Mind Scope icon** on your home screen.

### Requirements
- The app must be served over **HTTPS** (or `localhost` while testing).
- Use Chrome (Android) or Safari (iPhone).

### Steps — Android
1. Deploy or run the built app (`npm run build` then host the `dist` folder, or use a host like Netlify/Vercel).
2. Open the site in **Chrome**.
3. Tap **Install app** in the banner, or menu → **Install app** / **Add to Home screen**.
4. The **Mind Scope** icon appears on your home screen.

### Steps — iPhone / iPad
1. Open the site in **Safari** (not Chrome).
2. Tap the **Share** button (square with arrow).
3. Tap **Add to Home Screen**.
4. Name it **Mind Scope** → **Add**.

### On your computer (Chrome / Edge)
1. Open the site.
2. Click the **install icon** in the address bar, or use **Install app** in the banner.
3. Mind Scope opens in its own window with your icon in the taskbar/dock.

### Develop locally
```bash
npm install
npm run dev
```
PWA install works best after `npm run build && npm run preview` on `http://localhost:4173`.

---

## Option 2: Real App Store / Play Store app (Capacitor)

This wraps your web app in a **native** iOS/Android project with the same icon.

### One-time setup
```bash
cd "/Users/gs-privv/App Project"
npm install
npm run build:app
```

This builds the web app and syncs into the native projects.

**Android:** the `android/` folder is already in the repo. After code changes, run `npm run build:app` again.

**iOS:** one-time setup on a Mac (CocoaPods required):
```bash
brew install cocoapods
npm run build:app
npx cap add ios
```

### iPhone (needs a Mac + Xcode)
```bash
npm run cap:ios
```
- In Xcode: set your **Team** (Apple ID) under Signing.
- Connect an iPhone or use the Simulator.
- Click **Run** to install on the device.
- To publish: **Product → Archive** → App Store Connect.

### Android (needs Android Studio)
```bash
npm run cap:android
```
- Wait for Gradle sync.
- Run on an emulator or device.
- To publish: **Build → Generate Signed Bundle/APK** → Google Play Console.

### After code changes
```bash
npm run build:app
```
Then run again from Xcode or Android Studio.

### App icon
Icons are generated from `public/icons/icon.svg`:
```bash
npm run icons
```
Native projects use these when you sync. For store-quality icons, replace assets in:
- `android/app/src/main/res/` (mipmap folders)
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

---

## Regenerate icons
```bash
npm run icons
```
Creates `public/icons/icon-180.png`, `icon-192.png`, `icon-512.png`, and maskable icon.

---

## Summary

| Method | Icon on home screen | App Store |
|--------|---------------------|-----------|
| PWA (Add to Home Screen) | Yes | No |
| Capacitor (Xcode / Android Studio) | Yes | Yes (you publish) |

For most users, **Option 1 (PWA)** is enough. Use **Option 2** if you need a listing on the Apple App Store or Google Play.
