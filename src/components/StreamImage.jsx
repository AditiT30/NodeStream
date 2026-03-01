import { useRef, useState, useEffect } from 'react';

/**
 * StreamImage – Intersection Observer + blur-up loading.
 * Prevents Layout Shift (aspect-ratio box) and boosts LCP by
 * deferring off-screen images until they enter the viewport.
 */
function StreamImage({ src, alt, className = '', aspectRatio = '16/9' }) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px', threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-gray-800 ${className}`}
      style={{ aspectRatio }}
    >
      {/* Shimmer placeholder — shown until the real image loads */}
      {!isLoaded && <div className="absolute inset-0 shimmer" />}

      {/* Blur-up layer: same src with heavy blur, fades out once loaded */}
      {isVisible && !isLoaded && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-60"
        />
      )}

      {/* Full-resolution image, fades in on load */}
      {isVisible && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}

export default StreamImage;
