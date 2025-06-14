import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyCIO6vBV8Z-7aOW8cXQeSUlImO44PbwUBE",
  authDomain: "cabapp-ff8e6.firebaseapp.com",
  databaseURL: "https://cabapp-ff8e6-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "cabapp-ff8e6",
  storageBucket: "cabapp-ff8e6.firebasestorage.app",
  messagingSenderId: "453867418123",
  appId: "1:453867418123:web:4dd41ee4bd986f6c1acd0e"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app); 