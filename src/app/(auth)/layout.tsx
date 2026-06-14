import { AuthLayout } from "@/features/auth/components/authLayout";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <AuthLayout children={children} />;
};

export default Layout;
