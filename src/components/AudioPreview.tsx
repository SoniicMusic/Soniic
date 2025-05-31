'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as motion from '@/lib/motion';

interface AudioPreviewProps {
  src: string;
  title?: string;
  className?: string;
  variant?: 'default' | 'circular-overlay';
}

export default function AudioPreview({ src, title = "Track Preview", className = "", variant = 'default' }: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Debug logging for prop changes
  useEffect(() => {
    console.log('AudioPreview: Component mounted/src changed:', { src, title });
    
    // Force immediate state update when src is valid
    if (src && src.trim() !== '') {
      setIsLoading(true);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    }
  }, [src, title]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      console.log('Duration update:', audio.duration);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      // Also try to get duration when audio can play
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    // Try to get duration immediately if already loaded
    if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]); // Add src as dependency to re-setup listeners when src changes

  // Reset states when src changes
  useEffect(() => {
    console.log('AudioPreview: Resetting state for new src:', src);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setIsLoading(false);
    
    // Force the audio element to reload the new source
    const audio = audioRef.current;
    if (audio) {
      audio.load(); // This forces the audio element to reload
    }
  }, [src]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  console.log('AudioPreview Debug:', {
    src,
    currentTime,
    duration,
    progressPercent,
    isPlaying,
    isLoading,
    hasAudioRef: !!audioRef.current
  });

  // Don't render if src is invalid
  if (!src || src.trim() === '') {
    console.log('AudioPreview: Invalid src, not rendering:', src);
    return null;
  }

  if (variant === 'circular-overlay') {
    return (
      <motion.div 
        className={`absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-md ${className}`}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      >
        <audio ref={audioRef} src={src} preload="metadata" crossOrigin="anonymous" />
        
        <div className="relative">
          {/* Play/Pause button with external progress ring */}
          <div className="relative">
            {/* Circular progress ring positioned outside the button */}
            <svg className="absolute -inset-2 w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              {/* Background circle */}
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="white"
                strokeOpacity="0.2"
                strokeWidth="2"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="white"
                strokeOpacity="0.9"
                strokeWidth="2"
                fill="none"
                strokeDasharray={175.9}
                strokeDashoffset={175.9 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                className="transition-all duration-150"
              />
            </svg>
            
            <Button
              onClick={togglePlay}
              disabled={isLoading}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/20 border-white/30 hover:bg-white/30 backdrop-blur-sm relative z-10"
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white/50 border-t-white rounded-full" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5 text-white" />
              ) : (
                <Play className="h-5 w-5 text-white ml-0.5" />
              )}
            </Button>
          </div>
          
          {/* Time display */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white/80 whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div 
      className={`bg-black/20 backdrop-blur-sm rounded-lg p-4 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 1.5,
          delay: 0.8
        }
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" crossOrigin="anonymous" />
      
      <div className="flex items-center space-x-4">
        <Button
          onClick={togglePlay}
          disabled={isLoading}
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white/10 border-white/20 hover:bg-white/20"
        >
          {isLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-white/50 border-t-white rounded-full" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4 text-white" />
          ) : (
            <Play className="h-4 w-4 text-white ml-0.5" />
          )}
        </Button>

        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2 text-sm text-white/80">
            <Volume2 className="h-3 w-3" />
            <span>Preview</span>
          </div>
          
          <div className="space-y-1">
            {/* Progress bar */}
            <div 
              className="h-2 bg-white/20 rounded-full cursor-pointer relative overflow-hidden"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-white/60 rounded-full transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            
            {/* Time display */}
            <div className="flex justify-between text-xs text-white/60">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
