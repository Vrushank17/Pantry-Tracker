"use client"
import { signInWithPopup } from 'firebase/auth';
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth, provider } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from "firebase/auth";

export default function useAuthService() {
    const router = useRouter()

    async function signInWithGoogle() {
        signInWithPopup(auth, provider)
            .then(async (result) => {
                const user = result.user;
                console.log(user)

                const docRef = doc(collection(db, "users"), user.uid)
                const docSnap = await getDoc(docRef)

                if (!docSnap.exists()) {
                    const userData = {
                        email: user.email,
                        displayName: user.displayName,
                        profilePic: user.photoURL,
                        createdAt: new Date()
                    }

                    await setDoc(docRef, userData)
                        .then(async () => {
                            collection(docRef, "pantry")
                            collection(docRef, "recipes")
                        })
                        .catch((error) => {
                            console.error("Error adding document: ", error);
                        });
                }

                localStorage.setItem('userID', user.uid)
                localStorage.setItem('pfpURL', user.photoURL)

                console.log(user.uid)
                router.push('/pantry')
            })
    }

    async function signOutOfGoogle() {
        signOut(auth).then(() => {
            router.push('/')
        }).catch((error) => {
            console.error(`Error signing out: ${error}`)
        });
    }

    return { signInWithGoogle, signOutOfGoogle }
}