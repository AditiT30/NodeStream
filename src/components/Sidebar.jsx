import { NavLink } from 'react-router-dom';
import useUIStore from '../store/useUIStore';

const NAV = [
  {
    label: 'Home',
    to: '/',
    end: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15v-6h-6v6H3.75A.75.75 0 013 21V9.75z" />
      </svg>
    ),
  },
  {
    label: 'Trending',
    to: '/?category=Tech',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    label: 'Subscriptions',
    to: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 10l4.553-2.277A1 1 0 0121 8.677V15.32a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      </svg>
    ),
  },
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Library',
    to: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    label: 'History',
    to: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

function GlobalMetricBlurb() {
  const { totalViews, activeStreams, avgBitrate } = useUIStore((s) => s.globalMetrics);

  const fmt = (n) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div className="mx-2 mb-4 p-3 bg-gray-900 border border-gray-800 rounded-xl">
      <p className="text-xs font-semibold text-gray-400 mb-2">Global Metrics</p>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Total Views</span>
          <span className="text-emerald-400 font-mono">{fmt(totalViews)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Active Streams</span>
          <span className="text-sky-400 font-mono">{activeStreams.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Avg Bitrate</span>
          <span className="text-violet-400 font-mono">{avgBitrate} Mbps</span>
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <aside
      className="flex-shrink-0 bg-gray-950 border-r border-gray-800 overflow-hidden transition-all duration-300 flex flex-col"
      style={{ width: sidebarOpen ? 220 : 64 }}
    >
      <nav className="flex flex-col gap-1 p-2 mt-2 flex-1">
        {NAV.map(({ label, to, icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`
            }
            title={!sidebarOpen ? label : undefined}
          >
            <span className="flex-shrink-0">{icon}</span>
            {sidebarOpen && (
              <span className="truncate">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {sidebarOpen && <GlobalMetricBlurb />}
    </aside>
  );
}

export default Sidebar;
