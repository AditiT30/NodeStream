import { useMemo } from 'react';
import TelemetryDashboard from '../components/TelemetryDashboard';
import useUIStore from '../store/useUIStore';
import useMetrics from '../hooks/useMetrics';

function KpiCard({ label, value, sub, trend, color = 'text-white' }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          <svg className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 14l5-5 5 5H7z" />
          </svg>
          {Math.abs(trend)}% vs last hour
        </div>
      )}
    </div>
  );
}

function DashboardPage() {
  const { totalViews, activeStreams, avgBitrate } = useUIStore((s) => s.globalMetrics);
  const { current, droppedFrames, resolution } = useMetrics(true);

  const fmt = (n) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  // Derived KPIs computed only when dependencies change
  const healthScore = useMemo(() => {
    const latencyOk = (current.latency ?? 50) < 50 ? 1 : 0;
    const fpsOk = (current.fps ?? 60) > 55 ? 1 : 0;
    const bufferOk = (current.bufferHealth ?? 5) > 3 ? 1 : 0;
    const bitrateOk = (current.bitrate ?? 4) > 2 ? 1 : 0;
    return Math.round(((latencyOk + fpsOk + bufferOk + bitrateOk) / 4) * 100);
  }, [current]);

  return (
    <div className="px-4 py-6 max-w-screen-2xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Stream Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time telemetry · updating every second</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold text-red-400">LIVE</span>
        </div>
      </div>

      {/* Global KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Views"
          value={fmt(totalViews)}
          sub="All time"
          trend={12.4}
          color="text-emerald-400"
        />
        <KpiCard
          label="Active Streams"
          value={activeStreams.toLocaleString()}
          sub="Right now"
          trend={3.1}
          color="text-sky-400"
        />
        <KpiCard
          label="Avg Bitrate"
          value={`${avgBitrate} Mbps`}
          sub="Network average"
          trend={-0.8}
          color="text-violet-400"
        />
        <KpiCard
          label="Stream Health"
          value={`${healthScore}%`}
          sub={healthScore > 80 ? 'All systems nominal' : 'Some degradation'}
          trend={healthScore > 80 ? 2 : -5}
          color={healthScore > 80 ? 'text-emerald-400' : 'text-yellow-400'}
        />
      </div>

      {/* Second row — per-stream stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Latency', value: `${current.latency ?? '—'}ms`, color: 'text-yellow-400' },
          { label: 'Frame Rate', value: `${current.fps?.toFixed(1) ?? '—'} fps`, color: 'text-indigo-400' },
          { label: 'Buffer', value: `${current.bufferHealth?.toFixed(1) ?? '—'}s`, color: 'text-sky-400' },
          { label: 'Bitrate', value: `${current.bitrate?.toFixed(1) ?? '—'} Mb`, color: 'text-emerald-400' },
          { label: 'Dropped Frames', value: String(droppedFrames), color: droppedFrames > 50 ? 'text-red-400' : 'text-gray-300' },
          { label: 'Resolution', value: resolution, color: 'text-violet-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Full telemetry charts */}
      <TelemetryDashboard active />

      {/* Bottom: stream list */}
      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Active Streams</h2>
          <span className="text-xs text-gray-500">{activeStreams.toLocaleString()} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800">
                {['Stream ID', 'Channel', 'Resolution', 'Bitrate', 'Viewers', 'Uptime', 'Status'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_STREAMS.map((s) => (
                <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-gray-400">{s.id}</td>
                  <td className="px-5 py-3 text-gray-200 font-medium">{s.channel}</td>
                  <td className="px-5 py-3 text-gray-400">{s.resolution}</td>
                  <td className="px-5 py-3 text-emerald-400 font-mono">{s.bitrate}</td>
                  <td className="px-5 py-3 text-gray-300">{s.viewers.toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-400 font-mono">{s.uptime}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const MOCK_STREAMS = [
  { id: 'stm_a1f9', channel: 'EsportsWorld', resolution: '1080p60', bitrate: '6.2 Mb', viewers: 52400, uptime: '3:24:17', status: 'Healthy' },
  { id: 'stm_b3d2', channel: 'NeonWave FM', resolution: '720p30', bitrate: '3.8 Mb', viewers: 18700, uptime: '11:02:44', status: 'Healthy' },
  { id: 'stm_c7e5', channel: 'TechFlow', resolution: '1080p60', bitrate: '7.1 Mb', viewers: 8320, uptime: '0:42:11', status: 'Healthy' },
  { id: 'stm_d2f1', channel: 'SpaceTime Academy', resolution: '720p30', bitrate: '2.9 Mb', viewers: 3102, uptime: '1:15:30', status: 'Degraded' },
  { id: 'stm_e8a3', channel: 'ChillWave Radio', resolution: '480p24', bitrate: '1.4 Mb', viewers: 21000, uptime: '22:44:09', status: 'Healthy' },
];

export default DashboardPage;
