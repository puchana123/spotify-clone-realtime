const PlaylistSkeleton = () => {
  return Array.from({ length: 7 }).map((_, index) => (
    <div key={index} className="p-2 rounded-md flex items-center gap-3">
      <div className="h-12 w-12 rounded-md bg-zinc-800 flex-shrink-0 animate-pulse" />
      <div className="flex-1 min-w-0 hidden md:block space-y-2">
        <div className="h-4 w-3/4 rounded bg-zinc-800 animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-zinc-800 animate-pulse" />
      </div>
    </div>
  ));
}

export default PlaylistSkeleton