# Vaporwave Audio Visualizer

An audio-reactive generative art piece that creates real-time vaporwave landscapes based on music playing in the background. Built with Next.js, React, and the Web Audio API.

## Features

- 🎵 **Real-time audio capture** - Uses your microphone to analyze any audio playing
- 🎨 **Generative vaporwave art** - Classic retro aesthetic with gradient skies, glowing sun, layered mountains, and perspective grids
- 🎛️ **8 customizable controls**:
  - Wave Propagation
  - Color Intensity
  - Mountain Sensitivity
  - Grid Distortion
  - Glow Effect
  - Speed Smoothing
  - Bass Boost
  - Scanlines

- 🔊 **Frequency analysis** - Separates audio into bass, mid, and treble ranges for nuanced reactions

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

4. Click "Start" and allow microphone access when prompted

5. Play music and watch the visualization react!

## Deploy to Vercel via GitHub

### Step 1: Push to GitHub

1. Initialize git repository:
```bash
git init
git add .
git commit -m "Initial commit: Vaporwave audio visualizer"
```

2. Create a new repository on GitHub (https://github.com/new)

3. Link and push to GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

**Option A: Vercel Dashboard (Easiest)**

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"
6. Your app will be live in ~2 minutes!

**Option B: Vercel CLI**

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts and your site will be deployed

## Browser Permissions

The app requires microphone access to analyze audio. Make sure to:
- Allow microphone permissions when prompted
- Use HTTPS (Vercel provides this automatically)
- Use a modern browser (Chrome, Firefox, Safari, Edge)

## How It Works

1. **Audio Capture** - Uses `navigator.mediaDevices.getUserMedia()` to access the microphone
2. **Frequency Analysis** - Web Audio API's `AnalyserNode` splits audio into frequency ranges
3. **Smoothing** - Audio values are smoothed to prevent jittery visuals
4. **Canvas Rendering** - Real-time generative art drawn on HTML5 Canvas
5. **Audio Reactivity** - Different visual elements respond to different frequency ranges:
   - Bass → Mountain movement, grid propagation
   - Mid → Color shifts, wave motion
   - High → Particle intensity, sky colors

## Tech Stack

- **Next.js 14** - React framework
- **React 18** - UI library
- **Tailwind CSS** - Styling
- **Web Audio API** - Audio analysis
- **Canvas API** - Graphics rendering
- **Lucide React** - Icons

## Customization

Edit `/components/VaporwaveAudioVisualizer.js` to:
- Adjust color palettes (search for gradient definitions)
- Modify visual elements (mountains, grid, sun)
- Add new audio-reactive parameters
- Change animation timing and smoothing

## Troubleshooting

**Microphone not working:**
- Check browser permissions
- Ensure site is served via HTTPS
- Try a different browser

**Visualization not reacting:**
- Ensure audio is actually playing
- Increase volume
- Adjust sensitivity sliders
- Turn down "Speed Smoothing"

## License

MIT License - Feel free to use and modify!
