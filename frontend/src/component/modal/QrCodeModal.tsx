import React from "react";
import { Button } from "@/components/ui/button";
import { CircleX } from "lucide-react";
import QR from "@/assets/Images/qr.webp";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWhatsApp: () => void;
  onEmail: () => void;
  loading?: boolean;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, onWhatsApp, onEmail, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg w-96 relative flex flex-col justify-center">
        <h2 className="text-lg font-bold mb-4 text-center">Send QR Code</h2>

        {/* Close Button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="absolute top-2 right-2"
        >
          <CircleX />
        </Button>

        <p className="text-center">How would you like to receive the QR code?</p>

        {/* QR Image */}
        <div className="flex justify-center my-4">
          <img src={QR} alt="qr" width={100} height={100} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-5 justify-center mb-6">
          <Button variant="outline" className="w-25 cursor-pointer" onClick={onEmail}>
            {loading ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span> : "Email"}
          </Button>
          <Button className="w-25 cursor-pointer" onClick={onWhatsApp}>
            WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QrCodeModal;
