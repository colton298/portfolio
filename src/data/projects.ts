import { collection, getDocs, addDoc, Timestamp, type DocumentData, type QueryDocumentSnapshot, type CollectionReference } from "firebase/firestore";
import { db } from "../firebase";

export type Project = {
  id?: string;
  title: string;
  link?: string;
  createdAt?: Timestamp;
};

// Create a typed collection reference
const col = collection(db, "projects") as CollectionReference<Project>;

// Helper to convert a typed doc
function fromSnap(d: QueryDocumentSnapshot<Project>): Project {
  const data = d.data();
  return { id: d.id, ...data };
}

export async function listProjects(): Promise<Project[]> {
  const snap = await getDocs(col);
  return snap.docs.map((d) => fromSnap(d));
}

export async function addProject(p: { title: string; link?: string }) {
  return addDoc(col, { ...p, createdAt: Timestamp.now() });
}
