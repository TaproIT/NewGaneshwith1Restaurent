import QRCode from "qrcode";
import { randomUUID } from "crypto";
import { uploadBufferToCloudinary } from "./cloudinary.js";

function primitiveToString(val) {
    if (val === null) return "";
    if (val === undefined) return "";
    if (val instanceof Date) return val.toISOString();
    if (typeof val === "boolean") return val ? "true" : "false";
    if (typeof val === "number") return Number.isFinite(val) ? String(val) : "";
    if (typeof val === "string") return val;
    try {
        return JSON.stringify(val);
    } catch {
        return String(val);
    }
}

function flattenObject(input, prefix = "", out = {}) {
    if (input === null || input === undefined) {
        out[prefix] = "";
        return out;
    }

    if (Array.isArray(input)) {
        input.forEach((v, i) => {
            const key = prefix ? `${prefix}[${i}]` : `[${i}]`;
            if (v !== null && typeof v === "object") {
                flattenObject(v, key, out);
            } else {
                out[key] = primitiveToString(v);
            }
        });
        return out;
    }

    if (typeof input === "object" && Object.prototype.toString.call(input) === "[object Object]") {
        const keys = Object.keys(input);
        if (keys.length === 0 && prefix) {
            out[prefix] = "";
            return out;
        }
        keys.forEach((k) => {
            const v = input[k];
            const key = prefix ? `${prefix}.${k}` : k;
            if (v !== null && typeof v === "object" && !(v instanceof Date)) {
                flattenObject(v, key, out);
            } else {
                out[key] = primitiveToString(v);
            }
        });
        return out;
    }
    out[prefix] = primitiveToString(input);
    return out;
}

function serializePairs(obj, { kvSep = "=", lineSep = "\n" } = {}) {
    const flat = flattenObject(obj);
    const lines = Object.keys(flat)
        .sort()
        .map((k) => `${k}${kvSep}${flat[k] ?? ""}`);
    return lines.join(lineSep);
}

async function generateQrTextBuffer(data) {
    const normalized = JSON.parse(JSON.stringify(data ?? {}));
    const text = serializePairs(normalized, {
        kvSep: "=",
        lineSep: "\n",
    });
    return QRCode.toBuffer(text, {
        type: "png",
        errorCorrectionLevel: "M",
        margin: 1,
        width: 600,
        scale: 8,
    });
}

export async function generateAndUploadQr(data, options = {}) {
    const pngBuffer = await generateQrTextBuffer(data);
    const publicId =
        options.public_id ||
        `qr_${Date.now()}_${randomUUID().replaceAll("-", "").slice(0, 12)}`;

    const { public_id, secure_url } = await uploadBufferToCloudinary(pngBuffer, {
        folder: options.folder || process.env.CLOUDINARY_FOLDER || "bookings/qr",
        public_id: publicId,
        tags: ["booking", "qr"],
    });

    return { publicId: public_id, url: secure_url };
}
