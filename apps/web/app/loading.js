import { Loader } from "@/components/ui/loader";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas dark:bg-slate-950 transition-colors duration-300">
      {/* Background gradients aligned with the brand schema */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(201,111,74,0.1),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(88,113,93,0.08),transparent_30%)]" />
      
      <Loader size="xl" />
    </main>
  );
}
