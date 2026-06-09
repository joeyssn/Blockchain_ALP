import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "blockchain-bda23.firebaseapp.com",
  projectId: "blockchain-bda23",
  storageBucket: "blockchain-bda23.firebasestorage.app",
  messagingSenderId: "372628889016",
  appId: "1:372628889016:web:4ad29f8dfd1f8064ca034d",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
