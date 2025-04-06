export function AdminWarningBanner() {
  return (
    <div className="bg-red-500 text-white p-2 text-center sticky top-0 z-50">
      <p className="text-sm font-medium">
        LOCAL DEVELOPMENT ENVIRONMENT ONLY - This admin interface is not accessible in production
      </p>
    </div>
  );
}
