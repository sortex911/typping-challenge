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
    async function render() {
        const config = await Storage.getConfig()
        timerInput.value = config.timerDuration

        // Render Paragraphs
        if (config.paragraphs) {
            paraList.innerHTML = config.paragraphs.map((p, index) => `
            <li style="border-bottom:1px solid rgba(255,255,255,0.1); padding:5px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.9rem; text-align:left; flex:1; margin-right:10px;">${p.substring(0, 50)}${p.length > 50 ? '...' : ''}</span>
                <button data-index="${index}" class="delete-para-btn" style="background:none; border:none; color:var(--error-color); cursor:pointer;">✕</button>
            </li>
          `).join('')
        } else {
            paraList.innerHTML = ''
        }

        // Render Users
        const users = await Storage.getAllUsers()
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

    async function deleteUser(username) {
        await Storage.deleteUser(username)
        render()
    }

    async function deleteParagraph(index) {
        const config = await Storage.getConfig()
        if (config.paragraphs) {
            config.paragraphs.splice(index, 1)
            await Storage.saveConfig(config)
            render()
        }
    }

    addParaBtn.addEventListener('click', async () => {
        const text = newParaInput.value.trim()
        if (!text) return

        addParaBtn.disabled = true;
        const config = await Storage.getConfig()
        if (!config.paragraphs) config.paragraphs = []
        config.paragraphs.push(text)
        await Storage.saveConfig(config)
        newParaInput.value = ''
        await render()
        addParaBtn.disabled = false;
        alert('Paragraph added!')
    })

    saveBtn.addEventListener('click', async () => {
        const duration = parseInt(timerInput.value)
        if (isNaN(duration) || duration < 5) {
            alert("Please enter a valid duration (min 5 seconds)")
            return
        }

        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        const config = await Storage.getConfig()
        config.timerDuration = duration
        await Storage.saveConfig(config)
        alert('Settings Saved!')
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
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
