# Aura Visuals

Real-time audio visualization experience built with Next.js 15, React 19, and Canvas 2D API. Transform your music into stunning visual patterns that dance and pulse with every beat.

![Aura Visuals](./visual.png)

## 🎵 Overview

Aura Visuals is a modern web application that provides immersive real-time audio visualization. The application analyzes audio frequency data using the Web Audio API and renders dynamic, customizable visualizations with various color palettes and adjustable parameters.

**Developer:** [Jaime Villegas](https://jvdevsolutions.com)

## ✨ Features

- **10 Unique Visualizers** - From geometric mandalas to particle systems, each with distinct visual styles
- **Real-time Audio Analysis** - Powered by Web Audio API with frequency band separation (low, mid, high)
- **8 Color Palettes** - Neon, Synthwave, Cosmic, Fire, Ocean, Forest, Sunset, and Purple themes
- **Customizable Parameters** - Fine-tune each visualizer with dynamic sliders for sensitivity, count, speed, and more
- **Retro-Futuristic UI** - LCD-inspired interface with glowing effects and vintage aesthetics
- **Song Library** - Pre-loaded tracks plus support for uploading your own audio files
- **Responsive Design** - Optimized for desktop and mobile experiences
- **Performance Optimized** - Canvas 2D rendering with lazy loading and code splitting

## 🏗️ Architecture

### Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **UI Library:** React 19
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4 with @tailwindcss/postcss
- **State Management:** Zustand
- **Audio Processing:** Web Audio API
- **Graphics:** Canvas 2D API
- **UI Components:** Radix UI (Select, Slider)
- **Icons:** Lucide React
- **Package Manager:** pnpm

### Project Structure

```
aura-visuals/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   └── songs/                # Song library endpoint
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Main visualizer page (/)
│   └── globals.css               # Global styles and animations
│
├── components/                   # React components
│   ├── canvas/                   # Canvas-related components
│   │   ├── GlobalAudioProvider.tsx  # Central audio data provider
│   │   └── VisualizerScene.tsx      # Main visualizer renderer
│   │
│   ├── dom/                      # DOM UI components
│   │   └── ControlPanel.tsx      # Main control panel with all controls
│   │
│   ├── ui/                       # Base UI components
│   │   ├── retro/                # Retro-themed UI components
│   │   │   ├── AboutModal.tsx    # About dialog with TV animation
│   │   │   ├── AnalogSlider.tsx  # Custom parameter slider
│   │   │   ├── ColorPaletteSelector.tsx  # Color palette picker
│   │   │   ├── LCDDisplay.tsx    # LCD-style display component
│   │   │   ├── NeonButton.tsx    # Glowing button component
│   │   │   ├── RetroPanel.tsx    # Panel container with effects
│   │   │   ├── SongLibraryLCD.tsx # Song selector with player controls
│   │   │   └── VisualizerSelector.tsx # Visualizer picker
│   │   │
│   │   ├── select.tsx            # Radix UI Select wrapper
│   │   └── slider.tsx            # Radix UI Slider wrapper
│   │
│   └── visualizers/              # Individual visualizer components
│       ├── CircularWaveform.tsx  # Circular audio waveform
│       ├── EnergyParticles.tsx   # Audio-reactive particles
│       ├── FrequencyBars2D.tsx   # Classic frequency bars
│       ├── GeometricMandala.tsx  # Rotating geometric patterns
│       ├── KaleidoscopeViz.tsx   # Mirror symmetry kaleidoscope
│       ├── NebulaCloud.tsx       # Glowing particle nebula
│       ├── ParticleCircle.tsx    # Circular particle system
│       ├── SpiralWaves.tsx       # Spiral wave animations
│       ├── StarField.tsx         # Audio-reactive starfield
│       └── SymmetryMirror.tsx    # Symmetrical waveform mirror
│
├── constants/                    # Application constants
│   └── visualizerRegistry.ts    # Lazy-loaded visualizer registry
│
├── lib/                          # Utility libraries
│   ├── audio/                    # Audio processing
│   │   └── AudioManager.ts       # Singleton audio manager
│   │
│   ├── hooks/                    # Custom React hooks
│   │   └── useContainerSize.ts   # ResizeObserver hook
│   │
│   └── utils/                    # Utility functions
│       ├── cn.ts                 # Class name utility (clsx + twMerge)
│       ├── colorUtils.ts         # Color manipulation utilities
│       └── throttle.ts           # Performance throttling
│
├── stores/                       # Zustand state stores
│   ├── audioStore.ts             # Audio playback and frequency data
│   └── visualizerStore.ts        # Visualizer config and parameters
│
└── public/                       # Static assets
    └── assets/                   # Audio files and images
```

## 🎨 Core System Architecture

### 1. Audio Processing Pipeline

#### AudioManager (Singleton Pattern)
Located in `lib/audio/AudioManager.ts`

**Responsibilities:**
- Manages Web Audio API context and nodes
- Loads and controls audio playback
- Analyzes frequency data in real-time
- Calculates frequency bands (low: 10-250Hz, mid: 250-4000Hz, high: 4000-16000Hz)

**Key Methods:**
```typescript
loadAudioFile(file: File)          // Load audio from file
play() / pause() / stop()          // Playback controls
getFrequencyData()                 // Returns frequency analysis
getCurrentTime() / setCurrentTime() // Seek controls
```

**Audio Context Setup:**
- **AnalyserNode:** 2048 FFT size for frequency analysis
- **GainNode:** Volume control
- **AudioBufferSourceNode:** Audio playback

#### GlobalAudioProvider
Located in `components/canvas/GlobalAudioProvider.tsx`

**Responsibilities:**
- Polls AudioManager at 60fps using requestAnimationFrame
- Updates Zustand audio store with frequency data
- Runs independently of visualizer rendering
- Centralizes audio data for all visualizers

**Data Flow:**
```
Audio File → AudioManager → GlobalAudioProvider → audioStore → Visualizers
```

### 2. State Management (Zustand)

#### Audio Store (`stores/audioStore.ts`)

**State:**
```typescript
{
  frequencyData: {
    low: number      // 10-250 Hz average
    mid: number      // 250-4000 Hz average
    high: number     // 4000-16000 Hz average
    rawData: Uint8Array  // Full frequency spectrum (0-255)
  },
  isPlaying: boolean,
  currentSong: string | null,
  currentTime: number,
  duration: number,
  isPanelExpanded: boolean
}
```

#### Visualizer Store (`stores/visualizerStore.ts`)

**State:**
```typescript
{
  activePalette: keyof COLOR_PALETTES,
  activeVisualizer: string,
  visualizerParams: Record<string, Record<string, number>>
}
```

**Color Palettes:**
- `neon` - Classic neon green/cyan/pink
- `synthwave` - Retro purple/pink gradient
- `cosmic` - Deep space blues/purples
- `fire` - Warm orange/red/yellow
- `ocean` - Cool blue/cyan tones
- `forest` - Green nature tones
- `sunset` - Warm orange/pink gradient
- `purple` - Purple/magenta spectrum

**Parameter System:**
Each visualizer defines its own configurable parameters:

```typescript
VISUALIZER_CONFIGS = {
  symmetrymirror: [
    { name: 'segments', label: 'Segments', min: 2, max: 16, step: 1, defaultValue: 4, category: 'visual' },
    { name: 'lineThickness', label: 'Line Thickness', min: 1, max: 10, step: 0.5, defaultValue: 2, category: 'visual' },
    // ... more parameters
  ],
  // ... other visualizers
}
```

**Parameter Categories:**
- `audio` - Audio reactivity (sensitivity, response)
- `visual` - Visual appearance (count, size, thickness)
- `motion` - Animation (speed, rotation)
- `color` - Color behavior (intensity, blend)

### 3. Visualizer System

#### Visualizer Registry (`constants/visualizerRegistry.ts`)

Uses React lazy loading for code splitting:

```typescript
export const VISUALIZER_REGISTRY = {
  symmetrymirror: {
    id: 'symmetrymirror',
    name: 'Symmetry Mirror',
    component: lazy(() => import('@/components/visualizers/SymmetryMirror')
      .then(module => ({ default: module.SymmetryMirror }))
    ),
  },
  // ... 9 more visualizers
}
```

**Benefits:**
- Only loads active visualizer code
- Reduces initial bundle size
- Faster page load times

#### Visualizer Scene (`components/canvas/VisualizerScene.tsx`)

**Responsibilities:**
- Dynamically loads active visualizer from registry
- Wraps in React Suspense for loading states
- Provides full-screen canvas container

#### Individual Visualizers

**Standard Pattern:**
```typescript
export function MyVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { activePalette, getVisualizerParams } = useVisualizerStore()
  const palette = COLOR_PALETTES[activePalette]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Resize canvas to fill container
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animationFrameId: number

    const render = () => {
      // Get visualizer-specific parameters
      const params = getVisualizerParams('myvisualizer')
      const sensitivity = params.sensitivity || 1.0

      // Get audio data (avoids re-renders)
      const { rawData, low, mid, high } = useAudioStore.getState().frequencyData

      // Clear canvas
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Render visualization using audio data and palette
      // ... drawing logic ...

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [activePalette, palette, getVisualizerParams])

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
}
```

**Key Concepts:**
- Use `useAudioStore.getState()` in render loop to avoid re-renders
- Access parameters via `getVisualizerParams(visualizerId)`
- Always clean up animation frames on unmount
- Handle canvas resize for responsive design

### 4. Available Visualizers

#### 1. **Symmetry Mirror** (`symmetrymirror`)
Creates mirrored waveform patterns with adjustable segments and line thickness.

**Parameters:**
- Segments (2-16)
- Line Thickness (1-10)
- Audio Sensitivity (0.1-3.0)

#### 2. **Frequency Bars** (`bars2d`)
Classic frequency spectrum analyzer with vertical bars.

**Parameters:**
- Bar Count (32-256)
- Audio Sensitivity (0.1-3.0)
- Bar Spacing (0-1)
- Smoothing (0-1)

#### 3. **Energy Particles** (`energyparticles`)
Audio-reactive particle system with physics.

**Parameters:**
- Particle Count (50-500)
- Particle Size (1-10)
- Audio Sensitivity (0.1-3.0)
- Trail Length (0-1)

#### 4. **Geometric Mandala** (`geometricmandala`)
Rotating geometric patterns that pulse with music.

**Parameters:**
- Segments (4-12)
- Layer Count (2-8)
- Rotation Speed (0-2)
- Audio Sensitivity (0.1-3.0)

#### 5. **Kaleidoscope** (`kaleidoscope`)
Mirror symmetry with ray patterns.

**Parameters:**
- Segments (4-12)
- Ray Count (20-80)
- Ray Length (0.3-1.0)
- Rotation Speed (0-2)
- Audio Sensitivity (0.1-3.0)

#### 6. **Particle Circle** (`particlecircle`)
Circular particle arrangement reactive to audio.

**Parameters:**
- Particle Count (30-200)
- Circle Radius (0.2-0.8)
- Particle Size (2-10)
- Audio Sensitivity (0.1-3.0)

#### 7. **Spiral Waves** (`spiralwaves`)
Spiraling wave patterns from center.

**Parameters:**
- Spiral Count (1-5)
- Wave Frequency (10-100)
- Rotation Speed (0-2)
- Audio Sensitivity (0.1-3.0)

#### 8. **Circular Waveform** (`circularwaveform`)
Audio waveform wrapped in a circle.

**Parameters:**
- Sample Points (100-500)
- Line Thickness (1-5)
- Radius (0.2-0.8)
- Audio Sensitivity (0.1-3.0)

#### 9. **Star Field** (`starfield`)
Audio-reactive starfield with depth.

**Parameters:**
- Star Count (100-1000)
- Speed (0.1-5.0)
- Star Size (1-5)
- Audio Sensitivity (0.1-3.0)

#### 10. **Nebula Cloud** (`nebulacloud`)
Glowing particle nebula with bloom effects.

**Parameters:**
- Particle Count (50-300)
- Particle Size (1-10)
- Bloom Intensity (0.5-3.0)
- Audio Sensitivity (0.1-3.0)

### 5. UI Components

#### Control Panel (`components/dom/ControlPanel.tsx`)

**Layout:**
- Collapsible header with About button
- Three-column grid (Visualizer | Audio Controls | Parameters)
- Responsive design with flexbox

**Features:**
- Visualizer selection
- Song library with play/pause controls
- Progress bar with seek functionality
- Color palette selector
- Dynamic parameter sliders based on active visualizer

#### About Modal (`components/ui/retro/AboutModal.tsx`)

**Features:**
- TV turn-on/off animations
- Language toggle (EN/ES)
- Technology stack display
- Developer credits with portfolio link
- Automatic music pause/resume

**Animations:**
```css
/* TV Turn On: Simulates CRT monitor power-on */
@keyframes tvOn {
  0% { transform: scaleX(0) scaleY(0.01); opacity: 0; }
  100% { transform: scaleX(1) scaleY(1); opacity: 1; }
}

/* TV Turn Off: Simulates CRT monitor power-off */
@keyframes tvOff {
  0% { transform: scaleX(1) scaleY(1); opacity: 1; }
  100% { transform: scaleX(0) scaleY(0.001); opacity: 0; }
}
```

#### Retro UI Components

All components in `components/ui/retro/` follow the LCD/retro-futuristic aesthetic:

- **AnalogSlider:** Custom range input with LED indicators
- **ColorPaletteSelector:** Visual color palette picker with previews
- **LCDDisplay:** LCD-style text display with scanline effects
- **NeonButton:** Glowing button with hover effects
- **RetroPanel:** Container with beveled borders and glow
- **SongLibraryLCD:** Song selector with scrollable list
- **VisualizerSelector:** Grid of visualizer options

### 6. Utility Functions

#### Color Utilities (`lib/utils/colorUtils.ts`)

```typescript
hexToRgb(hex: string)                    // Convert hex to RGB object
lerpColor(color1, color2, factor)        // Interpolate between colors
hexToRgba(hex: string, alpha: number)    // Convert hex to rgba string
multiplyColor(hex: string, scalar)       // Adjust color brightness
```

#### Performance Optimization (`lib/utils/throttle.ts`)

Throttle function for high-frequency events (slider changes):

```typescript
throttle<T>(func: T, delay: number)      // Limits calls to once per delay
```

#### Container Size Hook (`lib/hooks/useContainerSize.ts`)

ResizeObserver-based hook for tracking container dimensions:

```typescript
const { width, height } = useContainerSize(containerRef)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- pnpm (recommended package manager)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/aura-visuals.git
cd aura-visuals

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server with Turbopack
pnpm dev

# Open browser at http://localhost:3000
```

### Building for Production

```bash
# Create optimized production build
pnpm build

# Start production server
pnpm start
```

### Linting

```bash
# Run ESLint
pnpm lint
```

## 📁 Adding New Visualizers

Follow these steps to create a new visualizer:

### 1. Create Visualizer Component

Create `components/visualizers/MyVisualizer.tsx`:

```typescript
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'

export function MyVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { activePalette, getVisualizerParams } = useVisualizerStore()
  const palette = COLOR_PALETTES[activePalette]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animationFrameId: number

    const render = () => {
      // Get parameters
      const params = getVisualizerParams('myvisualizer')
      const sensitivity = params.sensitivity || 1.0

      // Get audio data
      const { rawData, low, mid, high } = useAudioStore.getState().frequencyData

      // Clear canvas
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Your visualization logic here
      // Use palette colors, audio data, and parameters

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [activePalette, palette, getVisualizerParams])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#000',
      }}
    />
  )
}
```

### 2. Define Parameters

Add to `stores/visualizerStore.ts` in `VISUALIZER_CONFIGS`:

```typescript
myvisualizer: [
  {
    name: 'sensitivity',
    label: 'Audio Sensitivity',
    min: 0.1,
    max: 3.0,
    step: 0.1,
    defaultValue: 1.0,
    category: 'audio'
  },
  {
    name: 'particleCount',
    label: 'Particle Count',
    min: 50,
    max: 500,
    step: 10,
    defaultValue: 200,
    category: 'visual'
  },
  // ... more parameters
],
```

### 3. Register Visualizer

Add to `constants/visualizerRegistry.ts`:

```typescript
myvisualizer: {
  id: 'myvisualizer',
  name: 'My Visualizer',
  component: lazy(() =>
    import('@/components/visualizers/MyVisualizer').then(module => ({
      default: module.MyVisualizer
    }))
  ),
},
```

### 4. Test Your Visualizer

1. Start dev server: `pnpm dev`
2. Select your visualizer from the dropdown
3. Adjust parameters and test with different songs
4. Try all color palettes

## 🎛️ Configuration

### Audio Settings

Edit `lib/audio/AudioManager.ts`:

```typescript
// FFT size (affects frequency resolution)
this.analyser.fftSize = 2048  // Power of 2: 256, 512, 1024, 2048, 4096

// Smoothing (0-1, affects data stability)
this.analyser.smoothingTimeConstant = 0.8
```

### Color Palettes

Add new palettes in `stores/visualizerStore.ts`:

```typescript
export const COLOR_PALETTES = {
  mypalette: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
  // ... existing palettes
}
```

### Performance Tuning

Adjust throttle delay in parameter sliders (`components/ui/retro/AnalogSlider.tsx`):

```typescript
const throttledOnChange = useMemo(
  () => throttle(onChange, 33),  // 33ms = ~30fps, adjust as needed
  [onChange]
)
```

## 🎵 Adding Songs

Place audio files in `public/assets/`:

```
public/assets/
├── song1.mp3
├── song2.mp3
└── song3.mp3
```

The API route `app/api/songs/route.ts` automatically scans this directory.

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

Build static files:

```bash
pnpm build
```

Deploy the `.next` folder to your hosting provider.

**Important:** Ensure the following:
- Node.js 18+ runtime
- Support for Next.js App Router
- Environment variables (if any) are configured

## 📊 Performance Optimization

### Current Optimizations

1. **Lazy Loading:** Visualizers loaded on-demand via `React.lazy()`
2. **Code Splitting:** Each visualizer in separate bundle
3. **Memoization:** Components wrapped in `React.memo()` where beneficial
4. **Throttling:** Parameter changes throttled to 33ms
5. **Canvas 2D:** More performant than WebGL for 2D graphics
6. **Zustand Selectors:** Specific state subscriptions prevent unnecessary re-renders
7. **RequestAnimationFrame:** 60fps rendering loop

### Performance Tips

- **Reduce FFT Size:** Lower `analyser.fftSize` for faster analysis
- **Limit Particles:** Keep particle counts reasonable (< 500)
- **Simplify Rendering:** Avoid complex paths and gradients in tight loops
- **Use Smoothing:** Apply smoothing to frequency data for stability

## 🐛 Troubleshooting

### Audio Not Playing

**Issue:** Audio file loads but doesn't play.

**Solution:**
- Check browser autoplay policy
- User interaction required before AudioContext can start
- AudioManager resumes context on first user interaction

### Visualizer Not Rendering

**Issue:** Black screen, no visualization.

**Solution:**
- Check browser console for errors
- Verify canvas context is available
- Ensure `ssr: false` in dynamic imports
- Check if audio data is being received

### Performance Issues

**Issue:** Low FPS, laggy animations.

**Solution:**
- Reduce particle counts
- Lower FFT size
- Simplify drawing operations
- Check browser hardware acceleration

### Build Errors

**Issue:** TypeScript or ESLint errors.

**Solution:**
- Run `pnpm lint` to see all issues
- Fix unused imports and variables
- Ensure all types are properly defined

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

### Code Style

- Use TypeScript strict mode
- Follow existing component patterns
- Add JSDoc comments for complex functions
- Keep components focused and single-purpose
- Use meaningful variable names

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Vercel** - For hosting and deployment
- **Zustand** - For simple state management
- **Radix UI** - For accessible component primitives
- **Tailwind CSS** - For utility-first styling
- **Web Audio API** - For powerful audio analysis capabilities

## 📧 Contact

**Jaime Villegas**
- Portfolio: [jvdevsolutions.com](https://jvdevsolutions.com)
- GitHub: [@jaimevillegas](https://github.com/jaimevillegas)

## 🔮 Future Enhancements

Potential features for future development:

- [ ] 3D visualizations with Three.js/WebGL
- [ ] WebGL shader-based visualizers
- [ ] Microphone input support
- [ ] Recording/screenshot functionality
- [ ] Visualizer presets/favorites
- [ ] User-created color palettes
- [ ] Spotify/SoundCloud integration
- [ ] Full-screen mode
- [ ] Touch gestures for mobile
- [ ] VR/AR visualization support
- [ ] Social sharing features
- [ ] Custom audio effects (reverb, echo, etc.)
- [ ] MIDI controller support
- [ ] Multi-language support (extend beyond EN/ES)
- [ ] Accessibility improvements (keyboard navigation, screen reader support)

---

**Built with ❤️ by [Jaime Villegas](https://jvdevsolutions.com)**

**Powered by Next.js 15, React 19, and the Web Audio API**
