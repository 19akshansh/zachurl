import { AppHeader } from "@/components/appHeader";
import { AppSidebar } from "@/components/appSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireAuth } from "@/lib/authUtils";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const auth = requireAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {" "}
        <AppHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
