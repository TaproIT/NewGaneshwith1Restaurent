import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { setInvoiceData, type invoiceData } from "@/features/invoice/invoiceSlice";

// Zod schema with coercion for numeric fields

const InvoiceForm: React.FC = () => {
  const dispatch = useDispatch();
  const invoiceFormData = useSelector(
    (state: RootState) => state.invoice.invoiceFormData
  );

  // Initialize form
  const form = useForm({
    defaultValues: invoiceFormData,
  });

  // Watch values
  const checkIn = form.watch("checkIn");
  const checkOut = form.watch("checkOut");
  const adults = form.watch("adults");
  const kids = form.watch("kids");

  // Calculate length of stay
  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.max(end.getTime() - start.getTime(), 0);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      form.setValue("lengthOfStay", diffDays);
    }
  }, [checkIn, checkOut, form]);

  // Calculate total guests
  useEffect(() => {
    form.setValue("totalGuests", adults + kids);
  }, [adults, kids, form]);

  const onSubmit = (data: invoiceData) => {
    dispatch(setInvoiceData(data));
  };

  return (
    <div className="bg-mainWhite p-6 rounded-2xl mb-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-1/3">Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Adults & Check-in */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="adults"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-1/3">Adults</FormLabel>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => field.onChange(Math.max(field.value - 1, 0))}
                      className="bg-white text-black border border-gray-300 hover:bg-white hover:text-black"
                    >
                      -
                    </Button>
                    <span>{field.value}</span>
                    <Button
                      type="button"
                      onClick={() => field.onChange(field.value + 1)}
                      className="bg-white text-black border border-gray-300 hover:bg-white hover:text-black"
                    >
                      +
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="checkIn"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-1/3">Check-in</FormLabel>
                  <FormControl className="w-2/3">
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Kids & Check-out */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="kids"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-1/3">Kids</FormLabel>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => field.onChange(Math.max(field.value - 1, 0))}
                      className="bg-white text-black border border-gray-300 hover:bg-white hover:text-black"
                    >
                      -
                    </Button>
                    <span>{field.value}</span>
                    <Button
                      type="button"
                      onClick={() => field.onChange(field.value + 1)}
                      className="bg-white text-black border border-gray-300 hover:bg-white hover:text-black"
                    >
                      +
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="checkOut"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-1/3">Check-out</FormLabel>
                  <FormControl className="w-2/3">
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Total Guests & Length of Stay */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="totalGuests"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-1/2">Total Guests</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} disabled className="border-0 focus:ring-0 focus:outline-none shadow-none text-black"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lengthOfStay"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-1/2">Length of Stay</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} disabled className="border-0 focus:ring-0 focus:outline-none shadow-none"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <Button type="submit" className="w-1/2">
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default InvoiceForm;
