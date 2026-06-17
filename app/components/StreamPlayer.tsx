"use client";

import { useEffect, useRef, useState } from 'react';
import { StreamUrlResponse } from '../utils/data-parser';

interface StreamPlayerProps {
  channelName: string;
  url: string;
  id: string | null;
}

export default function StreamPlayer({ channelName, url, id }: StreamPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [streamData, setStreamData] = useState<StreamUrlResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [playMode, setPlayMode] = useState<'shaka' | 'iframe'>('iframe');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Load stream metadata
  useEffect(() => {
    let isCurrent = true;

    // Reset states asynchronously to avoid cascading renders
    const timer = setTimeout(() => {
      setStreamData(null);
      setLoading(false);
      setFetchError(null);

      if (!id) {
        setPlayMode('iframe');
        return;
      }

      setLoading(true);
      fetch(`/api/stream?id=${encodeURIComponent(id)}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to resolve stream link');
          return res.json() as Promise<StreamUrlResponse>;
        })
        .then(data => {
          if (isCurrent) {
            if (data && data.url) {
              setStreamData(data);
              setPlayMode('shaka');
              setFetchError(null);
            } else {
              setPlayMode('iframe');
              setFetchError('No live URL provided');
            }
          }
        })
        .catch(err => {
          console.error(err);
          if (isCurrent) {
            setPlayMode('iframe');
            setFetchError(err.message || 'Stream connection failed');
          }
        })
        .finally(() => {
          if (isCurrent) {
            setLoading(false);
          }
        });
    }, 0);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [id, url]);

  // Load Shaka Player library and style, and mount player
  useEffect(() => {
    if (playMode !== 'shaka' || !streamData?.url || !videoRef.current || !containerRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let playerInstance: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let uiInstance: any = null;
    let isDestroyed = false;

    // Load Shaka CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/shaka-player@latest/dist/controls.css';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);

    // Load Shaka Script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/shaka-player@latest/dist/shaka-player.ui.js';
    script.crossOrigin = 'anonymous';
    script.async = true;

    script.onload = async () => {
      if (isDestroyed) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const shaka = (window as any).shaka;
      if (!shaka) return;

      shaka.polyfill.installAll();
      if (!shaka.Player.isBrowserSupported()) {
        console.error('Shaka: Browser not supported');
        setPlayMode('iframe');
        return;
      }

      const video = videoRef.current;
      const container = containerRef.current;
      if (!video || !container) return;

      try {
        playerInstance = new shaka.Player(video);
        
        // Dynamic ClearKey Configuration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const playerConfig: any = {
          streaming: { bufferingGoal: 20, rebufferingGoal: 2, bufferBehind: 20 }
        };

        if (streamData.k1 && streamData.k2) {
          playerConfig.drm = {
            clearKeys: {
              [streamData.k1]: streamData.k2
            },
            preferredKeySystems: ['org.w3.clearkey']
          };
        }

        playerInstance.configure(playerConfig);

        // Configure Shaka UI
        uiInstance = new shaka.ui.Overlay(playerInstance, container, video);
        uiInstance.configure({
          controlPanelElements: [
            "play_pause",
            "mute",
            "volume",
            "spacer",
            "time_and_duration",
            "quality",
            "fullscreen",
            "overflow_menu"
          ]
        });

        // Load stream url
        await playerInstance.load(streamData.url);
        if (!isDestroyed) {
          video.play().catch(e => console.log('Autoplay blocked:', e));
        }

      } catch (error) {
        console.error('Shaka UI Init/Load error:', error);
        if (!isDestroyed) {
          setPlayMode('iframe');
        }
      }
    };

    document.body.appendChild(script);

    return () => {
      isDestroyed = true;
      
      // Clean up player
      if (playerInstance) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        playerInstance.destroy().catch((e: any) => console.log(e));
      }
      // Clean up UI
      if (uiInstance) {
        uiInstance.destroy();
      }

      // Clean up script/style
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [playMode, streamData]);

  return (
    <div className="flex flex-col gap-3 w-full max-w-4xl mx-auto">
      {/* Player Frame Container */}
      {playMode === 'shaka' && streamData?.url ? (
        <div 
          ref={containerRef} 
          className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-zinc-850 shadow-2xl"
          data-shaka-player-container
        >
          {loading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 text-xs text-zinc-400 font-medium">
              Resolving stream connection...
            </div>
          )}
          <video
            ref={videoRef}
            data-shaka-player
            autoPlay
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-zinc-850 shadow-2xl">
          {loading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 text-xs text-zinc-400 font-medium">
              Resolving stream connection...
            </div>
          )}
          <iframe
            src={url}
            className="absolute inset-0 w-full h-full border-0"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
          />
        </div>
      )}

      {/* Selector & Indicator Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-zinc-400 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <div className="flex flex-col gap-1">
          <span>Current Channel: <strong className="text-zinc-800 dark:text-zinc-200">{channelName}</strong></span>
          {/* Status Indicator */}
          {id && (
            <div className="mt-1">
              {loading ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full animate-pulse border border-amber-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Checking stream availability & live status...
                </span>
              ) : playMode === 'shaka' && streamData?.url ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Stream Connected (Direct Shaka Player)
                </span>
              ) : fetchError ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-zinc-500 bg-zinc-500/10 px-2 py-0.5 rounded-full border border-zinc-250/20 dark:border-zinc-700/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                  Direct player offline ({fetchError}). Falling back to iframe...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-zinc-500 bg-zinc-500/10 px-2 py-0.5 rounded-full border border-zinc-250/20 dark:border-zinc-700/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                  Web Player Active (Iframe Embed)
                </span>
              )}
            </div>
          )}
        </div>
        {id && streamData?.url && (
          <div className="flex gap-2">
            <button
              onClick={() => setPlayMode('shaka')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                playMode === 'shaka'
                  ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/10'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-350 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              Direct Shaka Player
            </button>
            <button
              onClick={() => setPlayMode('iframe')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                playMode === 'iframe'
                  ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/10'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-350 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              Iframe Embed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
