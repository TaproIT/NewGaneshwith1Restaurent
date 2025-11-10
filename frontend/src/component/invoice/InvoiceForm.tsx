import { useEffect, useImperativeHandle, forwardRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  setInvoiceData,
  type invoiceData,
} from "@/features/invoice/invoiceSlice";
import { api } from "@/api/axios";
import { toast } from "react-toastify";

interface InvoiceFormProps {
  onFormStatus: (status: boolean) => void;
  onInvoiceSuccess?: () => void;
}

const InvoiceForm = forwardRef(({ onFormStatus }: InvoiceFormProps, ref) => {
  const dispatch = useDispatch();
  const invoiceFormData = useSelector(
    (state: RootState) => state.invoice.invoiceFormData
  );

  const form = useForm<invoiceData>({
    defaultValues: {
      ...invoiceFormData,
      rooms: invoiceFormData.rooms || [{ category: "", count: 1, price: 0 }],
      currencyType: "LKR", // ✅ make sure default value is here
      total: 0,
    },
    mode: "onSubmit",
  });

  const { control, handleSubmit, watch, setValue, formState, reset } = form;
  const { errors } = formState;
  const [roomTypes, setRoomTypes] = useState<{ _id: string; type: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");
  const adults = watch("adults");
  const kids = watch("kids");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rooms",
  });

  useImperativeHandle(ref, () => ({
    resetForm() {
      reset({
        customerName: "",
        travelAgentName: "",
        checkIn: "",
        checkOut: "",
        adults: 0,
        kids: 0,
        totalGuests: 0,
        lengthOfStay: 0,
        hotelType: "",
        rooms: [{ category: "", count: 1, price: 0 }],
      });
      onFormStatus(false);
    },
  }));

  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = Math.max(end.getTime() - start.getTime(), 0);
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setValue("lengthOfStay", days);
    }
  }, [checkIn, checkOut, setValue]);

  useEffect(() => {
    setValue("totalGuests", (adults || 0) + (kids || 0));
  }, [adults, kids, setValue]);

  const onSubmit = async (data: invoiceData) => {
    setLoading(true);
    try {
      const payload = {
        checkInDate: data.checkIn,
        checkOutDate: data.checkOut,
        hotelType: data.hotelType.replace("Hotel ", ""), // "Hotel A" → "A"
        customerName: data.customerName,
        travelAgentName: data.travelAgentName,
        numberOfMembers: data.totalGuests,
        currencyType: data.currencyType,
        selectedRooms: data.rooms.map((room) => ({
          roomCategory: room.category,
          count: room.count,
          perDayPrice: room.price,
        })),
        total: data.total,
      };

      await api.post("/invoice", payload);

      toast.success("Invoice created successfully");
      reset();

      dispatch(setInvoiceData(data));
      onFormStatus(true);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const res = await api.get("room/room-category"); // ← CHANGE IF YOUR ENDPOINT DIFFERS
        setRoomTypes(res.data || []);
      } catch (err) {
        toast.error("Failed to load room types");
      }
    };
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    const rooms = watch("rooms") || [];
    const stay = watch("lengthOfStay") || 0;

    let total = 0;
    rooms.forEach((r) => {
      total += (r.price || 0) * (r.count || 0) * stay;
    });

    setValue("total", total);
  }, [watch("rooms"), watch("lengthOfStay"), setValue]);

  return (
    <div className="bg-mainWhite p-6 rounded-2xl mb-5">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
          {/* Hotel Selection */}
          <FormField
            control={form.control}
            rules={{ required: "Select a hotel" }}
            name="hotelType"
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

          {/* ✅ Name */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="customerName"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex items-center">
                    <FormLabel className="w-1/3">Guest Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage>{errors.customerName?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="travelAgentName"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex items-center">
                    <FormLabel className="w-1/3">Agent Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage>{errors.travelAgentName?.message}</FormMessage>
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
                        onClick={() =>
                          field.onChange(Math.max(field.value - 1, 0))
                        }
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
                        onClick={() =>
                          field.onChange(Math.max(field.value - 1, 0))
                        }
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

          <FormField
            control={control}
            name="currencyType"
            rules={{ required: "Currency is required" }}
            render={({ field }) => (
              <FormItem className="flex items-center">
                <FormLabel className="w-40">Currency</FormLabel>
                <FormControl>
                  <select {...field} className="border p-2 rounded w-100">
                    <option value="LKR">LKR</option>
                    <option value="USD">USD</option>
                    <option value="EURO">EURO</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Rooms</h3>
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ category: "", count: 1, price: 0 })}
              >
                + Add Room
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-4 gap-4 items-end border p-4 rounded-md"
              >
                <FormField
                  control={control}
                  name={`rooms.${index}.category`}
                  rules={{ required: "Required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="border p-2 rounded w-full"
                        >
                          <option value="">Select</option>
                          {roomTypes.map((room) => (
                            <option key={room._id} value={room._id}>
                              {room.type}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`rooms.${index}.count`}
                  rules={{ required: "Required", min: 1 }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Count</FormLabel>
                      <Input type="number" {...field} min={1} />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`rooms.${index}.price`}
                  rules={{ required: "Required", min: 0 }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Per Day Price</FormLabel>
                      <Input type="number" {...field} min={0} />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          {/* ✅ Submit */}
          <div className="flex justify-end">
            <Button type="submit" className="w-1/2">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Generate Invoice"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
});

export default InvoiceForm;
