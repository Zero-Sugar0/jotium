"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { signOut } from "@/app/(auth)/auth"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.name || user.email;

  // Compute initials for avatar fallback
  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.name) {
      return user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email[0]?.toUpperCase() || "U";
    }
    return "U";
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="sm"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground px-2 py-1 min-h-0 h-7"
            >
              <Avatar className="size-6 rounded-lg">
                <AvatarImage src={user.avatar} alt={displayName} />
                <AvatarFallback className="rounded-lg text-xs">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-xs leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-[10px]">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-3" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-48 min-w-40 rounded-lg p-1"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 p-1 text-left text-xs">
                <Avatar className="size-6 rounded-lg">
                  <AvatarImage src={user.avatar} alt={displayName} />
                  <AvatarFallback className="rounded-lg text-xs">{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-xs leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-[10px]">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="gap-2 px-2 py-1 text-xs">
                <Link href="/pricing" className="flex items-center w-full">
                  <Sparkles className="size-4" />
                  Upgrade to Pro
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="gap-2 px-2 py-1 text-xs">
                <Link href="/account" className="flex items-center w-full">
                  <BadgeCheck className="size-4" />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-2 px-2 py-1 text-xs">
                <Link href="/billing" className="flex items-center w-full">
                  <CreditCard className="size-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-2 px-2 py-1 text-xs">
                <Link href="/notifications" className="flex items-center w-full">
                  <Bell className="size-4" />
                  Notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 px-2 py-1 text-xs">
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
