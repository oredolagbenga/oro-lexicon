import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

// Helper to validate audio
export function isValidAudioType(mimetype: string) {
  const allowed = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/m4a", "audio/x-m4a"];
  return allowed.includes(mimetype);
}

export const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
