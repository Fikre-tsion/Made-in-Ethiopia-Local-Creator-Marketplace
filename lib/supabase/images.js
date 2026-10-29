import { hasSupabaseConfig } from "./config";

export const IMAGE_BUCKET = "creator-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImage(file) {
  if (!file) return "Choose an image to upload.";
  if (!IMAGE_TYPES.includes(file.type)) return "Use a JPG, PNG, or WebP image.";
  if (file.size > MAX_IMAGE_BYTES) return "That image is larger than 5 MB. Choose a smaller one.";
  return null;
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file could not be read as an image."));
    };
    image.src = url;
  });
}

async function resizeToJpeg(file, maxSize, quality) {
  const image = await readImage(file);
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The image could not be prepared.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("The image could not be prepared."))),
      "image/jpeg",
      quality
    );
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(blob);
  });
}

function friendlyUploadError(message = "") {
  if (/bucket not found/i.test(message)) {
    return "Image storage is not set up yet. Run the creator-images SQL migration in Supabase.";
  }
  if (/row-level security|policy/i.test(message)) {
    return "Supabase blocked the upload. Check the creator-images storage policies.";
  }
  return message || "The upload failed. Try again.";
}

export async function uploadImage(supabase, file, { userId, folder }) {
  const problem = validateImage(file);
  if (problem) throw new Error(problem);

  if (!hasSupabaseConfig()) {
    return blobToDataUrl(await resizeToJpeg(file, 720, 0.8));
  }

  const blob = await resizeToJpeg(file, 1600, 0.85);
  const path = `${userId}/${folder}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, blob, {
    contentType: "image/jpeg",
    cacheControl: "31536000",
  });
  if (error) throw new Error(friendlyUploadError(error.message));

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

const PALETTES = [
  ["#1d5a40", "#e3b04b", "#f6f1e4"],
  ["#7c3322", "#e3b04b", "#faf1e1"],
  ["#2c4a63", "#d9a441", "#f2eee4"],
  ["#4d3425", "#c8892b", "#f5ecdc"],
  ["#37634d", "#e0b36a", "#f3f0e6"],
];

export function placeholderImage(seed = "") {
  let hash = 0;
  for (const character of String(seed)) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  const [dark, gold, light] = PALETTES[hash % PALETTES.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><defs><pattern id="d" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M20 4 36 20 20 36 4 20Z" fill="none" stroke="${dark}" stroke-width="2.5"/><path d="M20 14 26 20 20 26 14 20Z" fill="${gold}"/></pattern></defs><rect width="400" height="300" fill="${light}"/><rect width="400" height="300" fill="url(#d)" opacity=".38"/><rect y="112" width="400" height="76" fill="${dark}"/><rect y="122" width="400" height="6" fill="${gold}"/><rect y="172" width="400" height="6" fill="${gold}"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
