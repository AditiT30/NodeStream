import { useState, useCallback, useMemo } from 'react';
import useInterval from './useInterval';

const MAX_HISTORY = 30;

function generatePoint() {
  return {
    time: new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    bitrate: parseFloat((2 + Math.random() * 6).toFixed(2)),
    latency: Math.round(10 + Math.random() * 90),
    fps: parseFloat((56 + Math.random() * 6).toFixed(1)),
    bufferHealth: parseFloat((2 + Math.random() * 8).toFixed(1)),
  };
}

function useMetrics(active = true) {
  const [history, setHistory] = useState(() =>
    Array.from({ length: 12 }, generatePoint)
  );
  const [droppedFrames, setDroppedFrames] = useState(0);
  const [resolution, setResolution] = useState('1080p');

  const tick = useCallback(() => {
    const point = generatePoint();
    setHistory((prev) => [...prev.slice(-(MAX_HISTORY - 1)), point]);
    setDroppedFrames((prev) => prev + Math.floor(Math.random() * 3));
    if (Math.random() < 0.04) {
      setResolution((prev) => (prev === '1080p' ? '720p' : '1080p'));
    }
  }, []);

  useInterval(tick, active ? 1000 : null);

  const current = useMemo(() => history[history.length - 1] ?? {}, [history]);

  return { history, current, droppedFrames, resolution };
}

export default useMetrics;
