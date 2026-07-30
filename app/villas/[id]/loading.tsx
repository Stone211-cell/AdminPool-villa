export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 animate-pulse">
      {/* Hero Skeleton */}
      <div className="relative h-[40vh] md:h-[60vh] bg-gray-200"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative -mt-32">
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl p-6 md:p-12 mb-12">
          {/* Title Skeleton */}
          <div className="h-10 bg-gray-200 rounded-xl w-2/3 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded-xl w-1/3 mb-8"></div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="h-40 bg-gray-200 rounded-2xl w-full"></div>
              <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
            </div>
            
            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              <div className="bg-gray-100 rounded-3xl p-6 h-64 border border-gray-200"></div>
              <div className="bg-gray-100 rounded-3xl p-6 h-48 border border-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
