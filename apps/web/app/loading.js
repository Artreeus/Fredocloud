function LoadingCard({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-3xl border border-white/50 bg-white/70 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_35%),linear-gradient(180deg,_#fffdf7_0%,_#f6efe5_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <LoadingCard className="h-28" />
        <div className="grid gap-6 lg:grid-cols-[1.4fr,0.9fr]">
          <LoadingCard className="h-80" />
          <div className="grid gap-6">
            <LoadingCard className="h-36" />
            <LoadingCard className="h-36" />
          </div>
        </div>
        <LoadingCard className="h-72" />
      </div>
    </main>
  );
}
