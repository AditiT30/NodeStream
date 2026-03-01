function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="shimmer rounded-xl w-full" style={{ aspectRatio: '16/9' }} />
      <div className="flex gap-3">
        <div className="shimmer rounded-full w-9 h-9 flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2 pt-0.5">
          <div className="shimmer rounded h-3.5 w-full" />
          <div className="shimmer rounded h-3 w-4/5" />
          <div className="shimmer rounded h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default SkeletonCard;
