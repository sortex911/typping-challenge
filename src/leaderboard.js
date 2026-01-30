import { Storage } from './storage.js'

export function initLeaderboard({ onBack }) {
    const backBtn = document.getElementById('back-to-game')
    const list = document.getElementById('leaderboard-list')

    // Observer to refresh when shown? 
    // For simplicity, we can export a render function and call it when switching screens.
    // But since we are using a callback structure in main.js, we can add a MutationObserver or just expose a function.

    // Let's use a MutationObserver on the section to detect when it becomes active.
    const section = document.getElementById('leaderboard-screen')

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (section.classList.contains('active')) {
                    renderLeaderboard()
                }
            }
        })
    })

    observer.observe(section, { attributes: true })

    async function renderLeaderboard() {
        list.innerHTML = '<li class="leaderboard-item" style="justify-content:center; color: var(--text-secondary)">Loading...</li>'

        try {
            const allUsers = await Storage.getAllUsers()
            // Convert to array
            const sortedUsers = Object.entries(allUsers)
                .map(([username, data]) => ({ username, score: data.bestScore }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 10) // Top 10

            list.innerHTML = sortedUsers.map((user, index) => `
          <li class="leaderboard-item">
            <span class="rank">#${index + 1} ${user.username}</span>
            <span class="score">${user.score}</span>
          </li>
        `).join('')

            if (sortedUsers.length === 0) {
                list.innerHTML = '<li class="leaderboard-item" style="justify-content:center; color: var(--text-secondary)">No records yet</li>'
            }
        } catch (e) {
            console.error(e)
            list.innerHTML = '<li class="leaderboard-item" style="justify-content:center; color: var(--error-color)">Error loading data</li>'
        }
    }

    backBtn.addEventListener('click', onBack)
}
