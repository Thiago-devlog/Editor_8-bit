# 8-Bit Dither Studio

<p align="center">
  <img src="docs/retro-editor-hero.svg" alt="8-Bit Dither Studio hero artwork" width="1000" />
</p>

<p align="center">
  <a href="https://editor-8-bit.vercel.app/" target="_blank">
    <img alt="Live demo" src="https://img.shields.io/badge/Live%20Demo-Open%20App-00d084?style=for-the-badge&logo=vercel" />
  </a>
  <img alt="React" src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript" />
  <img alt="Canvas API" src="https://img.shields.io/badge/Canvas-2D%20Pipeline-111827?style=for-the-badge&logo=html5" />
  <img alt="Windows 98 UI" src="https://img.shields.io/badge/UI-Windows%2098-8ecae6?style=for-the-badge" />
</p>

A retro-styled front-end graphics processor that turns images, GIFs, and short videos into low-resolution, pixel-art compositions using real-time dithering, palette quantization, and CRT-inspired effects — all in the browser with the HTML5 Canvas API.

## Overview

This project recreates the aesthetic of classic 8-bit and early-90s digital imaging tools while keeping the workflow practical: upload a source file, apply a pixelated pipeline, adjust the output, and export a frame as PNG or record a processed clip as WebM.

The experience is intentionally designed as a Windows 98 desktop-inspired workstation, making the app feel like a nostalgic “retro media studio” rather than a generic image filter demo.

## Highlights

- Real-time pixel-art downscaling with adjustable target resolution
- Dithering modes:
  - Bayer 4x4
  - Bayer 8x8
  - Floyd-Steinberg
  - Atkinson
- Palette presets inspired by retro hardware:
  - Game Boy
  - CGA
  - Cyberpunk
  - Vaporwave
  - Full-color quantization
- Brightness, contrast, saturation, and chromatic aberration adjustments
- CRT scanline simulation and retro UI framing
- Support for image, GIF, and video media
- One-click PNG export and WebM capture from the processed canvas

## Screenshots

<p align="center">
  <img src="docs/retro-editor-capture.svg" alt="Screenshot capture in retro desktop UI" width="900" />
</p>

<p align="center">
  <img src="docs/retro-editor-feature-grid.svg" alt="Feature grid" width="900" />
</p>

## Stack

- React 19
- TypeScript
- Vite
- HTML5 Canvas 2D API
- CSS with a Windows 98-inspired design language
- `gifuct-js` for animated GIF decoding

## Project structure

```text
.
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── engine/
│   ├── index.css
│   ├── main.tsx
│   └── types/
├── docs/
│   ├── retro-editor-hero.svg
│   ├── retro-editor-capture.svg
│   └── retro-editor-feature-grid.svg
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── README.md
```

## Architecture

The processing pipeline is intentionally modular:

- `src/App.tsx` hosts the desktop-shell experience and the media upload flow.
- `src/components/CanvasPlayer.tsx` handles playback, drag-and-drop media loading, exports, and capture.
- `src/components/ControlsPanel.tsx` exposes the digital signal controls for the user.
- `src/engine/videoPipelineEngine.ts` orchestrates the render loop and applies the processing pipeline to each frame.
- `src/engine/ditheringAlgorithms.ts` contains the image-processing algorithms and palette mapping logic.
- `src/types/pipeline.ts` defines the configuration model used by the app.

## Local development

```bash
npm install
npm run dev
```

Then open the local Vite URL printed in the terminal, usually:

```text
http://localhost:5173
```

## Production build

```bash
npm run build
```

## Live demo

- Production app: https://editor-8-bit.vercel.app/

## Why this project matters

This project blends UI, visual design, and graphics engineering into a single front-end experience. It is a strong portfolio artifact because it demonstrates:

- real browser-side image processing without a backend
- creative interaction design tied to technical constraints
- control over rendering performance and visual output
- a polished product identity that feels like a complete software experience, not a toy demo

## License

MIT
