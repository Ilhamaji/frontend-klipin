import { Sidebar } from "@/components/Sidebar";
import { IdleWrapper } from "@/components/IdleWrapper";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <main className="flex-1 h-full overflow-hidden relative">
        <IdleWrapper>
          {children}
        </IdleWrapper>
      </main>
    </div>
  );
}
