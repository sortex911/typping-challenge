import { Storage } from './storage.js'

export function initAdmin(onLogout) {
    const logoutBtn = document.getElementById('admin-logout')
    const saveBtn = document.getElementById('save-config-btn')
    const addParaBtn = document.getElementById('add-paragraph-btn')

    const timerInput = document.getElementById('timer-setting')
    const newParaInput = document.getElementById('new-paragraph')
    const paraList = document.getElementById('paragraph-list')
    const userList = document.getElementById('user-list')

    // Refresh UI logic
    function render() {
        const config = Storage.getConfig()
        timerInput.value = config.timerDuration

        // Render Paragraphs
        paraList.innerHTML = config.paragraphs.map((p, index) => `
        <li style="border-bottom:1px solid rgba(255,255,255,0.1); padding:5px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.9rem; text-align:left; flex:1; margin-right:10px;">${p.substring(0, 50)}${p.length > 50 ? '...' : ''}</span>
            <button data-index="${index}" class="delete-para-btn" style="background:none; border:none; color:var(--error-color); cursor:pointer;">✕</button>
        </li>
      `).join('')

        // Render Users
        const users = Storage.getAllUsers()
        const userArray = Object.entries(users).map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.bestScore - a.bestScore)

        if (userList) {
            userList.innerHTML = userArray.length ? userArray.map(u => `
            <li style="border-bottom:1px solid rgba(255,255,255,0.1); padding:8px; display:flex; justify-content:space-between; align-items:center;">
                <span style="text-align:left;">
                    <strong>${u.name}</strong> <span style="color:var(--text-secondary); font-size:0.8rem;">(Score: ${u.bestScore})</span>
                </span>
                <button data-username="${u.name}" class="delete-user-btn" style="background:var(--error-color); border:none; color:white; padding:4px 8px; border-radius:4px; font-size:0.8rem; cursor:pointer;">Delete</button>
            </li>
          `).join('') : '<li style="padding:10px; color:var(--text-secondary);">No users registered</li>'

            // Bind delete user buttons
            document.querySelectorAll('.delete-user-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const username = e.target.dataset.username
                    if (confirm(`Delete user "${username}"?`)) {
                        deleteUser(username)
                    }
                })
            })
        }

        // Bind delete paragraph buttons
        document.querySelectorAll('.delete-para-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index)
                deleteParagraph(idx)
            })
        })
    }

    function deleteUser(username) {
        Storage.deleteUser(username)
        render()
    }

    function deleteParagraph(index) {
        const config = Storage.getConfig()
        config.paragraphs.splice(index, 1)
        Storage.saveConfig(config)
        render()
    }

    addParaBtn.addEventListener('click', () => {
        const text = newParaInput.value.trim()
        if (!text) return

        const config = Storage.getConfig()
        config.paragraphs.push(text)
        Storage.saveConfig(config)
        newParaInput.value = ''
        render()
        alert('Paragraph added!')
    })

    saveBtn.addEventListener('click', () => {
        const duration = parseInt(timerInput.value)
        if (isNaN(duration) || duration < 5) {
            alert("Please enter a valid duration (min 5 seconds)")
            return
        }

        const config = Storage.getConfig()
        config.timerDuration = duration
        Storage.saveConfig(config)
        alert('Settings Saved!')
    })

    logoutBtn.addEventListener('click', () => {
        onLogout()
    })

    // Observe logic to render when active, similar to leaderboard
    const section = document.getElementById('admin-screen')
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (section.classList.contains('active')) {
                    render()
                }
            }
        })
    })
    observer.observe(section, { attributes: true })
}
