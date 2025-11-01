import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/api/axios";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react"; // eye icons
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

interface CreateUserProps {
  onClose: (refresh?: boolean) => void;
}

const CreateUser: React.FC<CreateUserProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    userRole: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // toggle password
  const userRole = useSelector((state: RootState) => state.user.role);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.contactNumber ||
      !formData.userRole ||
      !formData.password
    ) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/admin/create-user", formData);

      if (response.status === 200 || response.status === 201) {
        toast.success("User created successfully!");
        setFormData({
          name: "",
          email: "",
          contactNumber: "",
          userRole: "",
          password: "",
        });
        onClose(true); // refresh table
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.contactNumber &&
    formData.userRole &&
    formData.password;

  return (
    <div className="p-6 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-800">Create New User</h2>
        <Button variant="ghost" size="sm" onClick={() => onClose()}>
          ✕
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-sm text-gray">
        {/* Name */}
        <div className="grid grid-cols-6 items-center">
          <Label className="col-span-2">Name</Label>
          <div className="col-span-1">:</div>
          <Input
            className="col-span-3"
            placeholder="User Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        {/* User Role */}
        <div className="grid grid-cols-6 items-center">
          <Label className="col-span-2">User Role</Label>
          <div className="col-span-1">:</div>
          <Select
            value={formData.userRole}
            onValueChange={(value) => handleChange("userRole", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              {userRole === "Super-Admin" && (
                <SelectItem value="Super-Admin">Super-Admin</SelectItem>
              )}
              {userRole === "Super-Admin" && (
                <SelectItem value="Admin">Admin</SelectItem>
              )}
              <SelectItem value="Reception">Reception</SelectItem>
              <SelectItem value="Beach-Restaurant-Staff">
                Beach Staff
              </SelectItem>
              <SelectItem value="Pool-Restaurant-Staff">Pool Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contact Number */}
        <div className="grid grid-cols-6 items-center">
          <Label className="col-span-2">Contact No</Label>
          <div className="col-span-1">:</div>
          <Input
            className="col-span-3"
            placeholder="07xx xxx xxx"
            value={formData.contactNumber}
            onChange={(e) => handleChange("contactNumber", e.target.value)}
            maxLength={10}
          />
        </div>

        {/* Email */}
        <div className="grid grid-cols-6 items-center">
          <Label className="col-span-2">Email</Label>
          <div className="col-span-1">:</div>
          <Input
            className="col-span-3"
            placeholder="sampleemail@gmail.com"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>

        {/* Password with Eye Toggle */}
        <div className="grid grid-cols-6 items-center relative">
          <Label className="col-span-2">Password</Label>
          <div className="col-span-1">:</div>
          <div className="col-span-3 relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-gray-600" />
              ) : (
                <Eye className="w-4 h-4 text-gray-600" />
              )}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          className={`w-full mt-6 ${
            isFormValid
              ? "bg-primary text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          type="submit"
          disabled={!isFormValid || loading}
        >
          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : "Create"}
        </Button>
      </form>
    </div>
  );
};

export default CreateUser;
