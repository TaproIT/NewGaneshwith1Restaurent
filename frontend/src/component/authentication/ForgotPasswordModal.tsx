import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { setForgotPasswordModalOpen } from "@/features/auth/authSlice";
import { api } from "@/api/axios";
import { toast } from "react-toastify";

type Step1Form = {
  email: string;
};

type Step2Form = {
  tempPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPasswordModal() {
  const { isForgotPasswordModalOpen } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch<AppDispatch>();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 1 form: enter email
  const step1 = useForm<Step1Form>({
    defaultValues: { email: "" },
  });

  // Step 2 form: enter temp password + new password
  const step2 = useForm<Step2Form>({
    defaultValues: { tempPassword: "", newPassword: "", confirmPassword: "" },
  });

  // Step 1 — send temp password
  const handleEmailSubmit = async (data: Step1Form) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/forgot-password", data);

      if(response.data.status === "success") {
        toast.success("Successfully send temporary password into email")
        setStep(2);
      }
     
    } catch (err: any) {
      toast.error("Something went wrong sending email");
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify temp password and reset actual password
  const handleNewPasswordSubmit = async (data: Step2Form) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    console.log("data", data);

    try {
      // Assume you have email from step1 or Redux, etc.
      const email = step1.getValues("email"); // or use a prop / state / redux selector

      const response = await api.post("/auth/reset-password", {
        ...data,
        email, // include email here
      });

      if (response.data.status === "success"){
        toast.success("Password updated successfully!");
        step2.reset();
      }

      setTimeout(() => {
        dispatch(setForgotPasswordModalOpen(false));
        setStep(1);
      }, 1000);
    } catch (err: any) {
      toast.error("Something went wrong while updating password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isForgotPasswordModalOpen}
      onOpenChange={(open) => dispatch(setForgotPasswordModalOpen(open))}
    >
      <DialogContent className="w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Reset Your Password" : "Enter Temporary Password"}
          </DialogTitle>
        </DialogHeader>

        {/* STEP 1 - Enter Email */}
        {step === 1 ? (
          <form
            onSubmit={step1.handleSubmit(handleEmailSubmit)}
            className="space-y-4 mt-2"
          >
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                className="mt-3"
                id="email"
                type="email"
                placeholder="Enter your registered email"
                {...step1.register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Enter a valid email address",
                  },
                })}
              />
              {step1.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {step1.formState.errors.email.message}
                </p>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <DialogFooter>
              <Button
                type="submit"
                disabled={loading}
                className="cursor-pointer"
              >
                {loading ? "Sending..." : "Send Temporary Password"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          // STEP 2 - Enter temp password + new password
          <form
            onSubmit={(e) => {
              e.preventDefault();
              step2.handleSubmit(handleNewPasswordSubmit)(e);
            }}
            className="space-y-4 mt-2"
          >
            <div>
              <Label htmlFor="tempPassword">Temporary Password</Label>
              <Input
                className="mt-3"
                id="tempPassword"
                type="text"
                placeholder="Enter temporary password"
                autoComplete="off"
                {...step2.register("tempPassword", {
                  required: "Temporary password is required",
                })}
              />
            </div>

            <div className="relative">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                className="mt-3"
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                autoComplete="new-password"
                {...step2.register("newPassword", {
                  required: "New password is required",
                })}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 rounded p-1"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                className="mt-3"
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                autoComplete="new-password"
                {...step2.register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (v) =>
                    v === step2.getValues("newPassword") ||
                    "Passwords do not match",
                })}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 rounded p-1"
                onClick={() => setShowConfirm((prev) => !prev)}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="cursor-pointer"
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
