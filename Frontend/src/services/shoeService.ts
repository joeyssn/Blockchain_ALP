import { useEffect, useState } from "react";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase";

export type VerificationStatus = "verified";

export type RegisteredShoe = {
  id: string;
  shoeCode: string;
  shoeName: string;
  companyId: string;
  companyName: string;
  description: string;
  imageUrl: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  verificationStatus: VerificationStatus;
};

export type CreateShoeInput = {
  companyId: string;
  companyName: string;
  shoeCode: string;
  shoeName: string;
  description: string;
  imageFile?: File | null;
  createdBy: string;
};

export type UpdateShoeInput = {
  shoeId: string;
  companyId: string;
  shoeCode: string;
  shoeName: string;
  description: string;
  imageFile?: File | null;
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
    id: String(data.id || id),
    shoeCode: String(data.shoeCode || ""),
    shoeName: String(data.shoeName || ""),
    companyId: String(data.companyId || ""),
    companyName: String(data.companyName || ""),
    description: String(data.description || ""),
    imageUrl: String(data.imageUrl || ""),
    createdBy: String(data.createdBy || ""),
    createdAt: toDate(data.createdAt),
    updatedAt: data.updatedAt ? toDate(data.updatedAt) : undefined,
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
      shoe.shoeCode.toLowerCase().includes(normalizedQuery) ||
      shoe.companyName.toLowerCase().includes(normalizedQuery)
  );
}

export async function assertShoeCodeAvailable(shoeCodeInput: string) {
  const shoeCode = shoeCodeInput.trim().toUpperCase();
  const documentRef = doc(db, SHOES_COLLECTION, createSlug(shoeCode));
  const existingShoe = await getDoc(documentRef);

  if (existingShoe.exists()) {
    throw new Error(`Shoe Code ${shoeCode} is already registered.`);
  }
}

export async function registerShoe(input: CreateShoeInput) {
  console.log("[REGISTER] Service started", {
    companyId: input.companyId,
    companyName: input.companyName,
    shoeCode: input.shoeCode,
    hasImage: Boolean(input.imageFile),
  });

  const shoeCode = input.shoeCode.trim().toUpperCase();
  const documentRef = doc(db, SHOES_COLLECTION, createSlug(shoeCode));

  console.log("[REGISTER] Duplicate Shoe Code check started", { shoeCode });
  const existingShoe = await getDoc(documentRef);
  console.log("[REGISTER] Duplicate Shoe Code check completed", {
    shoeCode,
    exists: existingShoe.exists(),
  });

  if (existingShoe.exists()) {
    throw new Error(`Shoe Code ${shoeCode} is already registered.`);
  }

  let imageUrl = "";

  if (input.imageFile) {
    const extension = input.imageFile.name.split(".").pop() || "jpg";
    const storagePath = `shoe-images/${input.companyId}/${shoeCode}.${extension}`;
    const storageRef = ref(storage, storagePath);

    console.log("[REGISTER] Upload image started", { storagePath });
    await uploadBytes(storageRef, input.imageFile);
    imageUrl = await getDownloadURL(storageRef);
    console.log("[REGISTER] Upload image completed", { storagePath, imageUrl });
  } else {
    console.log("[REGISTER] No image uploaded, skipping Firebase Storage upload");
  }

  console.log("[REGISTER] Firestore write started", {
    collection: SHOES_COLLECTION,
    documentId: documentRef.id,
    shoeCode,
  });
  await setDoc(documentRef, {
    id: documentRef.id,
    shoeCode,
    shoeName: input.shoeName.trim(),
    companyId: input.companyId,
    companyName: input.companyName,
    description: input.description.trim(),
    imageUrl,
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
    verificationStatus: "verified" satisfies VerificationStatus,
  });
  console.log("[REGISTER] Firestore write completed", {
    collection: SHOES_COLLECTION,
    documentId: documentRef.id,
  });

  return {
    id: documentRef.id,
    shoeCode,
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

export async function updateShoe(input: UpdateShoeInput) {
  const shoeName = input.shoeName.trim();
  const description = input.description.trim();

  if (!shoeName || !description) {
    throw new Error("Shoe Name and Description are required.");
  }

  const documentRef = doc(db, SHOES_COLLECTION, input.shoeId);
  const existingShoe = await getDoc(documentRef);

  if (!existingShoe.exists()) {
    throw new Error("Shoe record was not found.");
  }

  const existingData = existingShoe.data() as Record<string, unknown>;

  if (String(existingData.companyId || "") !== input.companyId) {
    throw new Error("You can only update shoes registered by your company.");
  }

  let imageUrl = String(existingData.imageUrl || "");

  if (input.imageFile) {
    const extension = input.imageFile.name.split(".").pop() || "jpg";
    const shoeCode = input.shoeCode.trim().toUpperCase();
    const storagePath = `shoe-images/${input.companyId}/${shoeCode}-${Date.now()}.${extension}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, input.imageFile);
    imageUrl = await getDownloadURL(storageRef);
  }

  await updateDoc(documentRef, {
    shoeName,
    description,
    imageUrl,
    updatedAt: serverTimestamp(),
  });

  return {
    ...mapShoeDocument(input.shoeId, existingData),
    shoeName,
    description,
    imageUrl,
    updatedAt: new Date(),
  };
}

export function formatRegistrationDate(createdAt: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(createdAt);
}
