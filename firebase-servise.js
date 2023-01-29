
import { getFirestore , Firestore } from "firebase/firestore";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import React from "react";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwPH5S7ilRfY15rp0JvJsauF474wHCJrs",
  authDomain: "bird-bird-999.firebaseapp.com",
  projectId: "bird-bird-999",
  storageBucket: "bird-bird-999.appspot.com",
  messagingSenderId: "572825493443",
  appId: "1:572825493443:web:4251e635b63f8f4acea776"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db 