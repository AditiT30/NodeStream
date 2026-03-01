import { useState, useRef, useEffect, useCallback } from 'react';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function MediaPlayer({ src, title, theaterMode, onTheaterToggle }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const seekBarRef = useRef(null);
  const hideTimerRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [seeking, setSeeking] = useState(false);

  // ── Action helpers — declared before useEffects that reference them ──

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }, []);

  const seek = useCallback((delta) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration, videoRef.current.currentTime + delta)
    );
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // ── Controls visibility ──

  // Auto-hide controls 3s after the last activity while playing
  const scheduleHide = useCallback(() => {
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
  }, []);

  const handleActivity = useCallback(() => {
    setControlsVisible(true);
    if (playing) scheduleHide();
  }, [playing, scheduleHide]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.code === 'KeyF') toggleFullscreen();
      if (e.code === 'KeyM') toggleMute();
      if (e.code === 'ArrowLeft') seek(-5);
      if (e.code === 'ArrowRight') seek(5);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [togglePlay, toggleFullscreen, toggleMute, seek]);

  // Fullscreen change sync
  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Seek bar handlers ──

  const handleSeekClick = useCallback((e) => {
    if (!seekBarRef.current || !videoRef.current?.duration) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = ratio * videoRef.current.duration;
  }, []);

  const handleSeekMouseMove = useCallback((e) => {
    if (!seeking) return;
    handleSeekClick(e);
  }, [seeking, handleSeekClick]);

  const progressPct = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black select-none ${
        theaterMode ? 'w-full' : 'rounded-xl overflow-hidden'
      }`}
      style={{ aspectRatio: theaterMode ? '21/9' : '16/9' }}
      onMouseMove={handleActivity}
      onMouseLeave={() => playing && setControlsVisible(false)}
      onClick={() => { togglePlay(); setShowSpeedMenu(false); }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onPlay={() => { setPlaying(true); scheduleHide(); }}
        onPause={() => { setPlaying(false); clearTimeout(hideTimerRef.current); setControlsVisible(true); }}
        onLoadedMetadata={() => setDuration(videoRef.current.duration)}
        onTimeUpdate={() => {
          if (!seeking) setCurrentTime(videoRef.current.currentTime);
        }}
        onProgress={() => {
          const v = videoRef.current;
          if (v.buffered.length > 0) {
            setBuffered(v.buffered.end(v.buffered.length - 1));
          }
        }}
        onVolumeChange={() => {
          setVolume(videoRef.current.volume);
          setMuted(videoRef.current.muted);
        }}
        preload="metadata"
      />

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 40%, rgba(0,0,0,0.3) 100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="absolute top-0 left-0 right-0 px-4 pt-3 pb-6">
          <p className="text-white text-sm font-medium drop-shadow truncate">{title}</p>
        </div>

        {/* Seek bar */}
        <div className="px-4 pb-2">
          <div
            ref={seekBarRef}
            className="relative h-1 bg-gray-600/70 rounded-full cursor-pointer group/seek"
            onClick={handleSeekClick}
            onMouseDown={() => setSeeking(true)}
            onMouseUp={() => setSeeking(false)}
            onMouseMove={handleSeekMouseMove}
          >
            {/* Buffered track */}
            <div
              className="absolute left-0 top-0 h-full bg-gray-400/50 rounded-full transition-[width]"
              style={{ width: `${bufferedPct}%` }}
            />
            {/* Progress track */}
            <div
              className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute w-3 h-3 bg-white rounded-full -top-1 opacity-0 group-hover/seek:opacity-100 transition-opacity shadow"
              style={{ left: `calc(${progressPct}% - 6px)` }}
            />
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between px-4 pb-3">
          {/* Left controls */}
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="text-white hover:text-emerald-400 transition-colors">
              {playing ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Skip back 5s */}
            <button
              onClick={(e) => { e.stopPropagation(); seek(-5); }}
              className="text-white hover:text-emerald-400 transition-colors"
              title="Rewind 5s"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
              </svg>
            </button>

            {/* Skip forward 5s */}
            <button
              onClick={(e) => { e.stopPropagation(); seek(5); }}
              className="text-white hover:text-emerald-400 transition-colors"
              title="Forward 5s"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
              </svg>
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="text-white hover:text-emerald-400 transition-colors"
              >
                {muted || volume === 0 ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3m3 3l3-3M9 12H5" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  e.stopPropagation();
                  const v = parseFloat(e.target.value);
                  videoRef.current.volume = v;
                  if (v > 0) videoRef.current.muted = false;
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-0 group-hover/vol:w-20 transition-[width] duration-200 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Time display */}
            <span className="text-white text-xs font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Playback speed */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowSpeedMenu((s) => !s); }}
                className="text-white text-xs font-bold hover:text-emerald-400 transition-colors px-1"
              >
                {speed}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-8 right-0 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-xl z-20">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSpeed(s);
                        videoRef.current.playbackRate = s;
                        setShowSpeedMenu(false);
                      }}
                      className={`block w-full text-left px-4 py-1.5 text-xs hover:bg-gray-800 transition-colors ${
                        speed === s ? 'text-emerald-400 font-bold' : 'text-gray-300'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theater mode */}
            {onTheaterToggle && (
              <button
                onClick={(e) => { e.stopPropagation(); onTheaterToggle(); }}
                className={`transition-colors ${theaterMode ? 'text-emerald-400' : 'text-white hover:text-emerald-400'}`}
                title="Theater mode"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={theaterMode
                      ? 'M9 9V4.5M9 9H4.5M9 15v4.5M9 15H4.5M15 9h4.5M15 9V4.5M15 15h4.5M15 15v4.5'
                      : 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4'}
                  />
                </svg>
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              className="text-white hover:text-emerald-400 transition-colors"
              title="Fullscreen (F)"
            >
              {fullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 9V4.5M9 9H4.5M9 15v4.5M9 15H4.5M15 9V4.5M15 9h4.5M15 15v4.5M15 15h4.5" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Big play overlay when paused */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaPlayer;
