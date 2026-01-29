const KEYS = {
    CURRENT_USER: 'tc_current_user',
    USERS: 'tc_users',
    CONFIG: 'tc_config'
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

    getUserData: (username) => {
        const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '{}')
        return users[username] || { bestScore: 0 }
    },

    saveUserData: (username, data) => {
        const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '{}')
        users[username] = { ...users[username], ...data }
        localStorage.setItem(KEYS.USERS, JSON.stringify(users))
    },

    getAllUsers: () => {
        return JSON.parse(localStorage.getItem(KEYS.USERS) || '{}')
    },

    deleteUser: (username) => {
        const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '{}')
        delete users[username]
        localStorage.setItem(KEYS.USERS, JSON.stringify(users))
    },

    getConfig: () => {
        return JSON.parse(localStorage.getItem(KEYS.CONFIG)) || DEFAULT_CONFIG
    },

    saveConfig: (config) => {
        localStorage.setItem(KEYS.CONFIG, JSON.stringify(config))
    },

    getKeys: () => KEYS // Export keys for external use if needed
}
