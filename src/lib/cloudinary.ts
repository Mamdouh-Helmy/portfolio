import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

type UploadOpts = { folder?: string; transformation?: Record<string, unknown>[] };

export function uploadImage(buffer: Buffer, opts: UploadOpts = {}): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: opts.folder ?? "portfolio/projects",
        resource_type: "image",
        transformation: opts.transformation ?? [{ width: 1400, crop: "limit", quality: "auto", fetch_format: "auto" }],
      },
      (err, res) => (err || !res ? reject(err) : resolve({ url: res.secure_url, publicId: res.public_id })),
    ).end(buffer);
  });
}

export const deleteImage = (publicId: string) => cloudinary.uploader.destroy(publicId);

export const deleteVideo = (publicId: string) => cloudinary.uploader.destroy(publicId, { resource_type: "video" });

export function signUpload(folder = "portfolio/videos") {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, process.env.CLOUDINARY_API_SECRET!);
  return { timestamp, signature, folder, apiKey: process.env.CLOUDINARY_API_KEY!, cloudName: process.env.CLOUDINARY_CLOUD_NAME! };
}