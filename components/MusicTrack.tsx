import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Track } from '../types';
import { PlayIcon, PauseIcon, SpinnerIcon } from './Icons';

interface MusicTrackProps {
  track: Track;
  onBuyClick: (track: Track) => void;
  isPlaying: boolean;
  onPlay: (trackId: string) => void;
  onPause: (trackId: string) => void;
}

const PREVIEW_DURATION = 30; // seconds
const FADE_IN_DURATION = 2;  // seconds
const FADE_OUT_DURATION = 3; // seconds
const FADE_OUT_START_TIME = PREVIEW_DURATION - FADE_OUT_DURATION;

// Helper to process audio data into a simplified array for visualization
const generateWaveformData = (audioBuffer: AudioBuffer, targetPoints: number): number[] => {
    const rawData = audioBuffer.getChannelData(0); // Use the first channel
    const samples = Math.floor(rawData.length / targetPoints);
    if (samples === 0) return [];

    const waveformData = [];
    for (let i = 0; i < targetPoints; i++) {
        const blockStart = samples * i;
        let sum = 0;
        for (let j = 0; j < samples; j++) {
            if(rawData[blockStart + j]) sum += Math.abs(rawData[blockStart + j]);
        }
        waveformData.push(sum / samples);
    }
    // Normalize the data from 0 to 1
    const max = Math.max(...waveformData);
    if (max === 0) return new Array(targetPoints).fill(0);
    return waveformData.map(v => v / max);
};


