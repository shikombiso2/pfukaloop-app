import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDocs, collection } from 'firebase/firestore';

const firebaseConfig = {
    // Your Firebase config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateUserRoles() {
    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        
        let count = 0;
        for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();
            // If role is not set, set it to 'tourist'
            if (!data.role) {
                await updateDoc(doc(db, 'users', docSnapshot.id), {
                    role: 'tourist',
                    updatedAt: new Date().toISOString()
                });
                count++;
                console.log(`Updated user: ${data.email || docSnapshot.id}`);
            }
        }
        console.log(`Updated ${count} users with default 'tourist' role`);
    } catch (error) {
        console.error('Error updating users:', error);
    }
}

updateUserRoles();