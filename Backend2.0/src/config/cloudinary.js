import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

/**
 * Upload a multer memory-storage file (buffer) to Cloudinary.
 * @param {Express.Multer.File} file
 * @param {string} folder
 * @returns {Promise<import('cloudinary').UploadApiResponse>}
 */
export function uploadBuffer(file, folder = "items") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(file.buffer);
  });
}

export default cloudinary;
