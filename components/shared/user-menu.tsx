"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { UserRound, LogOut, UserCog, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function prettify(email?: string | null) {
  if (!email) return "My Account";
  return email.split("@")[0].replace(/[._-]/g, " ");
}

function roleLabel(role?: string) {
  if (role === "PATIENT") return "Patient";
  if (role === "PROVIDER") return "Provider";
  if (role === "EMPLOYER_ADMIN") return "Employer Admin";
  if (role === "SUPER_ADMIN") return "Super Admin";
  return "User";
}

export function UserMenu() {
  const router = useRouter();
  const { data } = useSession();
  const email = data?.user?.email ?? null;
  const role = data?.user?.role;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="sm" className="gap-2">
          <UserRound className="h-4 w-4" />
          <span className="hidden md:inline">{prettify(email)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="truncate text-sm">{email ?? "No email"}</p>
          <p className="text-xs text-muted-foreground">{roleLabel(role)}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <IdCard className="h-4 w-4" />
          My Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/profile?edit=true")}>
          <UserCog className="h-4 w-4" />
          Edit Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
