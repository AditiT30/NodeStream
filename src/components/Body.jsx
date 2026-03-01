import useUIStore from '../store/useUIStore';
import useVideos from '../hooks/useVideos';
import VideoCard from './VideoCard';
import SkeletonCard from './SkeletonCard';

const CATEGORIES = [
  'All', 'Tech', 'Gaming', 'Music', 'Education',
  'Science', 'Sports', 'Design', 'Travel',
];

function EmptyState({ query }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <svg className="w-16 h-16 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <p className="text-gray-400 font-medium">No results for &ldquo;{query}&rdquo;</p>
      <p className="text-gray-600 text-sm mt-1">Try different keywords or browse a category</p>
    </div>
  );
}

function Body() {
  const searchQuery = useUIStore((s) => s.searchQuery);
  const activeCategory = useUIStore((s) => s.activeCategory);
  const setActiveCategory = useUIStore((s) => s.setActiveCategory);

  const { videos, loading, updateVideoLikes } = useVideos(searchQuery, activeCategory);

  return (
    <div className="px-4 py-4 max-w-screen-2xl mx-auto">
      {/* Category tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-white text-gray-950'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Live now strip */}
      {!searchQuery && activeCategory === 'All' && !loading && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm font-semibold text-gray-300">Live now</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos
              .filter((v) => v.isLive)
              .map((v) => (
                <VideoCard key={v.id} video={v} onLike={updateVideoLikes} />
              ))}
          </div>
        </div>
      )}

      {/* Search results label */}
      {searchQuery && !loading && (
        <p className="text-sm text-gray-400 mb-4">
          {videos.length > 0
            ? `${videos.length} result${videos.length !== 1 ? 's' : ''} for "${searchQuery}"`
            : null}
        </p>
      )}

      {/* Main grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <EmptyState query={searchQuery || activeCategory} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {videos
            .filter((v) => !v.isLive || searchQuery || activeCategory !== 'All')
            .map((v) => (
              <VideoCard key={v.id} video={v} onLike={updateVideoLikes} />
            ))}
        </div>
      )}
    </div>
  );
}

export default Body;
