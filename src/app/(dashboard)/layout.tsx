import { AppHeader } from "@/components/appHeader";
import { AppSidebar } from "@/components/appSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
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
