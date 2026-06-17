"use client";

import {
  CreditCardIcon,
  HistoryIcon,
  LogOutIcon,
  SettingsIcon,
  Link2Icon,
  BarChart3Icon,
  QrCodeIcon,
  PlusCircleIcon,
  UserIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/authClient";

const navGroups = [
  {
    label: "Management",
    items: [
      { title: "All Links", icon: Link2Icon, url: "/urls" },
      { title: "QR Codes", icon: QrCodeIcon, url: "/qr-codes" },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Analytics", icon: BarChart3Icon, url: "/analytics" },
      { title: "Click History", icon: HistoryIcon, url: "/history" },
    ],
  },
  {
    label: "Configuration",
    items: [{ title: "Settings", icon: SettingsIcon, url: "/settings" }],
  },
];

export const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return null;
  }

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logged out successfully");
          router.push("/signin");
          router.refresh();
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    });
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-white/5 bg-[#09090b]"
    >
      <SidebarHeader className="pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-transparent group-data-[state=collapsed]:px-2"
            >
              <Image
                src="/mainAssets/logoPlain.svg"
                alt="ZachURL"
                width={28}
                height={28}
                className="shrink-0"
              />
              <div className="flex flex-col gap-0.5 leading-none ml-2 group-data-[state=collapsed]:hidden">
                <span className="text-lg font-bold tracking-tight text-white">
                  ZachURL
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-blue-500/80">
                  Shorten URLs in seconds!
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="group-data-[state=collapsed]:px-0 px-1 mt-4">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="h-11 w-full bg-blue-600 font-semibold text-white transition-all hover:bg-blue-500 hover:text-white hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-[0.98] group-data-[state=collapsed]:px-2 group-data-[state=collapsed]:justify-start"
              >
                <Link href="/urls/new" className="flex items-center gap-3">
                  <PlusCircleIcon className="size-5 shrink-0 fill-white/20" />
                  <span className="group-data-[state=collapsed]:hidden whitespace-nowrap">
                    Shorten Link
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-3">
            <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 group-data-[state=collapsed]:hidden">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2 group-data-[state=collapsed]:px-0 mt-1">
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    pathname === item.url ||
                    pathname.startsWith(`${item.url}/`);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={active}
                        className={cn(
                          "relative h-10 px-3 transition-colors duration-200 group-data-[state=collapsed]:px-2 group-data-[state=collapsed]:justify-start",
                          active
                            ? "bg-blue-600/10 text-blue-500 hover:bg-blue-600/15 hover:text-blue-500"
                            : "text-muted-foreground hover:bg-white/5 hover:text-white",
                        )}
                      >
                        <Link
                          href={item.url}
                          className="flex items-center gap-3"
                        >
                          <item.icon
                            className={cn(
                              "size-4 shrink-0",
                              active ? "text-blue-500" : "opacity-70",
                            )}
                          />
                          <span className="font-medium group-data-[state=collapsed]:hidden whitespace-nowrap">
                            {item.title}
                          </span>
                          {active && (
                            <div className="absolute left-0 h-5 w-1 rounded-full bg-blue-500 group-data-[state=collapsed]:hidden" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Plans & Billing"
              className="text-muted-foreground hover:bg-white/5 hover:text-white group-data-[state=collapsed]:px-2 group-data-[state=collapsed]:justify-start"
            >
              <Link
                href="/billing"
                className="flex items-center gap-3 px-3 group-data-[state=collapsed]:px-0"
              >
                <CreditCardIcon className="size-4 shrink-0 opacity-70" />
                <span className="font-medium text-sm group-data-[state=collapsed]:hidden whitespace-nowrap">
                  Plans & Billing
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarSeparator className="my-4 bg-white/5" />

          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="group h-14 rounded-xl bg-white/[0.03] p-2 border border-white/5 transition-all hover:bg-white/[0.06] hover:border-white/10 group-data-[state=collapsed]:border-none group-data-[state=collapsed]:bg-transparent group-data-[state=collapsed]:px-1"
              onClick={handleLogout}
            >
              <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-500 ring-1 ring-blue-500/20">
                <UserIcon className="size-5 shrink-0" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5 ml-2 text-left group-data-[state=collapsed]:hidden">
                <span className="text-sm font-semibold text-white/90">
                  {session?.user?.name ?? "User"}
                </span>
                <span className="text-[11px] text-muted-foreground group-hover:text-blue-400 transition-colors">
                  Sign out
                </span>
              </div>
              <LogOutIcon className="size-4 text-muted-foreground/50 group-hover:text-white transition-colors group-data-[state=collapsed]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
