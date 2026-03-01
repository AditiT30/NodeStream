import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MediaPlayer from '../components/MediaPlayer';
import TelemetryDashboard from '../components/TelemetryDashboard';
import StreamImage from '../components/StreamImage.jsx';
import videosData from '../data/videos.json';

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function VideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const video = videosData.find((v) => v.id === id);

  const [theaterMode, setTheaterMode] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [liked, setLiked] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState(video?.likes ?? 0);
  const [subscribed, setSubscribed] = useState(false);

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <p className="text-xl font-semibold">Video not found</p>
        <button onClick={() => navigate('/')} className="mt-4 text-emerald-400 hover:underline text-sm">
          ← Back to home
        </button>
      </div>
    );
  }

  const related = videosData.filter((v) => v.id !== id && v.category === video.category).slice(0, 6);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setOptimisticLikes((prev) => prev - 1);
    } else {
      setLiked(true);
      setOptimisticLikes((prev) => prev + 1);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-950 ${theaterMode ? 'px-0' : 'px-4 max-w-screen-2xl mx-auto'}`}>
      <div className={`flex gap-6 ${theaterMode ? 'flex-col' : 'flex-col xl:flex-row'} py-4`}>

        {/* Main column */}
        <div className={theaterMode ? 'w-full' : 'flex-1 min-w-0'}>

          {/* Player */}
          <div className={theaterMode ? 'w-full bg-black' : 'rounded-xl overflow-hidden'}>
            <MediaPlayer
              src={video.videoUrl}
              title={video.title}
              theaterMode={theaterMode}
              onTheaterToggle={() => setTheaterMode((t) => !t)}
            />
          </div>

          <div className={theaterMode ? 'px-4' : ''}>
            {/* Video meta */}
            <div className="mt-4">
              <h1 className="text-white font-semibold text-lg leading-snug">{video.title}</h1>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                {/* Channel info */}
                <div className="flex items-center gap-3">
                  <img
                    src={video.channelAvatar}
                    alt={video.channel}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{video.channel}</p>
                    <p className="text-xs text-gray-500">142K subscribers</p>
                  </div>
                  <button
                    onClick={() => setSubscribed((s) => !s)}
                    className={`ml-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                      subscribed
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-950 hover:bg-gray-200'
                    }`}
                  >
                    {subscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Like (optimistic) */}
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      liked
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {formatCount(optimisticLikes)}
                  </button>

                  <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>

                  <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Save
                  </button>
                </div>
              </div>

              {/* Stats + description */}
              <div className="mt-4 bg-gray-900 rounded-xl p-4">
                <div className="flex gap-4 text-sm text-gray-400 mb-3">
                  <span>{formatCount(video.views)} views</span>
                  <span>{video.uploadedAt}</span>
                  <span className="px-2 py-0.5 bg-gray-800 rounded-full text-xs text-gray-300">{video.category}</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{video.description}</p>
              </div>
            </div>

            {/* Telemetry panel */}
            <div className="mt-4">
              <button
                onClick={() => setShowTelemetry((s) => !s)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors mb-3"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${showTelemetry ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {showTelemetry ? 'Hide' : 'Show'} Stream Telemetry
              </button>
              {showTelemetry && <TelemetryDashboard active />}
            </div>
          </div>
        </div>

        {/* Related videos column */}
        {!theaterMode && (
          <div className="w-full xl:w-96 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Up next</h2>
            <div className="flex flex-col gap-3">
              {related.map((rv) => (
                <button
                  key={rv.id}
                  onClick={() => navigate(`/video/${rv.id}`)}
                  className="flex gap-3 text-left hover:bg-gray-900 rounded-xl p-2 transition-colors group"
                >
                  <StreamImage
                    src={rv.thumbnail}
                    alt={rv.title}
                    className="w-40 flex-shrink-0 rounded-lg"
                  />
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                      {rv.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{rv.channel}</p>
                    <p className="text-xs text-gray-600">{formatCount(rv.views)} views · {rv.uploadedAt}</p>
                    <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded mt-1 inline-block">
                      {rv.duration}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoPage;
