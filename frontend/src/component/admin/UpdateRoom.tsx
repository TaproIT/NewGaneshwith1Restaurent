import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import type { Room } from "@/types/roomTypes";

interface UpdateRoomProps {
  viewedRoom: Room;
  onClose: (refresh?: boolean) => void;
}

const UpdateRoom: React.FC<UpdateRoomProps> = ({ viewedRoom, onClose }) => {
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(false);

  const [roomTypes, setRoomTypes] = useState<{ _id: string; type: string }[]>([]);

  type RoomTypeOption = { _id: string; type: string } | null;

  const [formData, setFormData] = useState<{
    no: string;
    type: string | RoomTypeOption;
    perDayPrice: string;
    facilities: string[];
    isMaintenance: boolean;
  }>({
    no: viewedRoom.no || "",
    type: (viewedRoom.type as any) || "", // will store object later
    perDayPrice: viewedRoom.perDayPrice.toString() || "",
    facilities: viewedRoom.facilities?.length ? viewedRoom.facilities : [""],
    isMaintenance: viewedRoom.isMaintenance || false,
  });

  // ✅ Fetch Room Types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await api.get("/room/room-category"); // your endpoint
        setRoomTypes(res.data);
      } catch {
        toast.error("Failed to load room types");
      }
    };

    fetchTypes();
  }, []);

  // ✅ Sync when switching rooms
  useEffect(() => {
    setFormData({
      no: viewedRoom.no || "",
      type: viewedRoom.type || "",
      perDayPrice: viewedRoom.perDayPrice.toString() || "",
      facilities: viewedRoom.facilities?.length ? viewedRoom.facilities : [""],
      isMaintenance: viewedRoom.isMaintenance || false,
    });
    setEditable(false);
  }, [viewedRoom]);

  const handleChange = (field: string, value: any) => {
    if (field === "type") {
      const selected = roomTypes.find((t) => t._id === value) || null;
      setFormData((prev) => ({ ...prev, type: selected }));
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFacilityChange = (index: number, value: string) => {
    const updated = [...formData.facilities];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, facilities: updated }));
  };

  const addFacilityField = () =>
    setFormData((prev) => ({ ...prev, facilities: [...prev.facilities, ""] }));

  const removeFacilityField = (index: number) =>
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type || !formData.perDayPrice) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        type: typeof formData.type === "object" && formData.type !== null ? formData.type._id : formData.type, // ✅ send only the _id or string
        perDayPrice: Number(formData.perDayPrice),
        facilities: formData.facilities.filter((f) => f.trim() !== ""),
        isMaintenance: formData.isMaintenance,
      };

      await api.put(`/room/update/${viewedRoom._id}`, payload);

      toast.success("Room updated successfully!");
      onClose(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update room.");
    } finally {
      setLoading(false);
      setEditable(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-800">Room Details</h2>
        <Button type="button" variant="outline" onClick={() => setEditable((p) => !p)}>
          {editable ? "Cancel" : "Edit"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-sm text-gray">
        {/* Room No */}
        <div className="grid grid-cols-6 items-center">
          <Label className="col-span-2">Room No</Label>
          <div className="col-span-1">:</div>
          <Input className="col-span-3" disabled value={formData.no} />
        </div>

        {/* Type (Dropdown) */}
        <div className="grid grid-cols-6 items-center">
          <Label className="col-span-2">Type</Label>
          <div className="col-span-1">:</div>
          <select
            className="col-span-3 border rounded p-2 bg-white"
            disabled={!editable}
            value={typeof formData.type === "object" && formData.type ? formData.type._id : (formData.type || "")}
            onChange={(e) => handleChange("type", e.target.value)}
          >
            <option value="">Select Room Type</option>
            {roomTypes.map((rt) => (
              <option key={rt._id} value={rt._id}>
                {rt.type}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className="grid grid-cols-6 items-center">
          <Label className="col-span-2">Price per Day</Label>
          <div className="col-span-1">:</div>
          <Input
            type="number"
            className="col-span-3"
            disabled={!editable}
            value={formData.perDayPrice}
            onChange={(e) => handleChange("perDayPrice", e.target.value)}
          />
        </div>

        {/* Facilities */}
        <div className="grid grid-cols-6 items-start">
          <Label className="col-span-2">Facilities</Label>
          <div className="col-span-1">:</div>
          <div className="col-span-3 space-y-2">
            {formData.facilities.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  disabled={!editable}
                  value={f}
                  onChange={(e) => handleFacilityChange(i, e.target.value)}
                  placeholder={`Facility ${i + 1}`}
                />
                {editable && formData.facilities.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeFacilityField(i)}>
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {editable && (
          <Button type="button" variant="outline" size="sm" onClick={addFacilityField}>
            + Add Facility
          </Button>
        )}

        {/* Maintenance */}
        <div className="grid grid-cols-6 items-center">
          <Label className="col-span-2">Maintenance</Label>
          <div className="col-span-1">:</div>
          <input
            type="checkbox"
            disabled={!editable}
            checked={formData.isMaintenance}
            onChange={(e) => handleChange("isMaintenance", e.target.checked)}
          />
        </div>

        {/* Submit */}
        {editable && (
          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? "Updating..." : "Update Room"}
          </Button>
        )}
      </form>
    </div>
  );
};

export default UpdateRoom;
