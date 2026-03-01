import { useState, useEffect, useMemo } from 'react';
import videosData from '../data/videos.json';

function useVideos(searchQuery = '', category = 'All') {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVideos(videosData);
      setLoading(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  const filteredVideos = useMemo(() => {
    let result = videos;
    if (category !== 'All') {
      result = result.filter((v) => v.category === category);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.channel.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [videos, searchQuery, category]);

  const updateVideoLikes = (videoId, delta) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, likes: v.likes + delta } : v))
    );
  };

  return { videos: filteredVideos, loading, updateVideoLikes };
}

export default useVideos;
