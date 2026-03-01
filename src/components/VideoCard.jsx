import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StreamImage from './StreamImage.jsx';

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function VideoCard({ video, onLike }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState(video.likes);

  // Optimistic UI: update count immediately, simulate API call in bg
  const handleLike = useCallback(
    (e) => {
      e.stopPropagation();
      if (liked) {
        setLiked(false);
        setOptimisticLikes((prev) => prev - 1);
        onLike?.(video.id, -1);
      } else {
        setLiked(true);
        setOptimisticLikes((prev) => prev + 1);
        onLike?.(video.id, 1);
        // Simulate async server confirmation (would use fetch/mutation in prod)
        setTimeout(() => {}, 500);
      }
    },
    [liked, video.id, onLike]
  );

  return (
    <article
      className="group cursor-pointer"
      onClick={() => navigate(`/video/${video.id}`)}
    >
      <div className="relative">
        <StreamImage
          src={video.thumbnail}
          alt={video.title}
          className="rounded-xl group-hover:rounded-none transition-all duration-200"
        />
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
          {video.duration}
        </span>
        {video.isLive && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
        )}
      </div>

      <div className="flex gap-3 mt-3">
        <img
          src={video.channelAvatar}
          alt={video.channel}
          className="w-9 h-9 rounded-full flex-shrink-0 object-cover"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-100 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
            {video.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{video.channel}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
            <span>{formatCount(video.views)} views</span>
            <span>·</span>
            <span>{video.uploadedAt}</span>
          </div>

          {/* Optimistic like button */}
          <button
            onClick={handleLike}
            className={`mt-1.5 flex items-center gap-1 text-xs transition-colors ${
              liked ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill={liked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            {formatCount(optimisticLikes)}
          </button>
        </div>
      </div>
    </article>
  );
}

export default VideoCard;
