import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {

  apiKey: "AIzaSyCMsfQLSIpQGm7qwfzTbtgyMSTAZQ5K0k4",
  authDomain: "pfukaloop.firebaseapp.com",
  projectId: "pfukaloop",
  storageBucket: "pfukaloop.firebasestorage.app",
  messagingSenderId: "647284542825",
  appId: "1:647284542825:web:e6680c043ba105965501f8",
  measurementId: "G-2CYL8WWYWB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdmin() {
    try {
        const email = 'admin@pfukaloop.com';
        const password = 'Admin123!';
        const name = 'System Admin';
        
        // Create admin user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Set admin role in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            name: name,
            email: email,
            role: 'admin',
            uid: user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        console.log('Admin user created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('User ID:', user.uid);
    } catch (error) {
        console.error('Error creating admin:', error);
    }
}

createAdmin();