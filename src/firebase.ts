import { initializeApp } from 'firebase/app'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBj7e8kRAyXjqngev3pDXt1d1oNRlDhDug",
  authDomain: "dieta-app-23bb3.firebaseapp.com",
  projectId: "dieta-app-23bb3",
  storageBucket: "dieta-app-23bb3.firebasestorage.app",
  messagingSenderId: "475932783778",
  appId: "1:475932783778:web:aa96fb4655e9a0bea9d3fb",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

enableIndexedDbPersistence(db).catch(() => {
  // Fallback: multiple tabs or browser doesn't support
})
