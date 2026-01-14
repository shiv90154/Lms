'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function YouTubePlayer({
    videoUrl,
    onProgress,
    onComplete,
    resumeTime = 0,
    className = ''
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(resumeTime);
    const [duration, setDuration] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState('');
    const playerRef = useRef(null);
    const intervalRef = useRef(null);

    // Extract video ID from YouTube URL
    const getVideoId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const videoId = getVideoId(videoUrl);

    useEffect(() => {
        if (!videoId) {
            setError('Invalid YouTube URL');
            return;
        }

        // Load YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = initializePlayer;
        } else {
            initializePlayer();
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy();
            }
        };
    }, [videoId]);

    const initializePlayer = () => {
        if (!videoId) return;

        playerRef.current = new window.YT.Player('youtube-player', {
            height: '360',
            width: '640',
            videoId: videoId,
            host: 'https://www.youtube-nocookie.com', // Privacy-enhanced mode
            playerVars: {
                autoplay: 0,
                controls: 1,
                disablekb: 0,
                enablejsapi: 1,
                fs: 1,
                iv_load_policy: 3, // Hide video annotations
                modestbranding: 1, // Minimal YouTube branding
                playsinline: 1,
                rel: 0, // Don't show related videos from other channels
                showinfo: 0,
                start: Math.floor(resumeTime),
                origin: window.location.origin
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
                onError: onPlayerError
            }
        });
    };

    const onPlayerReady = (event) => {
        setIsReady(true);
        setDuration(event.target.getDuration());

        // Start progress tracking
        intervalRef.current = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime) {
                const time = playerRef.current.getCurrentTime();
                setCurrentTime(time);

                if (onProgress) {
                    onProgress(time);
                }
            }
        }, 1000);
    };

    const onPlayerStateChange = (event) => {
        const state = event.data;

        switch (state) {
            case window.YT.PlayerState.PLAYING:
                setIsPlaying(true);
                break;
            case window.YT.PlayerState.PAUSED:
                setIsPlaying(false);
                break;
            case window.YT.PlayerState.ENDED:
                setIsPlaying(false);
                if (onComplete) {
                    onComplete();
                }
                break;
            default:
                break;
        }
    };

    const onPlayerError = (event) => {
        const errorCode = event.data;
        let errorMessage = 'Video playback error';

        switch (errorCode) {
            case 2:
                errorMessage = 'Invalid video ID';
                break;
            case 5:
                errorMessage = 'HTML5 player error';
                break;
            case 100:
                errorMessage = 'Video not found or private';
                break;
            case 101:
            case 150:
                errorMessage = 'Video cannot be embedded';
                break;
            default:
                errorMessage = `Playback error (${errorCode})`;
        }

        setError(errorMessage);
    };

    const togglePlayPause = () => {
        if (!playerRef.current) return;

        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const seekTo = (time) => {
        if (playerRef.current && playerRef.current.seekTo) {
            playerRef.current.seekTo(time, true);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!videoId) {
        return (
            <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
                <p className="text-red-600">Invalid YouTube URL</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                    variant="outline"
                    onClick={() => window.open(videoUrl, '_blank')}
                >
                    Watch on YouTube
                </Button>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Video Player */}
            <div className="relative bg-black rounded-lg overflow-hidden">
                <div id="youtube-player" className="w-full aspect-video"></div>

                {!isReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                        <div className="text-white">Loading video...</div>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            {isReady && duration > 0 && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Custom Controls */}
            <div className="flex items-center justify-center space-x-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlayPause}
                    disabled={!isReady}
                >
                    {isPlaying ? 'Pause' : 'Play'}
                </Button>

                {resumeTime > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => seekTo(resumeTime)}
                        disabled={!isReady}
                    >
                        Resume from {formatTime(resumeTime)}
                    </Button>
                )}
            </div>

            {/* Video Info */}
            <div className="text-sm text-gray-600 text-center">
                <p>Privacy-enhanced YouTube player - No tracking or related videos</p>
            </div>
        </div>
    );
}