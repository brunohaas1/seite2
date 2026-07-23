import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { ToastHost } from "@/lib/toast/ToastHost";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
      <ToastHost />
    </div>
  );
}
