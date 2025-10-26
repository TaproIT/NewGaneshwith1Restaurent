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

interface InvoiceFormProps {
  onFormStatus: (status: boolean) => void; // parent callback
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onFormStatus }) => {
  const dispatch = useDispatch();
  const invoiceFormData = useSelector(
    (state: RootState) => state.invoice.invoiceFormData
  );

  // ✅ Initialize form with validation rules
  const form = useForm<invoiceData>({
    defaultValues: invoiceFormData,
    mode: "onSubmit",
  });

  const { control, handleSubmit, watch, setValue, formState } = form;
  const { errors } = formState;

  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");
  const adults = watch("adults");
  const kids = watch("kids");

  // ✅ Calculate length of stay
  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.max(end.getTime() - start.getTime(), 0);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setValue("lengthOfStay", diffDays);
    }
  }, [checkIn, checkOut, setValue]);

  // ✅ Calculate total guests
  useEffect(() => {
    setValue("totalGuests", (adults || 0) + (kids || 0));
  }, [adults, kids, setValue]);

  // ✅ Handle form submit
  const onSubmit = (data: invoiceData) => {
    // Check if required fields are filled
    const requiredFields = ["name", "checkIn", "checkOut", "adults", "kids"];
    const allRequiredFilled = requiredFields.every(
      (field) =>
        data[field as keyof invoiceData] !== "" &&
        data[field as keyof invoiceData] !== undefined &&
        data[field as keyof invoiceData] !== null
    );

    // Send validation status to parent
    onFormStatus(allRequiredFilled);

    // Dispatch data to redux
    dispatch(setInvoiceData(data));
  };

  return (
    <div className="bg-mainWhite p-6 rounded-2xl mb-5">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
          {/* ✅ Name */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="name"
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex items-center">
                    <FormLabel className="w-1/3">Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage>{errors.name?.message}</FormMessage>
                </FormItem>
              )}
            />
          </div>

          {/* ✅ Adults & Check-in */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="adults"
              rules={{
                required: "Number of adults is required",
                min: { value: 1, message: "At least 1 adult required" },
              }}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex items-center">
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
                        onClick={() => field.onChange((field.value || 0) + 1)}
                        className="bg-white text-black border border-gray-300 hover:bg-white hover:text-black"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <FormMessage>{errors.adults?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="checkIn"
              rules={{ required: "Check-in date is required" }}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex items-center">
                    <FormLabel className="w-1/3">Check-in</FormLabel>
                    <FormControl className="w-2/3">
                      <Input type="date" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage>{errors.checkIn?.message}</FormMessage>
                </FormItem>
              )}
            />
          </div>

          {/* ✅ Kids & Check-out */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="kids"
              rules={{ required: "Number of kids is required" }}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex items-center">
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
                        onClick={() => field.onChange((field.value || 0) + 1)}
                        className="bg-white text-black border border-gray-300 hover:bg-white hover:text-black"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <FormMessage>{errors.kids?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="checkOut"
              rules={{
                required: "Check-out date is required",
                validate: (value) =>
                  !checkIn ||
                  new Date(value) >= new Date(checkIn) ||
                  "Check-out cannot be before check-in",
              }}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex items-center">
                    <FormLabel className="w-1/3">Check-out</FormLabel>
                    <FormControl className="w-2/3">
                      <Input type="date" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage>{errors.checkOut?.message}</FormMessage>
                </FormItem>
              )}
            />
          </div>

          {/* ✅ Read-only fields */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="totalGuests"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-1/2">Total Guests</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      disabled
                      className="border-0 focus:ring-0 focus:outline-none shadow-none text-black"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="lengthOfStay"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-1/2">Length of Stay</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      disabled
                      className="border-0 focus:ring-0 focus:outline-none shadow-none"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* ✅ Submit */}
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
