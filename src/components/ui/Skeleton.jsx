export function Skeleton({ className = "h-6 w-full" }) {
  return (
    <div
      className={`${className} animate-pulse rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5`}
    />
  );
}

