import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RoomTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { type: string }) => void;
}

const RoomTypeModal: React.FC<RoomTypeModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [type, setType] = useState("");

  const handleSubmit = () => {
    if (!type.trim()) return;
    onSubmit({ type });
    setType("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Room Type</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2 flex flex-col gap-2">
          <label className="text-sm font-medium">Room Type</label>
          <Input
            placeholder="Ex: Deluxe"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomTypeModal;
