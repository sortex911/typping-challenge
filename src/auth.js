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

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const username = usernameInput.value.trim()
        const password = passwordInput.value.trim()

        if (!username) return

        if (isAdminMode) {
            // Admin Login
            // Admin creds are hardcoded so we don't need async here, but consistent interface is okay
            if (username === ADMIN_CREDS.username && password === ADMIN_CREDS.password) {
                Storage.setCurrentUser(ADMIN_CREDS.username)
                onAdminLogin()
            } else {
                alert("Invalid Admin Credentials")
            }
        } else {
            // Player Registration
            // Check if user exists using optimized check
            authSubmitBtn.disabled = true;
            authSubmitBtn.textContent = "Checking...";

            try {
                const exists = await Storage.checkUserExists(username)
                if (exists) {
                    alert("Username taken! Please choose another name.")
                    authSubmitBtn.disabled = false;
                    authSubmitBtn.textContent = "Start Challenge";
                    return
                }

                // Register new user
                await Storage.saveUserData(username, { bestScore: 0 })
                // Login implicitly
                Storage.setCurrentUser(username)
                usernameInput.value = ''
                onLoginSuccess()
            } catch (err) {
                console.error(err)
                alert("An error occurred during registration. Please try again.")
            } finally {
                authSubmitBtn.disabled = false;
                if (!isAdminMode) authSubmitBtn.textContent = "Start Challenge";
            }
        }
    })
}

export function logout() {
    Storage.clearCurrentUser()
}
