import './style.css'
import { initAuth, getCurrentUser } from './src/auth.js'
import { initGame } from './src/game.js'
import { initLeaderboard } from './src/leaderboard.js'
import { initAdmin } from './src/admin.js'
import { initAbout } from './src/about.js'
import { initThief } from './src/thief.js'
import { initKeyboardRobots, setKeyboardVisibility } from './src/keyboard_robots.js'

// Simple Router / State Manager
const screens = {
    auth: document.getElementById('auth-screen'),
    game: document.getElementById('game-screen'),
    leaderboard: document.getElementById('leaderboard-screen'),
    admin: document.getElementById('admin-screen'),
    about: document.getElementById('about-screen')
}

export function switchScreen(screenName) {
    Object.values(screens).forEach(s => {
        s.classList.remove('active')
        setTimeout(() => {
            if (!s.classList.contains('active')) s.classList.add('hidden')
        }, 300) // Wait for transition
    })

    const target = screens[screenName]
    target.classList.remove('hidden')

    // Control Keyboard Visibility - Only for auth screen
    setKeyboardVisibility(screenName === 'auth')

    // Small delay to allow display:flex to apply before opacity transition
    requestAnimationFrame(() => {
        target.classList.add('active')
    })
}

function initApp() {
    const user = getCurrentUser()

    initAuth(
        () => switchScreen('game'), // onLoginSuccess (User)
        () => switchScreen('admin') // onAdminLogin
    )

    initGame({
        onFinish: () => {
            // Optional: switch to leaderboard or show summary
        },
        onViewLeaderboard: () => switchScreen('leaderboard'),
        onLogout: () => {
            switchScreen('auth')
        }
    })

    initAdmin(
        () => { // onLogout
            // Clear admin session/user?
            // The admin uses the same 'currentUser' key, so clearing it in auth/logout is handled by a shared call or we do it here.
            // Current logout implementation in admin.js calls this callback. 
            // We should call the auth.logout() effectively.
            // But `auth.js` has `logout()` function. We should import it or just clear storage.
            // Let's just create a shared logout utility or just clear storage here.
            localStorage.removeItem('tc_current_user')
            switchScreen('auth')
        }
    )

    initLeaderboard({
        onBack: () => switchScreen('game')
    })

    initAbout(() => switchScreen('auth'))

    initThief()
    initKeyboardRobots()

    // About link on Login Page
    document.getElementById('open-about').addEventListener('click', () => switchScreen('about'))

    if (user) {
        if (user === 'sortex') {
            switchScreen('admin')
        } else {
            switchScreen('game')
        }
    } else {
        switchScreen('auth')
    }
}

initApp()
