import { api } from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { toast } from "react-toastify";

interface CreateRoomProps {
  onClose: (refresh?: boolean) => void;
}

const AddRoom: React.FC<CreateRoomProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    no: "",
    type: "",
    perDayPrice: "",
    beds: "",
    locker: "",
    tables: "",
    ac: "",
    extraFacilities: [""],
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExtraFacilityChange = (index: number, value: string) => {
    const updated = [...formData.extraFacilities];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, extraFacilities: updated }));
  };

  const addExtraFacilityField = () => {
    setFormData((prev) => ({
      ...prev,
      extraFacilities: [...prev.extraFacilities, ""],
    }));
  };

  const removeExtraFacilityField = (index: number) => {
    const updated = formData.extraFacilities.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, extraFacilities: updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.no || !formData.type || !formData.perDayPrice) {
      toast.error("Please fill all required fields");
      return;
    }

    const facilities = [
  `Beds: ${formData.beds}`,
  `Locker: ${formData.locker}`,
  `Tables: ${formData.tables}`,
  `AC: ${formData.ac}`,
  ...formData.extraFacilities
    .filter((f) => f.trim() !== "")
    .map((val, idx) => `Extra Facility ${idx + 1}: ${val}`),
];


    try {
      setLoading(true);
      const payload = {
        no: formData.no,
        type: formData.type,
        perDayPrice: Number(formData.perDayPrice),
        facilities,
        isMaintenance: false, // default
      };

      const response = await api.post("/room", payload);

      if (response.status === 200 || response.status === 201) {
        toast.success("Room created successfully!");
        onClose(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create room.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.no && formData.type && formData.perDayPrice;

  return (
    <div className="p-6 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-800">Add New Room</h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-sm text-gray">
        {/* Room No */}
        <div className="grid grid-cols-6 items-center">
          <Label className="col-span-2">Room No</Label>
          <div className="col-span-1">:</div>
          <Input
            className="col-span-3 truncate text-ellipsis overflow-hidden w-full max-w-xs"
            placeholder="Enter Room Number"
            title="Enter Room Number"
            value={formData.no}
            onChange={(e) => handleChange("no", e.target.value)}
          />
        </div>

        {/* Type */}
        <div className="grid grid-cols-6 items-center">
          <Label className="col-span-2">Type</Label>
          <div className="col-span-1">:</div>
          <Input
            className="col-span-3 truncate text-ellipsis overflow-hidden w-full max-w-xs"
            placeholder="Enter Room Type"
            title="Enter Room Type"
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
            className="col-span-3 truncate text-ellipsis overflow-hidden w-full max-w-xs"
            placeholder="Enter Price per Day"
            title="Enter Price per Day"
            value={formData.perDayPrice}
            onChange={(e) => handleChange("perDayPrice", e.target.value)}
          />
        </div>

        {/* Default Facilities */}
        <div className="grid grid-cols-6 items-center">
          <Label className="col-span-2">Beds</Label>
          <div className="col-span-1">:</div>
          <Input
            className="col-span-3 truncate text-ellipsis overflow-hidden w-full max-w-xs"
            placeholder="Details about Beds"
            title="Details about Beds"
            value={formData.beds}
            onChange={(e) => handleChange("beds", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-6 items-center">
          <Label className="col-span-2">Locker</Label>
          <div className="col-span-1">:</div>
          <Input
            className="col-span-3 truncate text-ellipsis overflow-hidden w-full max-w-xs"
            placeholder="Details about Locker"
            title="Details about Locker"
            value={formData.locker}
            onChange={(e) => handleChange("locker", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-6 items-center">
          <Label className="col-span-2">Tables</Label>
          <div className="col-span-1">:</div>
          <Input
            className="col-span-3 truncate text-ellipsis overflow-hidden w-full max-w-xs"
            placeholder="Details about Tables"
            title="Details about Tables"
            value={formData.tables}
            onChange={(e) => handleChange("tables", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-6 items-center">
          <Label className="col-span-2">AC</Label>
          <div className="col-span-1">:</div>
          <Input
            className="col-span-3 truncate text-ellipsis overflow-hidden w-full max-w-xs"
            placeholder="Details about AC"
            title="Details about AC"
            value={formData.ac}
            onChange={(e) => handleChange("ac", e.target.value)}
          />
        </div>

        {/* Extra Facilities */}
        <div className="grid grid-cols-6 items-start">
          <Label className="col-span-2">Extra Facilities</Label>
          <div className="col-span-1">:</div>
          <div className="col-span-3 space-y-2">
            {formData.extraFacilities.map((facility, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  className="truncate text-ellipsis overflow-hidden w-full max-w-xs"
                  placeholder={`Extra Facility ${index + 1}`}
                  title={`Extra Facility ${index + 1}`}
                  value={facility}
                  onChange={(e) =>
                    handleExtraFacilityChange(index, e.target.value)
                  }
                />
                {formData.extraFacilities.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeExtraFacilityField(index)}
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addExtraFacilityField}
            >
              + Add Extra Facility
            </Button>

        {/* Submit */}
        <Button
          className={`w-full mt-6 ${
            isFormValid
              ? "bg-primary text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          type="submit"
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Add Room"
          )}
        </Button>
      </form>
    </div>
  );
};

export default AddRoom;
