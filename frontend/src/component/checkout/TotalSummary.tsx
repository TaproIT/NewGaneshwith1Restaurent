import { useCurrency } from "@/context/CurrencyContext";
import { useRates } from "@/context/RateContext";
import { convertAndFormatPrice } from "@/util/priceConverter";
import React from "react";

interface Props {
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  total: number;
}

const TotalSummary: React.FC<Props> = ({
  subtotal,
  tax,
  // serviceCharge,
  discount,
  total,
}) => {
  const { rates } = useRates();
  const { displayCurrency } = useCurrency();

  return (
    <div className="border-t mt-4 pt-4 space-y-2 text-sm">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{convertAndFormatPrice(subtotal, rates, displayCurrency)}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax</span>
        <span>{convertAndFormatPrice(tax, rates, displayCurrency)}</span>
      </div>
      {/* <div className="flex justify-between">
        <span>Service Charge (10%)</span>
        <span>
          {convertAndFormatPrice(serviceCharge, rates, displayCurrency)}
        </span>
      </div> */}
      <div className="flex justify-between">
        <span>Discount</span>
        <span>-{convertAndFormatPrice(discount, rates, displayCurrency)}</span>
      </div>
      <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
        <span>Total</span>
        <span>{convertAndFormatPrice(total, rates, displayCurrency)}</span>
      </div>
    </div>
  );
};

export default TotalSummary;
