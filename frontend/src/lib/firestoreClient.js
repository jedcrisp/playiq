import { getFirestore } from "firebase/firestore";
import { firebaseApp } from "./firebase.js";

export const db = firebaseApp ? getFirestore(firebaseApp) : null;

