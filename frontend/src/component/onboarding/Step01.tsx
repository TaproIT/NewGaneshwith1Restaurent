import { useForm } from "react-hook-form";
import { useEffect } from "react";

// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useDispatch, useSelector } from "react-redux";
import {
  nextStep,
  saveStep01Data,
} from "@/features/onboarding/onboardingSlice";
import type { RootState } from "@/app/store";

type Step01FormData = {
  hotel: string;
  guestName: string;
  email: string;
  whatsapp: string;
  passportID: string;
  country: string;
  adults: number;
  kids: number;
  checkIn: string;
  checkOut: string;
  lengthOfStay: number;
  totalGuests: number;
};

export default function Step01() {
  const step01Data = useSelector(
    (state: RootState) => state.onboarding.step01Data
  );

  const form = useForm<Step01FormData>({
    defaultValues: step01Data,
  });

  const dispatch = useDispatch();

  // auto-calculate length of stay
  useEffect(() => {
    const { checkIn, checkOut } = form.getValues();
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.max(end.getTime() - start.getTime(), 0);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      form.setValue("lengthOfStay", diffDays);
    }
  }, [form.watch("checkIn"), form.watch("checkOut")]);

  useEffect(() => {
    const { adults, kids } = form.getValues();
    form.setValue("totalGuests", adults + kids);
  }, [form.watch("adults"), form.watch("kids")]);

  const onSubmit = (data: Step01FormData) => {
    console.log("Step 01 data:", data);
    dispatch(nextStep());
    dispatch(saveStep01Data(data));
  };

  // TODO: add error messages

  return (
    <div className="p-6 rounded-2xl bg-mainWhite h-[calc(100vh-140px)]">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        {/* Hotel Selection */}
        <FormField
          control={form.control}
          name="hotel"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => field.onChange("Hotel A")}
                  className={`w-75 h-10 ${
                    field.value === "Hotel A"
                      ? "bg-secondary text-white hover:bg-secondary"
                      : ""
                  }`}
                >
                  Hotel A
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => field.onChange("Hotel B")}
                  className={`w-75 h-10 ${
                    field.value === "Hotel B"
                      ? "bg-secondary text-white hover:bg-secondary"
                      : ""
                  }`}
                >
                  Hotel B
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-5 p-5 border-2 rounded-2xl mt-10">
          <div className="flex justify-between">
            <FormField
              control={form.control}
              name="guestName"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-50">Guest Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter guest name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-50">Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between">
            <FormField
              control={form.control}
              name="passportID"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-50">Passport ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter passport ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-50">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="guest@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between">
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-50">WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="07X XXX XXXX"
                      {...field}
                      maxLength={10}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between">
            <FormField
              control={form.control}
              name="totalGuests"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-50">Total Guests</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} disabled />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lengthOfStay"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <Label className="w-50">Length of Stay</Label>
                  <FormControl>
                    <Input type="number" {...field} disabled />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between">
            {/* Adults */}
            <FormField
              control={form.control}
              name="adults"
              render={({ field }) => (
                <FormItem className="flex items-center w-100">
                  <Label className="w-35">Adults</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() =>
                        field.onChange(Math.max(field.value - 1, 0))
                      }
                      className="bg-white text-black border-gray border-2 hover:bg-white hover:text-black"
                    >
                      -
                    </Button>
                    <span>{field.value}</span>
                    <Button
                      type="button"
                      onClick={() => field.onChange(field.value + 1)}
                      className="bg-white text-black border-gray border-2 hover:bg-white hover:text-black"
                    >
                      +
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Check-in */}
            <FormField
              control={form.control}
              name="checkIn"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <Label className="w-35">Check-in</Label>
                  <FormControl className="w-70">
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between">
            {/* Kids */}
            <FormField
              control={form.control}
              name="kids"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <Label className="w-35">Kids</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() =>
                        field.onChange(Math.max(field.value - 1, 0))
                      }
                      className="bg-white text-black border-gray border-2 hover:bg-white hover:text-black"
                    >
                      -
                    </Button>
                    <span>{field.value}</span>
                    <Button
                      type="button"
                      onClick={() => field.onChange(field.value + 1)}
                      className="bg-white text-black border-gray border-2 hover:bg-white hover:text-black"
                    >
                      +
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Check-out */}
            <FormField
              control={form.control}
              name="checkOut"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <Label className="w-35">Check-out</Label>
                  <FormControl className="w-70">
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="w-70">
              Continue
            </Button>
          </div>
        </div>
      </form>
    </Form>
    </div>
  );
}
