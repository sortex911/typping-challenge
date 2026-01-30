import { supabase } from './supabaseClient.js'

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
            const { data, error } = await supabase
                .from('players')
                .select('*')
                .eq('username', username)
                .maybeSingle()

            if (error) {
                console.error('Error fetching user data:', error)
                return { bestScore: 0 }
            }

            if (!data) return { bestScore: 0 }
            return { bestScore: data.best_score || 0 }
        } catch (e) {
            console.error(e)
            return { bestScore: 0 }
        }
    },

    saveUserData: async (username, data) => {
        try {
            const updateData = { username }
            if (data.bestScore !== undefined) updateData.best_score = data.bestScore

            const { error } = await supabase
                .from('players')
                .upsert(updateData)

            if (error) console.error('Error saving user data:', error)
        } catch (e) {
            console.error(e)
        }
    },

    getAllUsers: async () => {
        try {
            const { data, error } = await supabase
                .from('players')
                .select('*')
                .order('best_score', { ascending: false })

            if (error) {
                console.error('Error fetching all users:', error)
                return {}
            }

            const usersMap = {}
            data.forEach(user => {
                usersMap[user.username] = { bestScore: user.best_score }
            })
            return usersMap
        } catch (e) {
            console.error(e)
            return {}
        }
    },

    checkUserExists: async (username) => {
        try {
            const { data, error } = await supabase
                .from('players')
                .select('username')
                .eq('username', username)
                .maybeSingle()

            if (error) {
                console.error("Error checking user:", error)
                throw error
            }
            return !!data
        } catch (e) {
            console.error(e)
            throw e
        }
    },

    deleteUser: async (username) => {
        try {
            const { error } = await supabase
                .from('players')
                .delete()
                .eq('username', username)

            if (error) console.error('Error deleting user:', error)
        } catch (e) {
            console.error(e)
        }
    },

    getConfig: async () => {
        try {
            const { data, error } = await supabase
                .from('game_config')
                .select('value')
                .eq('key', 'main_config')
                .maybeSingle()

            if (error) {
                console.error('Error fetching config:', error)
                return JSON.parse(JSON.stringify(DEFAULT_CONFIG))
            }

            if (!data) {
                console.log("Seeding default config...")
                const defaults = JSON.parse(JSON.stringify(DEFAULT_CONFIG))
                await Storage.saveConfig(defaults)
                return defaults
            }
            return data.value
        } catch (e) {
            console.error(e)
            return JSON.parse(JSON.stringify(DEFAULT_CONFIG))
        }
    },

    saveConfig: async (config) => {
        try {
            const { error } = await supabase
                .from('game_config')
                .upsert({ key: 'main_config', value: config })

            if (error) console.error('Error saving config:', error)
        } catch (e) {
            console.error(e)
        }
    }
}
