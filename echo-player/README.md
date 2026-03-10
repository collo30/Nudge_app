# Echo Player

A beautiful, minimalist music player built with React, Tailwind CSS, and Capacitor.

## Features

- **Discover**: Swipe through new music recommendations.
- **Library**: Play your local music files.
- **Visualizer**: Real-time audio visualization.
- **Mini Player**: Persistent playback controls.
- **PWA Support**: Installable on mobile devices.

## Getting Started

### Web Development

```bash
npm install
npm run dev
```

### Android Development

1.  Add Android platform:
    ```bash
    npx cap add android
    ```

2.  Sync web assets to Android:
    ```bash
    npm run build
    npx cap sync
    ```

3.  Open in Android Studio:
    ```bash
    npx cap open android
    ```

4.  Run on device/emulator from Android Studio.

## Tech Stack

- **React**: UI Library
- **Vite**: Build tool
- **Tailwind CSS v4**: Styling
- **Capacitor**: Native runtime
- **Zustand**: State management
- **Framer Motion**: Animations
- **Lucide React**: Icons
