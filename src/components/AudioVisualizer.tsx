import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';

interface AudioVisualizerProps {
  isPlaying: boolean;
  color: string;
  themeMode: 'dark' | 'light';
  variant?: 'bars' | 'wave' | 'circle';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  color,
  themeMode,
  variant = 'bars',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const freqData = audioEngine.getFrequencyData();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;

      if (variant === 'bars') {
        const barCount = 16;
        const barWidth = width / barCount - 3;

        for (let i = 0; i < barCount; i++) {
          const rawVal = freqData[i * 2] || 0;
          // If playing synthesize dynamic wave if audio context is quiet
          const dynamicAmp = isPlaying
            ? Math.max(rawVal / 255, 0.2 + Math.sin(phase + i * 0.4) * 0.3)
            : 0.05;
          const barHeight = Math.max(4, dynamicAmp * (height - 6));

          const x = i * (barWidth + 3);
          const y = height - barHeight;

          // Gradient
          const grad = ctx.createLinearGradient(0, y, 0, height);
          grad.addColorStop(0, color);
          grad.addColorStop(1, themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
          ctx.fill();
        }
      } else if (variant === 'wave') {
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = color;

        for (let x = 0; x < width; x += 4) {
          const sampleIdx = Math.floor((x / width) * 20);
          const rawVal = freqData[sampleIdx] || 0;
          const amp = isPlaying
            ? Math.max(rawVal / 255, 0.15 + Math.sin(phase + x * 0.05) * 0.25) * 16
            : 2;
          const y = height / 2 + Math.sin(phase + x * 0.08) * amp;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      phase += isPlaying ? 0.08 : 0.01;
      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isPlaying, color, themeMode, variant]);

  return (
    <canvas
      ref={canvasRef}
      width={140}
      height={32}
      className="rounded pointer-events-none opacity-90"
    />
  );
};
