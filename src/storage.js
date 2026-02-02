import { db } from './firebase.js'
import {
    collection,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    getDocs,
    query,
    orderBy
} from "firebase/firestore";

const KEYS = {
    CURRENT_USER: 'tc_current_user'
}

const DEFAULT_PARAGRAPHS = [
    "The quick brown fox jumps over the lazy dog.",
    "Technology is best when it brings people together.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "In the middle of difficulty lies opportunity."
]

const DEFAULT_CONFIG = {
    timerDuration: 60,
    paragraphs: DEFAULT_PARAGRAPHS
}

export const Storage = {
    getCurrentUser: () => {
        return localStorage.getItem(KEYS.CURRENT_USER)
    },

    setCurrentUser: (username) => {
        localStorage.setItem(KEYS.CURRENT_USER, username)
    },

    clearCurrentUser: () => {
        localStorage.removeItem(KEYS.CURRENT_USER)
    },

    getUserData: async (username) => {
        try {
            const docRef = doc(db, "players", username);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return { bestScore: data.bestScore || 0 }
            } else {
                return { bestScore: 0 }
            }
        } catch (e) {
            console.error("Error fetching user data:", e)
            return { bestScore: 0 }
        }
    },

    saveUserData: async (username, data) => {
        try {
            const updateData = { username }
            if (data.bestScore !== undefined) updateData.bestScore = data.bestScore

            // Use setDoc with merge: true to effectively upsert
            await setDoc(doc(db, "players", username), updateData, { merge: true });
        } catch (e) {
            console.error("Error saving user data:", e)
        }
    },

    getAllUsers: async () => {
        try {
            const playersRef = collection(db, "players");
            const q = query(playersRef, orderBy("bestScore", "desc"));

            const querySnapshot = await getDocs(q);

            const usersMap = {}
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                usersMap[data.username || doc.id] = { bestScore: data.bestScore }
            });
            return usersMap
        } catch (e) {
            console.error("Error fetching all users:", e)
            return {}
        }
    },

    checkUserExists: async (username) => {
        try {
            const docRef = doc(db, "players", username);
            const docSnap = await getDoc(docRef);
            return docSnap.exists();
        } catch (e) {
            console.error("Error checking user:", e)
            // If offline or network error, assume user doesn't exist to allow registration
            if (e.code === 'unavailable' || e.message?.includes('offline')) {
                console.warn("Database offline, assuming user doesn't exist")
                return false;
            }
            throw e
        }
    },

    deleteUser: async (username) => {
        try {
            await deleteDoc(doc(db, "players", username));
        } catch (e) {
            console.error("Error deleting user:", e)
        }
    },

    getConfig: async () => {
        try {
            const docRef = doc(db, "game_config", "main_config");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return data.value || JSON.parse(JSON.stringify(DEFAULT_CONFIG));
            } else {
                console.log("Seeding default config...")
                const defaults = JSON.parse(JSON.stringify(DEFAULT_CONFIG))
                await Storage.saveConfig(defaults)
                return defaults
            }
        } catch (e) {
            console.error("Error fetching config:", e)
            return JSON.parse(JSON.stringify(DEFAULT_CONFIG))
        }
    },

    saveConfig: async (config) => {
        try {
            await setDoc(doc(db, "game_config", "main_config"), { value: config });
        } catch (e) {
            console.error("Error saving config:", e)
        }
    }
}
