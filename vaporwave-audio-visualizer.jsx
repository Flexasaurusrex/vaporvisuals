import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

export default function VaporwaveAudioVisualizer() {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  
  // Control parameters
  const [wavePropagation, setWavePropagation] = useState(50);
  const [colorIntensity, setColorIntensity] = useState(70);
  const [mountainSensitivity, setMountainSensitivity] = useState(60);
  const [gridDistortion, setGridDistortion] = useState(40);
  const [glowEffect, setGlowEffect] = useState(50);
  const [speedSmoothing, setSpeedSmoothing] = useState(30);
  const [bassBoost, setBassBoost] = useState(50);
  const [scanlines, setScanlines] = useState(30);

  // Smoothing values for audio reactivity
  const smoothedValuesRef = useRef({
    bass: 0,
    mid: 0,
    high: 0,
    overall: 0
  });

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      streamRef.current = stream;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;
      
      setIsListening(true);
      setError(null);
      animate();
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access to visualize audio.');
      console.error('Audio capture error:', err);
    }
  };

  const stopAudioCapture = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsListening(false);
  };

  const getAudioData = () => {
    if (!analyserRef.current || !dataArrayRef.current) return null;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const data = dataArrayRef.current;
    const len = data.length;
    
    // Split into frequency ranges
    const bassEnd = Math.floor(len * 0.1);
    const midEnd = Math.floor(len * 0.4);
    
    let bass = 0, mid = 0, high = 0;
    
    for (let i = 0; i < bassEnd; i++) bass += data[i];
    for (let i = bassEnd; i < midEnd; i++) mid += data[i];
    for (let i = midEnd; i < len; i++) high += data[i];
    
    bass = (bass / bassEnd) / 255;
    mid = (mid / (midEnd - bassEnd)) / 255;
    high = (high / (len - midEnd)) / 255;
    
    // Apply bass boost
    bass *= (1 + bassBoost / 100);
    
    const overall = (bass + mid + high) / 3;
    
    // Smooth the values
    const smoothing = 1 - (speedSmoothing / 100);
    smoothedValuesRef.current = {
      bass: smoothedValuesRef.current.bass * smoothing + bass * (1 - smoothing),
      mid: smoothedValuesRef.current.mid * smoothing + mid * (1 - smoothing),
      high: smoothedValuesRef.current.high * smoothing + high * (1 - smoothing),
      overall: smoothedValuesRef.current.overall * smoothing + overall * (1 - smoothing)
    };
    
    return smoothedValuesRef.current;
  };

  const drawVaporwaveScene = (ctx, width, height, audioData) => {
    const time = Date.now() / 1000;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    const intensity = colorIntensity / 100;
    
    const r1 = Math.floor(20 + audioData.high * 100 * intensity);
    const g1 = Math.floor(10 + audioData.mid * 50 * intensity);
    const b1 = Math.floor(40 + audioData.bass * 100 * intensity);
    
    gradient.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
    gradient.addColorStop(0.4, `rgb(${80 + audioData.mid * 100}, ${30 + audioData.bass * 80}, ${120 + audioData.high * 135})`);
    gradient.addColorStop(1, `rgb(${255 - audioData.bass * 100}, ${100 + audioData.mid * 100}, ${200 + audioData.high * 55})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Sun/Moon
    const sunY = height * 0.25 + Math.sin(time * 0.5) * 20;
    const sunRadius = 80 + audioData.overall * 40;
    
    // Glow effect
    if (glowEffect > 0) {
      ctx.shadowBlur = 40 * (glowEffect / 100);
      ctx.shadowColor = `rgba(255, ${100 + audioData.bass * 155}, ${200 + audioData.high * 55}, ${0.6 * (glowEffect / 100)})`;
    }
    
    ctx.fillStyle = `rgba(255, ${150 + audioData.mid * 105}, ${220 - audioData.bass * 100}, 0.9)`;
    ctx.beginPath();
    ctx.arc(width / 2, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Sun rings
    ctx.strokeStyle = `rgba(255, ${100 + audioData.high * 155}, ${200 + audioData.bass * 55}, 0.5)`;
    ctx.lineWidth = 3;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(width / 2, sunY, sunRadius + i * (20 + audioData.mid * 20), 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.shadowBlur = 0;
    
    // Mountains
    const mountainLayers = 3;
    for (let layer = 0; layer < mountainLayers; layer++) {
      const layerDepth = layer / mountainLayers;
      const baseY = height * 0.5 + layer * 30;
      const sensitivity = mountainSensitivity / 100;
      
      ctx.fillStyle = `rgba(${100 - layer * 30}, ${20 + layer * 40}, ${80 + layer * 50}, ${0.6 - layerDepth * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(0, height);
      
      const points = 50;
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * width;
        const freq = 0.003 + layer * 0.001;
        const amp = (50 + layer * 30) * (1 + audioData.bass * sensitivity * 3);
        const y = baseY + Math.sin(x * freq + time * (1 - layerDepth)) * amp;
        
        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    }
    
    // Grid floor
    const gridY = height * 0.6;
    const gridLines = 20;
    const gridSpacing = height * 0.02;
    
    ctx.strokeStyle = `rgba(255, ${100 + audioData.mid * 155}, ${200 + audioData.high * 55}, 0.3)`;
    ctx.lineWidth = 2;
    
    // Perspective horizontal lines
    for (let i = 0; i < gridLines; i++) {
      const y = gridY + i * gridSpacing;
      const perspective = i / gridLines;
      const distortion = gridDistortion / 100;
      const waveOffset = Math.sin(time * 2 + i * 0.3) * 20 * audioData.bass * distortion;
      const waveIntensity = wavePropagation / 100;
      
      ctx.beginPath();
      
      for (let x = 0; x <= width; x += 5) {
        const xPos = x;
        const waveY = Math.sin(x * 0.02 + time * 3 + i * 0.1) * 10 * audioData.mid * waveIntensity;
        const finalY = y + waveOffset + waveY;
        
        if (x === 0) {
          ctx.moveTo(xPos, finalY);
        } else {
          ctx.lineTo(xPos, finalY);
        }
      }
      
      ctx.stroke();
    }
    
    // Vertical grid lines
    const verticalLines = 30;
    for (let i = 0; i < verticalLines; i++) {
      const x = (i / verticalLines) * width;
      const distortion = gridDistortion / 100;
      
      ctx.beginPath();
      
      for (let y = gridY; y < height; y += 5) {
        const progress = (y - gridY) / (height - gridY);
        const perspective = progress * progress;
        const spread = width * 0.3 * perspective;
        const centerOffset = (x - width / 2) * perspective;
        const waveOffset = Math.sin(time * 2 + i * 0.2 + y * 0.02) * 15 * audioData.high * distortion;
        const waveIntensity = wavePropagation / 100;
        const propagationWave = Math.sin(y * 0.05 + time * 4) * 20 * audioData.bass * waveIntensity;
        
        const finalX = width / 2 + centerOffset + waveOffset + propagationWave;
        
        if (y === gridY) {
          ctx.moveTo(finalX, y);
        } else {
          ctx.lineTo(finalX, y);
        }
      }
      
      ctx.stroke();
    }
    
    // Scanlines effect
    if (scanlines > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${0.1 * (scanlines / 100)})`;
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 2);
      }
    }
    
    // Particles/stars
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.sin(i * 123.456 + time * 0.3) * 0.5 + 0.5) * width;
      const y = (Math.cos(i * 789.012 + time * 0.2) * 0.5 + 0.5) * height * 0.5;
      const size = 1 + Math.sin(time * 2 + i) * 1.5 + audioData.high * 2;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + audioData.high * 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const audioData = getAudioData() || { bass: 0, mid: 0, high: 0, overall: 0 };
    
    drawVaporwaveScene(ctx, canvas.width, canvas.height, audioData);
    
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    return () => {
      window.removeEventListener('resize', resize);
      stopAudioCapture();
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-black/70 backdrop-blur-md rounded-lg p-4 max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-white font-bold text-lg">Vaporwave Audio Visualizer</h1>
            <button
              onClick={isListening ? stopAudioCapture : startAudioCapture}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              {isListening ? (
                <>
                  <Pause size={18} />
                  Stop
                </>
              ) : (
                <>
                  <Play size={18} />
                  Start
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">
              {error}
            </div>
          )}
          
          {!isListening && !error && (
            <div className="mb-4 p-3 bg-cyan-500/20 border border-cyan-500 rounded text-cyan-200 text-sm">
              Click "Start" and allow microphone access to visualize your music
            </div>
          )}
          
          <div className="space-y-3 text-white text-sm">
            <div>
              <label className="flex justify-between mb-1">
                <span>Wave Propagation</span>
                <span className="text-pink-400">{wavePropagation}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={wavePropagation}
                onChange={(e) => setWavePropagation(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="flex justify-between mb-1">
                <span>Color Intensity</span>
                <span className="text-pink-400">{colorIntensity}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={colorIntensity}
                onChange={(e) => setColorIntensity(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="flex justify-between mb-1">
                <span>Mountain Sensitivity</span>
                <span className="text-pink-400">{mountainSensitivity}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={mountainSensitivity}
                onChange={(e) => setMountainSensitivity(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="flex justify-between mb-1">
                <span>Grid Distortion</span>
                <span className="text-pink-400">{gridDistortion}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={gridDistortion}
                onChange={(e) => setGridDistortion(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="flex justify-between mb-1">
                <span>Glow Effect</span>
                <span className="text-pink-400">{glowEffect}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={glowEffect}
                onChange={(e) => setGlowEffect(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="flex justify-between mb-1">
                <span>Speed Smoothing</span>
                <span className="text-pink-400">{speedSmoothing}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={speedSmoothing}
                onChange={(e) => setSpeedSmoothing(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="flex justify-between mb-1">
                <span>Bass Boost</span>
                <span className="text-pink-400">{bassBoost}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={bassBoost}
                onChange={(e) => setBassBoost(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="flex justify-between mb-1">
                <span>Scanlines</span>
                <span className="text-pink-400">{scanlines}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={scanlines}
                onChange={(e) => setScanlines(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Status indicator */}
      {isListening && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-md rounded-lg px-4 py-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white text-sm">Listening...</span>
        </div>
      )}
    </div>
  );
}