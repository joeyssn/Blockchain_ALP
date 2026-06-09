import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBuUih0zROYc7L8GFEAwV3vz_hnU5w6zSI",
  authDomain: "blockchain-bda23.firebaseapp.com",
  projectId: "blockchain-bda23",
  storageBucket: "blockchain-bda23.firebasestorage.app",
  messagingSenderId: "372628889016",
  appId: "1:372628889016:web:4ad29f8dfd1f8064ca034d",
  measurementId: "G-JFDFHR0BHX",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

export default firebaseApp;
