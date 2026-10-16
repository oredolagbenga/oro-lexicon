// import { NextRequest, NextResponse } from "next/server";
// import cloudinary from "@/lib/cloudinary";

// export async function POST(req: NextRequest) {
//   const formData = await req.formData();
//   const file = formData.get("file") as File;
//   const slug = formData.get("slug") as string;

//   if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);

//   const upload = await new Promise<any>((resolve, reject) => {
//     cloudinary.uploader.upload_stream(
//       {
//         resource_type: "video",
//         folder: `gns-lexicon/audio`,
//         public_id: slug || `yoruba-${Date.now()}`,
//       },
//       (error, result) => {
//         if (error) reject(error);
//         else resolve(result);
//       }
//     ).end(buffer);
//   });

//   return NextResponse.json({ 
//     url: upload.secure_url, 
//     publicId: upload.public_id 
//   });
// }