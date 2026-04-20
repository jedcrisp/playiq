import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { firebaseApp } from "./firebase.js";

/**
 * Resize and compress to JPEG for predictable size before Storage upload.
 */
export async function compressImageToJpegBlob(file, maxWidth = 1400) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (JPEG, PNG, or WebP).");
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  try {
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error("Could not read image."));
      img.src = url;
    });
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) throw new Error("Invalid image dimensions.");
    const scale = w > maxWidth ? maxWidth / w : 1;
    const cw = Math.round(w * scale);
    const ch = Math.round(h * scale);
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available.");
    ctx.drawImage(img, 0, 0, cw, ch);
    let quality = 0.88;
    let blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
    while (blob && blob.size > 900_000 && quality > 0.45) {
      quality -= 0.07;
      blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
    }
    if (!blob) throw new Error("Could not compress image.");
    if (blob.size > 1_900_000) {
      throw new Error("Image is still too large after compression. Try a smaller photo.");
    }
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Upload a play sheet / photo to Firebase Storage. Requires Storage bucket in Firebase config
 * and matching security rules deployed.
 */
export async function uploadDiagramPlayImage(file) {
  if (!firebaseApp) throw new Error("Firebase is not configured.");
  const bucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  if (!bucket?.trim()) {
    throw new Error(
      "Set VITE_FIREBASE_STORAGE_BUCKET in your frontend env (Firebase Console → Storage → bucket name).",
    );
  }
  const auth = getAuth(firebaseApp);
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Sign in to upload images.");
  const blob = await compressImageToJpegBlob(file);
  const storage = getStorage(firebaseApp);
  const name = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}.jpg`;
  const path = `users/${uid}/diagram_plays/${name}`;
  const sref = ref(storage, path);
  await uploadBytes(sref, blob, { contentType: "image/jpeg" });
  return getDownloadURL(sref);
}
