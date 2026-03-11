import { PageLoader } from "@/components/ui/page-loader";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <PageLoader className="min-h-screen" />
    </div>
  );
}
