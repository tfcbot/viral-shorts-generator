"use client";

import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  src: string;
  title: string;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
  poster?: string;
  onError?: (error: string) => void;
  showRetry?: boolean;
}

export default function VideoPlayer({
  src,
  title,
  width = 360,
  height = 640,
  autoPlay = false,
  controls = true,
  loop = false,
  muted = false,
  className = "",
  poster,
  onError,
  showRetry = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);
  const [lastSrc, setLastSrc] = useState(src);

  // Reset states when src changes
  useEffect(() => {
    if (lastSrc !== src) {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage("");
      setRetryCount(0);
      setLastSrc(src);
    }
  }, [src, lastSrc]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage("");
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleError = (e: Event) => {
      console.error("Video playback error:", e);
      const video = e.target as HTMLVideoElement;
      const error = video.error;
      
      let errorMsg = "Failed to load video";
      if (error) {
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            errorMsg = "Video loading was aborted";
            break;
          case error.MEDIA_ERR_NETWORK:
            errorMsg = "Network error while loading video";
            break;
          case error.MEDIA_ERR_DECODE:
            errorMsg = "Video format not supported";
            break;
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMsg = "Video source not accessible or expired";
            break;
          default:
            errorMsg = "Unknown video error";
        }
      }
      
      setIsLoading(false);
      setHasError(true);
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
    };

    // Add crossorigin attribute for CORS handling
    videoElement.crossOrigin = "anonymous";
    
    videoElement.addEventListener("loadstart", handleLoadStart);
    videoElement.addEventListener("canplay", handleCanPlay);
    videoElement.addEventListener("loadeddata", handleLoadedData);
    videoElement.addEventListener("error", handleError);

    return () => {
      videoElement.removeEventListener("loadstart", handleLoadStart);
      videoElement.removeEventListener("canplay", handleCanPlay);
      videoElement.removeEventListener("loadeddata", handleLoadedData);
      videoElement.removeEventListener("error", handleError);
    };
  }, [src, onError]);

  const handleRetry = () => {
    if (retryCount >= 3) return; // Limit retries
    
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");
    
    // Force reload by updating the src with a cache buster
    const videoElement = videoRef.current;
    if (videoElement) {
      const cacheBuster = `?retry=${retryCount + 1}&t=${Date.now()}`;
      videoElement.src = src + (src.includes('?') ? '&' : '?') + cacheBuster.slice(1);
      videoElement.load();
    }
  };

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-4 max-w-full">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <div className="text-red-600 dark:text-red-400 text-sm mb-2 font-medium">
            Video Preview Error
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-xs mb-3 break-words">
            {errorMessage}
          </div>
          {showRetry && retryCount < 3 && (
            <button
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition-colors"
            >
              Retry ({3 - retryCount} left)
            </button>
          )}
          {retryCount >= 3 && (
            <div className="text-gray-500 text-xs">
              Try downloading the video or refreshing the page
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg z-10"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">Loading video...</div>
            {retryCount > 0 && (
              <div className="text-gray-500 text-xs mt-1">Retry attempt {retryCount}</div>
            )}
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        src={src}
        title={title}
        width={width}
        height={height}
        autoPlay={autoPlay}
        controls={controls}
        loop={loop}
        muted={muted}
        playsInline
        preload="metadata"
        poster={poster}
        className={`rounded-lg object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
} 