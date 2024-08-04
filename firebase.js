// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAllwQER5QPATvvyy6vge5slFpVB05xae0",
  authDomain: "inventory-managment-b2f1c.firebaseapp.com",
  projectId: "inventory-managment-b2f1c",
  storageBucket: "inventory-managment-b2f1c.appspot.com",
  messagingSenderId: "894896238055",
  appId: "1:894896238055:web:4602347ae047be619a2142",
  measurementId: "G-B3VPXKQVFE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const firestore = getFirestore(app)

export{firestore}