import Sidebar from "@/components/Sidebar";
import { getWorkspaceData } from "@/lib/getWorkspaceData";
import { createClient } from "@/lib/supabase/server";
import { WorkspaceUserWithWorkspace } from "@/lib/types";
import DashboardHydrator from "@/provider/DashboardHydrator";
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
      <DashboardHydrator
        data={{
          bots: workspaceData.bots,
          user,
          // @ts-ignore
          workspaces: workspaceData.workspaces
        }}
      />
      <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-900 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-8 transition-all duration-300 max-w-full overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </>
  );
}
