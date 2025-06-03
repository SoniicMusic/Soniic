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

// Safari detection utility
const isSafari = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  // More accurate Safari detection
  return (userAgent.includes('safari') && !userAgent.includes('chrome')) || 
         (userAgent.includes('webkit') && userAgent.includes('version'));
};

const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    window.navigator.userAgent.toLowerCase()
  ) || (window.navigator.maxTouchPoints && window.navigator.maxTouchPoints > 2);
};

const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent.toLowerCase()) ||
         (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
};

export default function AudioPreview({ src, title = "Track Preview", className = "", variant = 'default' }: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [audioContextUnlocked, setAudioContextUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Detect Safari mobile for special handling
  const isSafariMobile = (isSafari() && isMobile()) || isIOS();

  // Reset states when src changes
  useEffect(() => {
    // Force immediate state update when src is valid
    if (src && src.trim() !== '') {
      setIsLoading(true);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setCanPlay(false);
      setUserInteracted(false);
    }
  }, [src, title]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      setCanPlay(true);
      // Also try to get duration when audio can play
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    
    const handleLoadedData = () => {
      // Additional handler for Safari
      if (isSafariMobile) {
        setCanPlay(true);
        setIsLoading(false);
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setDuration(audio.duration);
        }
      }
    };
    
    const handleError = (error: Event) => {
      console.warn('Audio loading error:', error);
      setIsLoading(false);
      setCanPlay(false);
    };
    const handleEnded = async () => {
      // Fade out when ending
      const audio = audioRef.current;
      if (audio && audio.volume > 0) {
        await fadeOut(audio);
      }
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);
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
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      
      // Clear any ongoing fade
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    };
  }, [src]); // Add src as dependency to re-setup listeners when src changes

  // Reset states when src changes
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setIsLoading(false);
    setCanPlay(false);
    setUserInteracted(false);
    setAudioContextUnlocked(false);
    
    // Clear any ongoing fade
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    
    // Force the audio element to reload the new source
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 1; // Reset volume to full
      // Add muted attribute to help with iOS autoplay restrictions
      audio.muted = false;
      audio.load(); // This forces the audio element to reload
      
      // For Safari mobile, try to prepare the audio element
      if (isSafariMobile) {
        // Set a longer timeout for Safari to load metadata
        setTimeout(() => {
          if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
            setCanPlay(true);
            setIsLoading(false);
          }
        }, 1000);
      }
    }
  }, [src]);

  // Cleanup fade intervals on unmount
  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    };
  }, []);

  // Audio fade utilities
  const fadeAudio = (audio: HTMLAudioElement, fromVolume: number, toVolume: number, duration: number = 300) => {
    return new Promise<void>((resolve) => {
      // Clear any existing fade
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }

      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = (toVolume - fromVolume) / steps;
      let currentStep = 0;

      audio.volume = fromVolume;

      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        const newVolume = fromVolume + (volumeStep * currentStep);
        
        if (currentStep >= steps) {
          audio.volume = toVolume;
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
          resolve();
        } else {
          audio.volume = Math.max(0, Math.min(1, newVolume));
        }
      }, stepDuration);
    });
  };

  const fadeIn = (audio: HTMLAudioElement) => fadeAudio(audio, 0, 1, 300);
  const fadeOut = (audio: HTMLAudioElement) => fadeAudio(audio, 1, 0, 300);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || (!canPlay && !isSafariMobile)) return;

    // Mark that user has interacted with the audio
    if (!userInteracted) {
      setUserInteracted(true);
    }

    try {
      if (isPlaying) {
        // Fade out then pause
        await fadeOut(audio);
        audio.pause();
        setIsPlaying(false);
      } else {
        // For Safari iOS, we need special handling
        if (isSafariMobile && !audioContextUnlocked) {
          // Try to unlock audio context by playing a silent audio first
          try {
            audio.muted = true;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              await playPromise;
            }
            audio.pause();
            audio.currentTime = 0;
            audio.muted = false;
            setAudioContextUnlocked(true);
          } catch (unlockError) {
            console.warn('Failed to unlock audio context:', unlockError);
          }
        }
        
        // Start playing with fade in
        audio.volume = 0; // Start at 0 volume
        
        // Use a promise to handle play() properly
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
          await fadeIn(audio);
        }
      }
    } catch (error) {
      console.warn('Audio playback failed:', error);
      // Reset states on error
      setIsPlaying(false);
      
      // For Safari, try alternative approach
      if (isSafariMobile) {
        try {
          // Force reload and try again
          audio.load();
          setTimeout(async () => {
            try {
              audio.volume = 0.5; // Use moderate volume for fallback
              const retryPromise = audio.play();
              if (retryPromise !== undefined) {
                await retryPromise;
                setIsPlaying(true);
              }
            } catch (retryError) {
              console.warn('Retry audio playback failed:', retryError);
            }
          }, 500);
        } catch (reloadError) {
          console.warn('Audio reload failed:', reloadError);
        }
      }
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

  // Don't render if src is invalid
  if (!src || src.trim() === '') {
    return null;
  }

  if (variant === 'circular-overlay') {
    return (
      <>
        <motion.div 
          className={`absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-md ${className}`}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <audio 
            ref={audioRef} 
            src={src} 
            preload={isSafariMobile ? "none" : "metadata"}
            crossOrigin="anonymous"
            playsInline
            webkit-playsinline="true"
            controls={false}
          />
          
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
                onTouchStart={handleTouchStart}
                disabled={isLoading || (!canPlay && !isSafariMobile)}
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/20 border-white/30 hover:bg-white/30 backdrop-blur-sm relative z-10"
              >
                {isLoading || (!canPlay && !isSafariMobile) ? (
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

        {/* Playing indicator at bottom - visible when playing and not hovered */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: isPlaying ? 1 : 0, 
            y: isPlaying ? 0 : 10 
          }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-600/80 to-transparent rounded-b-md p-3 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none"
          style={{ 
            visibility: isPlaying ? 'visible' : 'hidden'
          }}
        >
          <div className="flex items-center justify-between text-white/90 text-sm">
            <div className="flex items-center space-x-2">
                              <Button
                onClick={async () => {
                  const audio = audioRef.current;
                  if (audio && isPlaying) {
                    await fadeOut(audio);
                    audio.pause();
                    setIsPlaying(false);
                  }
                }}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full bg-white/10 hover:bg-white/20 border-none pointer-events-auto"
              >
                <Pause className="h-3 w-3 text-white" />
              </Button>
              <div className="flex space-x-1">
                {/* Animated sound bars */}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-white/80 rounded-full animate-pulse"
                    style={{
                      height: '12px',
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1s'
                    }}
                  />
                ))}
              </div>
              {/* Pause button */}

            </div>
            
            {/* Progress bar */}
            <div className="flex-1 mx-3">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white/70 rounded-full transition-all duration-150"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            
            {/* Time */}
            <span className="text-xs text-white/70 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </motion.div>
      </>
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
      <audio 
        ref={audioRef} 
        src={src} 
        preload={isSafariMobile ? "none" : "metadata"}
        crossOrigin="anonymous"
        playsInline
        webkit-playsinline="true"
        controls={false}
      />
      
      <div className="flex items-center space-x-4">
        <Button
          onClick={togglePlay}
          onTouchStart={() => {
            // For Safari mobile, ensure we capture touch events
            if (isSafariMobile && !userInteracted) {
              setUserInteracted(true);
            }
          }}
          disabled={isLoading || (!canPlay && !isSafariMobile)}
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white/10 border-white/20 hover:bg-white/20"
        >
          {isLoading || (!canPlay && !isSafariMobile) ? (
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
