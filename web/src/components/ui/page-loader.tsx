import { cn } from "@/lib/utils";

interface PageLoaderProps {
  className?: string;
}

export function PageLoader({ className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-1 items-center justify-center",
        className
      )}
      aria-label="Loading"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"
        role="status"
      />
    </div>
  );
}
