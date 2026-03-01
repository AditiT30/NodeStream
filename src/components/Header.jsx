import useUIStore from '../store/useUIStore';

function Header() {
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-gray-950 border-b border-gray-800 h-14 sticky top-0 z-10 flex-shrink-0">
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-800 text-gray-300 transition-colors"
          title="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <span className="text-gray-950 font-black text-base leading-none">N</span>
          </div>
          <span className="text-lg font-semibold tracking-tight hidden sm:block text-white">
            node<span className="text-emerald-400">Stream</span>
          </span>
        </a>
      </div>

      {/* Center: Search — connected to global Zustand state */}
      <div className="flex items-center flex-1 max-w-xl mx-4">
        <div className="flex w-full border border-gray-700 rounded-full overflow-hidden focus-within:border-emerald-500 bg-gray-900 transition-colors">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos, channels, categories…"
            className="flex-1 px-4 py-1.5 text-sm outline-none bg-transparent text-gray-100 placeholder-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-3 text-gray-500 hover:text-gray-300 transition-colors"
              title="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button className="px-4 bg-gray-800 border-l border-gray-700 hover:bg-gray-700 transition-colors">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right: Icons */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-full hover:bg-gray-800 text-gray-300 hidden sm:block transition-colors" title="Upload">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.277A1 1 0 0121 8.677V15.32a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
        </button>
        <button className="p-2 rounded-full hover:bg-gray-800 text-gray-300 transition-colors relative" title="Notifications">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button className="w-8 h-8 rounded-full bg-emerald-500 text-gray-950 text-sm font-bold flex items-center justify-center hover:bg-emerald-400 transition-colors">
          U
        </button>
      </div>
    </header>
  );
}

export default Header;
