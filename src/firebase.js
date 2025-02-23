import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA8pd6tr5ivxM4LKpZ12XU-12DiKq7NPdE",
  authDomain: "room-booking-a8a89.firebaseapp.com",
  databaseURL: "https://room-booking-a8a89-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "room-booking-a8a89",
  storageBucket: "room-booking-a8a89.firebasestorage.app",
  messagingSenderId: "89105649436",
  appId: "1:89105649436:web:8b80f58f97af61aa4af4d9"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
