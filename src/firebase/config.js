import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
    updateEmail,
    updatePassword,
    deleteUser,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    deleteDoc, 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    onSnapshot,
    arrayUnion,
    arrayRemove,
    serverTimestamp
} from 'firebase/firestore';
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from 'firebase/storage';

// Replace this with your actual Firebase config
const firebaseConfig = {

  apiKey: "AIzaSyCMsfQLSIpQGm7qwfzTbtgyMSTAZQ5K0k4",

  authDomain: "pfukaloop.firebaseapp.com",

  projectId: "pfukaloop",

  storageBucket: "pfukaloop.firebasestorage.app",

  messagingSenderId: "647284542825",

  appId: "1:647284542825:web:e6680c043ba105965501f8",

  measurementId: "G-2CYL8WWYWB"

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set persistence to local
setPersistence(auth, browserLocalPersistence);

// Export functions
export {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
    updateEmail,
    updatePassword,
    deleteUser,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    onSnapshot,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
};

export default app;