import { ChevronDown, LogOut } from "lucide-react";
import { signOutAction } from "@/server/auth/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type UserMenuProps = {
  name: string;
  image?: string | null;
  email?: string | null;
};

export function UserMenu({ name, image, email }: UserMenuProps) {
  const fallback = name
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-12 items-center gap-3 rounded-full border border-slate-200 bg-white px-3 shadow-xs transition hover:bg-slate-50 focus:outline-none">
        <Avatar className="size-8">
          <AvatarImage src={image ?? undefined} alt={name} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <div className="hidden text-left sm:block">
          <div className="text-sm font-medium text-slate-950">{name}</div>
          {email ? <div className="text-xs text-slate-500">{email}</div> : null}
        </div>
        <ChevronDown className="size-4 text-slate-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start rounded-md"
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
