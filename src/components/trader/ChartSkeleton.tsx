export function ChartSkeleton() {
  return (
    <div className="w-full h-full bg-[#0A0A0A] rounded-2xl animate-pulse">
      <div className="h-full flex items-center justify-center">
        <div className="space-y-3 w-full px-12">
          <div className="h-4 bg-[#1A1A1A] rounded w-3/4 mx-auto" />
          <div className="h-64 bg-[#1A1A1A] rounded" />
          <div className="flex gap-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-8 bg-[#1A1A1A] rounded flex-1" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
