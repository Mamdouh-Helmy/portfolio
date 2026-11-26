import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function uploadImage(buffer: Buffer): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "portfolio/projects", resource_type: "image", transformation: [{ width: 1400, crop: "limit", quality: "auto", fetch_format: "auto" }] },
      (err, res) => (err || !res ? reject(err) : resolve({ url: res.secure_url, publicId: res.public_id })),
    ).end(buffer);
  });
}
export const deleteImage = (publicId: string) => cloudinary.uploader.destroy(publicId);

cloudinary.api.ping().then((r) => console.log("PING OK:", r)).catch((e) => console.log("PING FAIL:", e));