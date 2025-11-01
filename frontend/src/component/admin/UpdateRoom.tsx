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

  const [formData, setFormData] = useState({
    no: viewedRoom.no || "",
    type: viewedRoom.type || "",
    perDayPrice: viewedRoom.perDayPrice.toString() || "",
    facilities: viewedRoom.facilities?.length ? viewedRoom.facilities : [""],
    isMaintenance: viewedRoom.isMaintenance || false,
  });

  // ✅ Sync form data when viewedRoom changes
  useEffect(() => {
    setFormData({
      no: viewedRoom.no || "",
      type: viewedRoom.type || "",
      perDayPrice: viewedRoom.perDayPrice.toString() || "",
      facilities: viewedRoom.facilities?.length ? viewedRoom.facilities : [""],
      isMaintenance: viewedRoom.isMaintenance || false,
    });
    setEditable(false); // optional reset when switching rooms
  }, [viewedRoom]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFacilityChange = (index: number, value: string) => {
    const updated = [...formData.facilities];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, facilities: updated }));
  };

  const addFacilityField = () => {
    setFormData((prev) => ({
      ...prev,
      facilities: [...prev.facilities, ""],
    }));
  };

  const removeFacilityField = (index: number) => {
    const updated = formData.facilities.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, facilities: updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.no || !formData.type || !formData.perDayPrice) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        type: formData.type,
        perDayPrice: Number(formData.perDayPrice),
        facilities: formData.facilities.filter((f) => f.trim() !== ""),
        isMaintenance: formData.isMaintenance,
      };

      const response = await api.put(`/room/update/${viewedRoom._id}`, payload); // check api

      if (response.status === 200) {
        toast.success("Room updated successfully!");
        onClose(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update room.");
    } finally {
      setLoading(false);
      setEditable(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-800">Room Details</h2>
        <Button
          type="button"
          variant="outline"
          onClick={() => setEditable((prev) => !prev)}
        >
          {editable ? "Cancel" : "Edit"}
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-sm text-gray">
        {/* Room No */}
        <div className="grid grid-cols-6 items-center">
          <Label className="col-span-2">Room No</Label>
          <div className="col-span-1">:</div>
          <Input
            className="col-span-3"
            disabled
            value={formData.no}
            onChange={(e) => handleChange("no", e.target.value)}
          />
        </div>

        {/* Type */}
        <div className="grid grid-cols-6 items-center">
          <Label className="col-span-2">Type</Label>
          <div className="col-span-1">:</div>
          <Input
            className="col-span-3"
            disabled={!editable}
            value={formData.type}
            onChange={(e) => handleChange("type", e.target.value)}
          />
        </div>

        {/* Price per Day */}
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
            {formData.facilities.map((facility, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  disabled={!editable}
                  value={facility}
                  onChange={(e) => handleFacilityChange(index, e.target.value)}
                  placeholder={`Facility ${index + 1}`}
                />
                {editable && formData.facilities.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFacilityField(index)}
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Facility Button */}
        {editable && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addFacilityField}
          >
            + Add Facility
          </Button>
        )}

        {/* Maintenance Toggle */}
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
          <Button
            type="submit"
            className={`w-full mt-6 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Room"}
          </Button>
        )}
      </form>
    </div>
  );
};

export default UpdateRoom;
