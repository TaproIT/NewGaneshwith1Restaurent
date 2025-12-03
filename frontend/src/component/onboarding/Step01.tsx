import { useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";

// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
import type { BookedRoom } from "@/types/guestDataTypes";

const CUSTOMER_VALUES = ["Booking.com", "Open Booking"];
const BREAKFAST_VALUES = ["Included", "Not-Included", "Full Board"];

type Step01FormData = {
  hotel: string;
  guestName: string;
  email: string;
  whatsapp: string;
  passportId: string;
  country: string;
  adults: number;
  kids: number;
  checkIn: string;
  checkOut: string;
  lengthOfStay: number;
  totalGuests: number;
  currentRooms: BookedRoom[];
  bookingDate: string;
  customerType: string;
  breakfast: string;
};

export default function Step01() {
  const step01Data = useSelector(
    (state: RootState) => state.onboarding.step01Data
  );

  const form = useForm<Step01FormData>({
    defaultValues: {
      ...step01Data,
      customerType: step01Data?.customerType ?? "",
      breakfast: step01Data?.breakfast ?? "",
    },
  });

  const dispatch = useDispatch();

  const checkIn = useWatch({ control: form.control, name: "checkIn" });
  const checkOut = useWatch({ control: form.control, name: "checkOut" });

  // Set today's date for check-in on mount
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const formattedToday = `${yyyy}-${mm}-${dd}`;

    if (!form.getValues("checkIn")) {
      form.setValue("checkIn", formattedToday);
    }
  }, [form]);

  // Auto-calculate length of stay
  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = Math.max(end.getTime() - start.getTime(), 1);
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      const current = form.getValues("lengthOfStay");
      if (days !== current) {
        form.setValue("lengthOfStay", days);
      }
    }
  }, [checkIn, checkOut, form]);

  // Auto-calculate total guests
  useEffect(() => {
    const subscription = form.watch((values) => {
      const total = (values.adults ?? 0) + (values.kids ?? 0);
      if (total !== values.totalGuests) {
        form.setValue("totalGuests", total);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = (data: Step01FormData) => {
    const today = new Date().toISOString();
    const dataWithBookingDate = { ...data, bookingDate: today };
    dispatch(saveStep01Data(dataWithBookingDate));
    dispatch(nextStep());
  };

  const todayDate = new Date().toISOString().split("T")[0];

  return (
    <div className="p-6 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] overflow-y-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          {/* Hotel Selection */}
          <FormField
            control={form.control}
            rules={{ required: "Select a hotel" }}
            name="hotel"
            render={({ field }) => (
              <FormItem>
                <div className="flex gap-5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => field.onChange("Ganesh Garden Beach Cabana")}
                    className={`w-75 h-10 ${
                      field.value === "Ganesh Garden Beach Cabana"
                        ? "bg-secondary text-white hover:bg-secondary"
                        : ""
                    }`}
                  >
                    Ganesh Garden Beach Cabana
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => field.onChange("Marakolliya Beach Resort")}
                    className={`w-75 h-10 ${
                      field.value === "Marakolliya Beach Resort"
                        ? "bg-secondary text-white hover:bg-secondary"
                        : ""
                    }`}
                  >
                    Marakolliya Beach Resort
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Guest Details */}
          <div className="flex flex-col gap-5 p-5 border-2 rounded-2xl">
            {/* Guest Name & Country */}
            <div className="flex justify-between">
              <FormField
                control={form.control}
                rules={{ required: "Guest name is required" }}
                name="guestName"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <div className="flex items-center">
                      <FormLabel className="w-50">
                        Guest Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter guest name" {...field} />
                      </FormControl>
                    </div>
                    <div>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <div className="flex items-center">
                      <FormLabel className="w-50">Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter country" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between">
              <FormField
                control={form.control}
                name="customerType"
                rules={{ required: "Select customer type" }}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <div className="flex items-center">
                      <FormLabel className="w-33">
                        Customer Type <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl className="w-72">
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CUSTOMER_VALUES.map((item) => (
                            <SelectItem value={item} key={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Breakfast */}
              <FormField
                control={form.control}
                name="breakfast"
                rules={{ required: "Select breakfast option" }}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <div className="flex items-center">
                      <FormLabel className="w-32">
                        Breakfast <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl className="w-72">
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BREAKFAST_VALUES.map((item) => (
                            <SelectItem value={item} key={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Passport ID & Email */}
            <div className="flex justify-between">
              <FormField
                control={form.control}
                name="passportId"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <div className="flex items-center">
                      <FormLabel className="w-50">Passport ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter passport ID" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <div className="flex items-center">
                      <FormLabel className="w-50">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="guest@example.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* WhatsApp */}
            <div className="flex justify-between">
              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <div className="flex items-center">
                      <FormLabel className="w-50">WhatsApp</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+947X XXX XXXX"
                          {...field}
                          maxLength={12}
                          minLength={12}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="ml-10" />
                  </FormItem>
                )}
              />
            </div>

            {/* Guests & Length of Stay */}
            <div className="flex justify-between">
              <FormField
                control={form.control}
                rules={{
                  validate: (value) =>
                    value > 0 || "Total Guests must be greater than 0",
                }}
                name="totalGuests"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <div className="flex items-center">
                      <FormLabel className="w-50">
                        Total Guests <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} disabled />
                      </FormControl>
                    </div>
                    <FormMessage className="ml-20" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                rules={{
                  validate: (value) =>
                    value > 0 || "Length must be greater than 0",
                }}
                name="lengthOfStay"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <div className="flex items-center">
                      <Label className="w-54">
                        Length of Stay <span className="text-red-500">*</span>
                      </Label>
                      <FormControl>
                        <Input type="number" {...field} disabled />
                      </FormControl>
                    </div>
                    <FormMessage className="ml-20" />
                  </FormItem>
                )}
              />
            </div>

            {/* Adults & Check-in */}
            <div className="flex justify-between">
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

              {/* Check-in Date */}
              <FormField
                control={form.control}
                name="checkIn"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <Label className="w-35">Check-in</Label>
                    <FormControl className="w-70">
                      <Input type="date" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Kids & Check-out */}
            <div className="flex justify-between">
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

              {/* Check-out Date */}
              <FormField
                control={form.control}
                name="checkOut"
                rules={{
                  validate: (value) => {
                    const selected = new Date(value);
                    if (selected < new Date(todayDate))
                      return "Check-out date cannot be before today";
                    return true;
                  },
                }}
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <Label className="w-35">Check-out</Label>
                    <FormControl className="w-70">
                      <Input type="date" {...field} min={todayDate} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Continue Button */}
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
