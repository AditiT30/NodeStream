import { memo, useMemo, useCallback, Profiler } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import useMetrics from '../hooks/useMetrics';

// Chart components are memoised so they only re-render when their data slice changes
const BitrateChart = memo(function BitrateChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={130}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="time" stroke="#4b5563" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
        <YAxis stroke="#4b5563" tick={{ fontSize: 9 }} domain={[0, 10]} unit="Mb" />
        <Tooltip
          contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 11 }}
          labelStyle={{ color: '#9ca3af' }}
          itemStyle={{ color: '#10b981' }}
        />
        <Line type="monotone" dataKey="bitrate" stroke="#10b981" dot={false} strokeWidth={2} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
});

const LatencyChart = memo(function LatencyChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={130}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="time" stroke="#4b5563" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
        <YAxis stroke="#4b5563" tick={{ fontSize: 9 }} domain={[0, 120]} unit="ms" />
        <Tooltip
          contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 11 }}
          labelStyle={{ color: '#9ca3af' }}
          itemStyle={{ color: '#f59e0b' }}
        />
        <Line type="monotone" dataKey="latency" stroke="#f59e0b" dot={false} strokeWidth={2} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
});

const FpsChart = memo(function FpsChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={130}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="time" stroke="#4b5563" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
        <YAxis stroke="#4b5563" tick={{ fontSize: 9 }} domain={[50, 65]} unit="fps" />
        <Tooltip
          contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 11 }}
          labelStyle={{ color: '#9ca3af' }}
          itemStyle={{ color: '#818cf8' }}
        />
        <Line type="monotone" dataKey="fps" stroke="#818cf8" dot={false} strokeWidth={2} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
});

function StatCard({ label, value, unit, color = 'text-emerald-400', sub }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold font-mono ${color}`}>
        {value}
        {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
      </p>
      {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

// React.Profiler onRender callback — logs to console for dev visibility
function onRenderCallback(id, phase, actualDuration) {
  if (import.meta.env.DEV) {
    console.debug(`[Profiler] ${id} ${phase} – ${actualDuration.toFixed(2)}ms`);
  }
}

function TelemetryDashboard({ active = true }) {
  const { history, current, droppedFrames, resolution } = useMetrics(active);

  // useMemo ensures we don't recompute the label-slice on every render
  const chartData = useMemo(
    () => history.map((p) => ({ ...p, time: p.time.slice(-5) })),
    [history]
  );

  const getLatencyColor = useCallback((ms) => {
    if (ms < 30) return 'text-emerald-400';
    if (ms < 70) return 'text-yellow-400';
    return 'text-red-400';
  }, []);

  return (
    <Profiler id="TelemetryDashboard" onRender={onRenderCallback}>
      <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-semibold text-white">Live Stream Telemetry</h2>
          </div>
          <span className="text-xs text-gray-500 font-mono">1s interval</span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <StatCard
            label="Bitrate"
            value={current.bitrate?.toFixed(1) ?? '—'}
            unit="Mbps"
          />
          <StatCard
            label="Latency"
            value={current.latency ?? '—'}
            unit="ms"
            color={getLatencyColor(current.latency)}
          />
          <StatCard
            label="FPS"
            value={current.fps?.toFixed(1) ?? '—'}
            color="text-indigo-400"
          />
          <StatCard
            label="Buffer"
            value={current.bufferHealth?.toFixed(1) ?? '—'}
            unit="s"
            color="text-sky-400"
          />
          <StatCard
            label="Dropped"
            value={droppedFrames}
            unit="f"
            color={droppedFrames > 50 ? 'text-red-400' : 'text-gray-300'}
            sub="cumulative"
          />
          <StatCard
            label="Resolution"
            value={resolution}
            color="text-violet-400"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1 font-medium">Bitrate (Mbps)</p>
            <BitrateChart data={chartData} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1 font-medium">Latency (ms)</p>
            <LatencyChart data={chartData} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1 font-medium">Frame Rate (fps)</p>
            <FpsChart data={chartData} />
          </div>
        </div>
      </div>
    </Profiler>
  );
}

export default TelemetryDashboard;