export const MusicTrack: React.FC<MusicTrackProps> = ({ track, onBuyClick, isPlaying, onPlay, onPause }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const playbackStartTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [waveform, setWaveform] = useState<number[]>([]);

  const stableOnPause = useCallback(() => {
    onPause(track.id);
  }, [onPause, track.id]);

  const togglePlay = () => {
    if (!track.audioSrc) return;
    if (isLoading && waveform.length === 0) return;

    if (isPlaying) {
      onPause(track.id);
    } else {
      onPlay(track.id);
    }
  };

  const drawWaveform = useCallback((progress: number = 0) => {
    const canvas = canvasRef.current;
    if (!canvas || !waveform.length) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const middle = height / 2;
    const barWidth = 3;
    const barGap = 2;
    const totalBarWidth = barWidth + barGap;
    const numBars = Math.floor(width / totalBarWidth);

    const startOffset = (width - numBars * totalBarWidth) / 2;
    
    const sampledWaveform = [];
    if(waveform.length > 0) {
        const step = waveform.length / numBars;
        for (let i = 0; i < numBars; i++) {
            sampledWaveform.push(waveform[Math.floor(i * step)]);
        }
    }

    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = "round";

    const drawBars = (color: string | CanvasGradient) => {
        ctx.fillStyle = color;
        sampledWaveform.forEach((value, index) => {
            const barHeight = Math.max(2, value * height * 0.95);
            const y = middle - barHeight / 2;
            ctx.fillRect(startOffset + index * totalBarWidth, y, barWidth, barHeight);
        });
    };

    drawBars('rgba(255, 255, 255, 0.3)');

    if (progress > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, width * progress, height);
        ctx.clip();
        
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#f97316');
        gradient.addColorStop(1, '#ea580c');
        
        drawBars(gradient);
        ctx.restore();
    }
  }, [waveform]);

  useEffect(() => {
      drawWaveform();
      const handleResize = () => drawWaveform();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, [drawWaveform]);

  useEffect(() => {
    const playAudio = async () => {
      if (!track.audioSrc) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
      const audioContext = audioContextRef.current;

      if (!audioBufferRef.current) {
        setIsLoading(true);
        try {
          const response = await fetch(track.audioSrc);
          if (!response.ok) {
              throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
          }
          const arrayBuffer = await response.arrayBuffer();
           if (arrayBuffer.byteLength === 0) {
              throw new Error("Received empty audio file.");
          }
          const buffer = await audioContext.decodeAudioData(arrayBuffer);
          audioBufferRef.current = buffer;
          const data = generateWaveformData(buffer, 200);
          setWaveform(data);
        } catch (error) {
          console.error('Error processing audio file:', error);
          stableOnPause();
        } finally {
          setIsLoading(false);
        }
      }

      if (!audioBufferRef.current) return stableOnPause();
      if (sourceNodeRef.current) { try { sourceNodeRef.current.stop(); } catch (e) {} }

      const source = audioContext.createBufferSource();
      source.buffer = audioBufferRef.current;
      sourceNodeRef.current = source;
      const gainNode = audioContext.createGain();
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const now = audioContext.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(1, now + FADE_IN_DURATION);
      gainNode.gain.setValueAtTime(1, now + FADE_OUT_START_TIME);
      gainNode.gain.linearRampToValueAtTime(0, now + PREVIEW_DURATION);

      source.start(now);
      playbackStartTimeRef.current = now;
      source.stop(now + PREVIEW_DURATION);
      source.onended = () => {
        sourceNodeRef.current = null;
        stableOnPause();
      };
    };

    if (isPlaying) {
      playAudio();
    } else {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.onended = null;
        try { sourceNodeRef.current.stop(); } catch (e) {}
        sourceNodeRef.current = null;
      }
      drawWaveform(0);
    }
  }, [isPlaying, stableOnPause, track.audioSrc, drawWaveform]);
  
  useEffect(() => {
    if (!isPlaying || !waveform.length) {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        return;
    }

    const animationLoop = () => {
        const audioContext = audioContextRef.current;
        if (!audioContext || audioContext.state !== 'running') return;
        const elapsedTime = audioContext.currentTime - playbackStartTimeRef.current;
        const progress = Math.min(elapsedTime / PREVIEW_DURATION, 1);
        drawWaveform(progress);
        if (progress < 1) animationFrameRef.current = requestAnimationFrame(animationLoop);
    };
    animationFrameRef.current = requestAnimationFrame(animationLoop);
    return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, waveform, drawWaveform]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-black/20 rounded-lg hover:bg-black/40 transition-all duration-300 gap-4">
        <div className="flex items-center gap-4 w-auto">
            <img src={track.coverArt} alt={track.title} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
        </div>

        <div className="flex flex-col justify-center flex-grow w-full px-0 sm:px-2">
            <div>
                <h3 className="font-semibold text-lg truncate">{track.title}</h3>
                <p className="text-gray-400 text-sm">{track.artist}</p>
            </div>
            {track.audioSrc && (
                 <div 
                    className="relative w-full h-10 mt-2 group cursor-pointer" 
                    onClick={togglePlay}
                    aria-label={`Play or pause preview for ${track.title}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && togglePlay()}
                  >
                    <canvas ref={canvasRef} className="w-full h-full" />
                    {(isLoading && !waveform.length) && (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 bg-black/20 rounded">Loading preview...</div>
                    )}
                </div>
            )}
        </div>
      
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-end mt-2 sm:mt-0">
            {track.audioSrc && (
                <button
                  onClick={togglePlay}
                  disabled={isLoading && waveform.length === 0}
                  className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-wait"
                  aria-label={isPlaying ? `Pause preview for ${track.title}` : `Play preview for ${track.title}`}
                >
                  {isLoading && waveform.length === 0 ? (
                    <SpinnerIcon className="w-5 h-5 text-white" />
                  ) : isPlaying ? (
                    <PauseIcon />
                  ) : (
                    <PlayIcon />
                  )}
                </button>
            )}
            
            <button
              onClick={() => onBuyClick(track)}
              className="flex-grow sm:flex-grow-0 px-6 py-2 bg-gradient-to-r from-orange-500 to-black rounded-full font-semibold hover:opacity-90 transition-opacity duration-300"
            >
              Buy
            </button>
        </div>
    </div>
  );
};
