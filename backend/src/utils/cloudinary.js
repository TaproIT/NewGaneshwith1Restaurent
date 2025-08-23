import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
dotenv.config();

let _configured = false;

function ensureConfigured() {
    if (_configured) return;

    const required = ['CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET'];
    const missing = required.filter(k => !process.env[k]);
    if (missing.length) {
        throw new Error(`[Cloudinary] Missing env: ${missing.join(', ')}`);
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:    process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure:     true,
    });

    _configured = true;
}

export function uploadBufferToCloudinary(buffer, options = {}) {
    ensureConfigured();

    const folder = options.folder || process.env.CLOUDINARY_FOLDER || 'bookings/qr';

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image', overwrite: false, ...options },
            (err, result) => {
                if (err) return reject(err);
                resolve({ public_id: result.public_id, secure_url: result.secure_url });
            }
        );
        stream.end(buffer);
    });
}
