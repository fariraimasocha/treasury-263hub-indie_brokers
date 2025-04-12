"use client";

import { cn } from "@/lib/utils";
import { Home, Users, MapPinHouse, BadgeDollarSign } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Departments",
    url: "/dashboard/departments",
    icon: MapPinHouse,
  },
  {
    title: "Budget",
    url: "/dashboard/budget",
    icon: BadgeDollarSign,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  // Get user data from session
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "user@example.com";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/auth/signIn");
  };

  return (
    <Sidebar className="border-sidebar-border">
      <SidebarHeader className="px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-white">
            <Home className="h-6 w-6 text-gray-900" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-navy tracking-tight">
              Techstack
            </h1>
            <p className="text-xs text-navy/80">treasure erp</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-6 border-t">
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <a
                    href={item.url}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      pathname === item.url
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </a>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto w-full justify-start gap-3 px-3 py-2"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-medium">{userName}</span>
                <span className="text-xs text-muted-foreground">
                  {userEmail}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="hover:bg-accent"
              onClick={handleProfileClick}
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleLogout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
