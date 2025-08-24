import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "../../firebase";

/** Get saved high score (0 if missing or not signed in) */
export async function fetchHighScore(user: User | null): Promise<number> {
  if (!user) return 0;
  try {
    const ref = doc(db, "users", user.uid, "games", "tripeaks");
    const snap = await getDoc(ref);
    const hs = snap.exists() ? Number(snap.data()?.highScore ?? 0) : 0;
    return Number.isFinite(hs) ? hs : 0;
  } catch {
    return 0;
  }
}

/** Save high score if improved */
export async function maybeSaveHighScore(user: User | null, final: number): Promise<boolean> {
  if (!user) return false;
  try {
    const ref = doc(db, "users", user.uid, "games", "tripeaks");
    await setDoc(ref, { highScore: final, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch {
    return false;
  }
}
