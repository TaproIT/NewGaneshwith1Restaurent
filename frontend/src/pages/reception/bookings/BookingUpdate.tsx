import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/api/axios";
import type { Booking } from "@/types/bookingUpdate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import QrCodeModal from "@/component/modal/QrCodeModal";

const CUSTOMER_VALUES = ["Booking.com", "Open Booking"];
const BREAKFAST_VALUES = ["Included", "Not-Included", "Full Board"];

const BookingUpdate = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomNumbers, setRoomNumbers] = useState<string[]>([]);
  const [roomsForUpdate, setRoomsForUpdate] = useState<any[]>([]);
  const navigate = useNavigate();
  const [isWhatsappAvailable, setIsWhatsappAvailable] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState(false);

  const todayDate = new Date().toISOString().slice(0, 10);

  const form = useForm<Booking>({
    defaultValues: {
      guestName: "",
      country: "",
      customerType: "",
      breakfast: "",
      passportId: "",
      email: "",
      whatsapp: "",
      totalGuests: 0,
      lengthOfStay: 0,
      checkIn: "",
      checkOut: "",
      adults: 0,
      kids: 0,
    },
  });

  const { watch, setValue } = form;

  const adults = watch("adults");
  const kids = watch("kids");

  useEffect(() => {
    setValue("totalGuests", adults + kids);
  }, [adults, kids, setValue]);

  // Fetch booking
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/booking/get-booking/${id}`);

        form.reset(res.data.booking);

        const rooms = res.data.booking.currentRooms.map((r: any) => r.roomNo);
        setRoomNumbers(rooms);

        // Prepare room update structure
        const prepared = res.data.booking.currentRooms.map((r: any) => ({
          roomNo: r.roomNo,
          newPrice: r.price,
          currency: r.currency, // Currency remains the same
        }));
        setRoomsForUpdate(prepared);
      } catch (error) {
        const message =
          (error as any)?.response?.data?.message ||
          (error instanceof Error ? error.message : String(error));
        toast.error(`Error fetching booking: ${message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, form]);

  // Handle room price update change
  const updateRoomPrice = (index: number, value: string) => {
    const updated = [...roomsForUpdate];
    updated[index].newPrice = value;
    setRoomsForUpdate(updated);
  };

  // Submit update
  const onSubmit = async (data: Booking) => {
    setUpdateLoading(true);
    try {
      const payload = {
        ...data,
        updatedRooms: roomsForUpdate, // <--- IMPORTANT
      };

      const res = await api.put(`/booking/${id}/update-booking`, payload);
      toast.success("Booking Updated Successfully");

      const updatedRooms = res.data.booking.currentRooms.map(
        (r: any) => r.roomNo
      );
      setRoomNumbers(updatedRooms);

      const hasWhatsapp = data.whatsapp?.trim() !== "";
      const hasEmail = data.email?.trim() !== "";

      setIsWhatsappAvailable(hasWhatsapp);
      setIsEmailAvailable(hasEmail);

      if (hasWhatsapp || hasEmail) {
        setIsModalOpen(true);
      } else {
        navigate("/bookings");
      }
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error instanceof Error ? error.message : String(error));
      toast.error(`Update failed: ${message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  const onCloseModal = () => {
    setIsModalOpen(false);
    navigate("/bookings");
  };

  const handleWhatsApp = async () => {
    const message = `This is your room number(s): ${roomNumbers.join(", ")}`;
    try {
      const res = await api.post(`/booking/${id}/send-whatsapp`, { message });
      if (res.data?.whatsappLink) {
        window.open(res.data.whatsappLink, "_blank");
      }
      navigate("/bookings");
    } catch (error) {
      const errMsg =
        (error as any)?.response?.data?.message ||
        (error instanceof Error ? error.message : String(error));
      toast.error(errMsg || "Error sending WhatsApp");
    }
  };

  const handleEmail = async () => {
    const message = `This is your room number(s): ${roomNumbers.join(", ")}`;
    setLoading(true);
    try {
      await api.post(`/booking/${id}/send-email`, { message });
      toast.success("Email sent successfully!");
      navigate("/bookings");
    } catch (error) {
      const errMsg =
        (error as any)?.response?.data?.message ||
        (error instanceof Error ? error.message : String(error));
      toast.error(errMsg || "Error sending email");
    } finally {
      onCloseModal();
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col gap-5 p-5 border-2 rounded-2xl mt-10">
            {/* Guest Name & Country */}
            <div className="flex justify-between">
              <FormField
                control={form.control}
                rules={{ required: "Guest name is required" }}
                name="guestName"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <div className="flex items-center">
                      <FormLabel className="w-50">Guest Name</FormLabel>
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
                      <FormLabel className="w-33">Customer Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
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
                      <FormLabel className="w-32">Breakfast</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
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
                      <FormLabel className="w-50">Total Guests</FormLabel>
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
                      <Label className="w-54">Length of Stay</Label>
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
                      <Input
                        type="date"
                        {...field}
                        disabled
                        value={field.value?.slice(0, 10)}
                      />
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
                      <Input
                        type="date"
                        {...field}
                        min={todayDate}
                        value={field.value?.slice(0, 10)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* -------------------- ROOM PRICE UPDATE -------------------- */}
            <div className="p-4 border rounded-xl bg-gray-50">
              <h2 className="font-semibold text-lg mb-3">Room Price Update</h2>

              {roomsForUpdate.map((room, index) => (
                <div
                  key={room.roomNo}
                  className="flex items-center gap-5 mb-3 p-3 border rounded-lg bg-white"
                >
                  <div className="w-32 font-medium">Room {room.roomNo}</div>

                  <Input
                    type="number"
                    placeholder="New Price"
                    className="w-40"
                    value={room.newPrice}
                    step="0.01"
                    min={0}
                    onChange={(e) =>
                      updateRoomPrice(index, e.target.value)
                    }
                  />

                  <div className="font-medium">{room.currency}</div>
                </div>
              ))}
            </div>

            {/* Continue Button */}
            <div className="flex justify-end">
              <Button type="submit" className="w-40">
                {updateLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Update Booking"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <QrCodeModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onWhatsApp={handleWhatsApp}
        onEmail={handleEmail}
        loading={loading}
        isWhatsappAvailable={isWhatsappAvailable}
        isEmailAvailable={isEmailAvailable}
      />
    </div>
  );
};

export default BookingUpdate;
