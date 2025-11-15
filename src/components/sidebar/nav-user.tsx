import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
  IconInfoCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar-context";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { supabase } from "@/supabase";
import { useNavigate } from "react-router-dom";
import type { UserData } from "@/lib/api/users";
import { userCache } from "@/utils/user-cache";

export function NavUser({
  user,
  onProfileClick,
  onAboutClick,
}: {
  user: UserData;
  onProfileClick: () => void;
  onAboutClick: () => void;
}) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

  const initials =
    user.data.display_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage
                  src={user.avatar}
                  referrerPolicy="no-referrer"
                  onError={(e) =>
                    console.error("Avatar load error (sidebar):", e)
                  }
                />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.data.display_name}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.data.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user.avatar}
                    alt={user.data.display_name}
                    referrerPolicy="no-referrer"
                    onError={(e) =>
                      console.error("Avatar load error (dropdown):", e)
                    }
                  />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.data.display_name}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.data.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={onProfileClick}>
                <IconUserCircle />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onAboutClick}>
                <IconInfoCircle />
                Sobre
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={async () => {
                // Clear all cached user data before logging out
                userCache.clearAllCache();
                await supabase.auth.signOut();
                navigate("/");
              }}
            >
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
