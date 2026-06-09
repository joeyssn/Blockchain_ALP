import { useEffect, useState } from "react";
import {
  Timestamp,
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase";

export type VerificationStatus = "verified";

export type RegisteredShoe = {
  id: string;
  shoeName: string;
  companyId: string;
  companyName: string;
  description: string;
  imageUrl: string;
  createdBy: string;
  createdAt: Date;
  verificationStatus: VerificationStatus;
};

export type CreateShoeInput = {
  companyId: string;
  companyName: string;
  shoeName: string;
  description: string;
  imageFile: File;
  createdBy: string;
};

const SHOES_COLLECTION = "shoes";

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toDate(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return new Date();
}

function mapShoeDocument(id: string, data: Record<string, unknown>): RegisteredShoe {
  return {
    id,
    shoeName: String(data.shoeName || ""),
    companyId: String(data.companyId || ""),
    companyName: String(data.companyName || ""),
    description: String(data.description || ""),
    imageUrl: String(data.imageUrl || ""),
    createdBy: String(data.createdBy || ""),
    createdAt: toDate(data.createdAt),
    verificationStatus: "verified",
  };
}

export function useRegisteredShoes() {
  const [shoes, setShoes] = useState<RegisteredShoe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const shoesQuery = query(collection(db, SHOES_COLLECTION), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      shoesQuery,
      (snapshot) => {
        setShoes(
          snapshot.docs.map((doc) =>
            mapShoeDocument(doc.id, doc.data() as Record<string, unknown>)
          )
        );
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { shoes, loading, error };
}

export function getShoesByCompany(companyId: string, shoes: RegisteredShoe[]) {
  return shoes.filter((shoe) => shoe.companyId === companyId);
}

export function getVerifiedShoeCount(shoes: RegisteredShoe[]) {
  return shoes.filter((shoe) => shoe.verificationStatus === "verified").length;
}

export function searchShoes(queryText: string, shoes: RegisteredShoe[]) {
  const normalizedQuery = queryText.trim().toLowerCase();

  if (!normalizedQuery) {
    return shoes;
  }

  return shoes.filter(
    (shoe) =>
      shoe.shoeName.toLowerCase().includes(normalizedQuery) ||
      shoe.companyName.toLowerCase().includes(normalizedQuery)
  );
}

export async function registerShoe(input: CreateShoeInput) {
  const storagePath = `shoes/${input.companyId}/${Date.now()}-${createSlug(input.shoeName)}-${input.imageFile.name}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, input.imageFile);
  const imageUrl = await getDownloadURL(storageRef);

  const documentRef = await addDoc(collection(db, SHOES_COLLECTION), {
    shoeName: input.shoeName.trim(),
    companyId: input.companyId,
    companyName: input.companyName,
    description: input.description.trim(),
    imageUrl,
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
    verificationStatus: "verified" satisfies VerificationStatus,
  });

  return {
    id: documentRef.id,
    shoeName: input.shoeName.trim(),
    companyId: input.companyId,
    companyName: input.companyName,
    description: input.description.trim(),
    imageUrl,
    createdBy: input.createdBy,
    createdAt: new Date(),
    verificationStatus: "verified" as VerificationStatus,
  };
}

export function formatRegistrationDate(createdAt: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(createdAt);
}
