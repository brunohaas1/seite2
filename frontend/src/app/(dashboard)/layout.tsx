import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
