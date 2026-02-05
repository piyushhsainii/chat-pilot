import Sidebar from "@/components/Sidebar";
import { getWorkspaceData } from "@/lib/getWorkspaceData";
import { createClient } from "@/lib/supabase/server";
import DashboardHydrator from "@/provider/DashboardHydrator";
import DashboardProvider from "@/provider/DashboardProvider";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) {
    redirect("/login");
  }

  // 📦 Load all dashboard data
  const workspaceData = await getWorkspaceData(user.id);

  if (!workspaceData.workspaces) {
    redirect("/onboarding");
  }
  return (
    <>
      <DashboardProvider
        data={{
          user,
          workspace: workspaceData.workspaces,
          bots: workspaceData.bots ?? [],
        }}
      >
        <DashboardHydrator
          data={{
            bots: workspaceData.bots,
            user,
            // @ts-ignore
            workspaces: workspaceData.workspaces,
          }}
        />
        <div
          className="flex h-screen bg-slate-50 font-sans antialiased text-slate-900 overflow-hidden"
        // style={{ "--cp-sidebar-w": "256px" } as React.CSSProperties}
        >
          <Sidebar />
          {/* Spacer for fixed sidebar */}
          <div
            className="shrink-0 transition-[width] duration-300"
          />
          <main
            className="flex-1 min-h-0 p-8 max-w-full overflow-y-auto overflow-x-hidden"
          >
            {children}
          </main>
        </div>
      </DashboardProvider>
    </>
  );
}
