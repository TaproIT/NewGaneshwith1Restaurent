import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export default function CurrencyDropdown() {
  const [currency, setCurrency] = useState("LKR"); // default selected

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 border px-3 py-1 rounded-lg shadow-sm hover:bg-gray-50">
          <span className="text-sm text-gray">{currency}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32 text-gray">
        <DropdownMenuItem onClick={() => setCurrency("LKR")}>
          LKR
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrency("USD")}>
          USD
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
