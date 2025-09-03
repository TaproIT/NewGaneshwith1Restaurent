import {parsePhoneNumberFromString} from 'libphonenumber-js';
import fetch from 'node-fetch';

export const sendWhatsAppMessage = async (to, body, qrUrl) => {
    let cleaned = to.replace(/[^\d+]/g, '');

    if (cleaned.startsWith('+94')) {
    } else if (cleaned.startsWith('0')) {
        cleaned = '+94' + cleaned.slice(1);
    } else if (!cleaned.startsWith('+')) {
        cleaned = '+94' + cleaned;
    }

    const phoneNumber = parsePhoneNumberFromString(cleaned);
    if (!phoneNumber || !phoneNumber.isValid()) {
        throw new Error(`Invalid phone number: ${to}`);
    }

    const cleanNumber = phoneNumber.number.replace(/\D/g, '');

    let finalQrUrl = qrUrl;
    if (qrUrl) {
        const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(qrUrl)}`);
        finalQrUrl = await res.text();
    }

    let fullMessage = body;
    if (finalQrUrl) fullMessage += `\n\nDownload your QR: ${finalQrUrl}`;

    const encodedMessage = encodeURIComponent(fullMessage);
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
};
