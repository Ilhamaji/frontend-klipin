import { Sidebar } from "@/components/Sidebar";
import { IdleWrapper } from "@/components/IdleWrapper";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // h-dvh instead of h-screen: on phones 100vh is taller than the visible
    // area while the URL bar is shown, which pushed the bottom of the app out
    // of reach. dvh tracks the real height.
    <div className="flex h-screen-dvh overflow-hidden bg-white">
      <Sidebar />
      {/* pb-16 reserves the height of the fixed bottom tab bar on phones so no
          content is trapped underneath it. From md up the bar is gone. */}
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-16 md:pb-0">
        <IdleWrapper>{children}</IdleWrapper>
      </main>
    </div>
  );
}
