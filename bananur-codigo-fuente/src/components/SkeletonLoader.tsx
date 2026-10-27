export default function SkeletonLoader({ type = 'grid' }: { type?: 'grid' | 'detail' | 'table' | 'cards' }) {
  if (type === 'detail') {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-bananur-sand rounded-3xl" />
          <div className="space-y-4 py-4">
            <div className="h-4 bg-bananur-sand rounded w-1/4" />
            <div className="h-8 bg-bananur-sand rounded w-3/4" />
            <div className="h-6 bg-bananur-sand rounded w-1/3" />
            <div className="space-y-2 pt-4">
              <div className="h-4 bg-bananur-sand rounded w-full" />
              <div className="h-4 bg-bananur-sand rounded w-5/6" />
            </div>
            <div className="flex gap-2 pt-6">
              <div className="h-10 w-10 bg-bananur-sand rounded-full" />
              <div className="h-10 w-10 bg-bananur-sand rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-bananur-sand">
            <div className="w-10 h-10 bg-bananur-sand rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-bananur-sand rounded w-1/3" />
              <div className="h-3 bg-bananur-sand rounded w-1/4" />
            </div>
            <div className="h-6 bg-bananur-sand rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse space-y-4">
          <div className="aspect-square bg-bananur-sand rounded-2xl w-full" />
          <div className="h-4 bg-bananur-sand rounded w-1/3" />
          <div className="h-5 bg-bananur-sand rounded w-3/4" />
          <div className="h-4 bg-bananur-sand rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}
