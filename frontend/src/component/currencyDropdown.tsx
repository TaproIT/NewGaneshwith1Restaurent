import { useCurrency } from "../context/CurrencyContext"; 
import type { SupportedCurrency } from "../types/currency";
// Assuming you have your custom component imports
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react"; 

// Define the available currencies for the dropdown
const availableCurrencies: SupportedCurrency[] = ['LKR', 'USD'];

export default function CurrencyDropdown() {
  const { displayCurrency, setDisplayCurrency } = useCurrency();

  // Use the SupportedCurrency type for the change handler
  const handleItemClick = (newCurrency: SupportedCurrency) => {
    setDisplayCurrency(newCurrency);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 border px-3 py-1 rounded-lg shadow-sm hover:bg-gray-50">
          <span className="text-sm text-gray">{displayCurrency}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32 text-gray">
        {availableCurrencies.map(currency => (
          <DropdownMenuItem key={currency} onClick={() => handleItemClick(currency)}>
            {currency}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}