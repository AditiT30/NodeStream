import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: true,
  searchQuery: '',
  activeCategory: 'All',
  selectedVideoId: null,

  userPreferences: {
    quality: 'auto',
    autoplay: true,
  },

  globalMetrics: {
    totalViews: 8_420_000,
    activeStreams: 1247,
    avgBitrate: 4.2,
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setSelectedVideoId: (id) => set({ selectedVideoId: id }),
  updateGlobalMetrics: (metrics) =>
    set((state) => ({ globalMetrics: { ...state.globalMetrics, ...metrics } })),
}));

export default useUIStore;
