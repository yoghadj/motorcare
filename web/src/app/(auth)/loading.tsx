import { PageLoader } from "@/components/ui/page-loader";

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <PageLoader className="min-h-[300px]" />
    </div>
  );
}
