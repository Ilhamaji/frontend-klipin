import { Sidebar } from "@/components/Sidebar";
import { IdleWrapper } from "@/components/IdleWrapper";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // h-dvh instead of h-screen: on phones 100vh is taller than the visible
    // area while the URL bar is shown, which pushed the bottom of the app
    // (including the search bar) out of reach. dvh tracks the real height.
    <div className="flex h-screen-dvh overflow-hidden bg-white">
      <Sidebar />
      <main className="flex-1 min-w-0 h-full min-h-0 overflow-hidden relative flex flex-col">
        <IdleWrapper>
          {children}
        </IdleWrapper>
      </main>
    </div>
  );
}
