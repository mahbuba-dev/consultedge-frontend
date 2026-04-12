import Link from "next/link";
import { ChevronDown, Eye, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AvailabilityActionsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="bg-white/15 text-white hover:bg-white/20 hover:text-white">
          Availability
          <ChevronDown className="ml-2 size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/expert/dashboard/set-availability" className="cursor-pointer">
            <PlusCircle className="size-4" />
            Add time slots
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/expert/dashboard/my-schedules" className="cursor-pointer">
            <Eye className="size-4" />
            View my time slots
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
