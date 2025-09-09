import { Select } from "@/components/ui/select";
import React from "react";

const AddItem: React.FC = () => {
  return (
    <div className="mt-4 flex flex-col gap-4">
        <div className="font-medium text-lg text-gray">Add item</div>
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-4 text-sm text-gray">
                <div className="col-span-1">Category</div>
                <div className="col-span-1">:</div>
                <div className="col-span-2">
                    <Select>
                    </Select>
                </div>
            </div>
        </div>
    </div>
  )
};

export default AddItem;
