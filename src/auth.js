import { Storage } from './storage.js'

const ADMIN_CREDS = {
    username: 'sortex',
    password: 'sortex@123456789'
}

export function getCurrentUser() {
    return Storage.getCurrentUser()
}

export function initAuth(onLoginSuccess, onAdminLogin) {
    const loginForm = document.getElementById('login-form')
    const usernameInput = document.getElementById('username')
    const passwordInput = document.getElementById('password')

    const authTitle = document.getElementById('auth-title')
    const authSubmitBtn = document.getElementById('auth-submit')
    const toggleAdminLink = document.getElementById('toggle-admin')

    let isAdminMode = false

    toggleAdminLink.addEventListener('click', (e) => {
        e.preventDefault()
        isAdminMode = !isAdminMode

        if (isAdminMode) {
            authTitle.textContent = "Admin Login"
            authSubmitBtn.textContent = "Login as Admin"
            toggleAdminLink.textContent = "Back to Player Registration"
            passwordInput.parentElement.classList.remove('hidden')
            usernameInput.placeholder = "Admin Username"
        } else {
            authTitle.textContent = "Register Player"
            authSubmitBtn.textContent = "Start Challenge"
            toggleAdminLink.textContent = "Admin Access"
            passwordInput.parentElement.classList.add('hidden')
            usernameInput.placeholder = "Choose a Username"
        }
    })

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault()
        const username = usernameInput.value.trim()
        const password = passwordInput.value.trim()

        if (!username) return

        if (isAdminMode) {
            // Admin Login
            if (username === ADMIN_CREDS.username && password === ADMIN_CREDS.password) {
                Storage.setCurrentUser(ADMIN_CREDS.username)
                onAdminLogin()
            } else {
                alert("Invalid Admin Credentials")
            }
        } else {
            // Player Registration
            const users = Storage.getAllUsers()
            if (users[username]) {
                alert("Username taken! Please choose another name.")
                return
            }

            // Register new user
            Storage.saveUserData(username, { bestScore: 0 })
            Storage.setCurrentUser(username)
            usernameInput.value = ''
            onLoginSuccess()
        }
    })
}

export function logout() {
    Storage.clearCurrentUser()
}
