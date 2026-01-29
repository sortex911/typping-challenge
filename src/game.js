import { Storage } from './storage.js'

export function initGame({ onFinish, onViewLeaderboard, onLogout }) {
    const display = document.getElementById('text-display')
    const scoreEl = document.getElementById('score')
    const timerEl = document.getElementById('timer')
    const playerEl = document.getElementById('current-player')
    const logoutBtn = document.getElementById('logout-btn')
    const restartBtn = document.getElementById('restart-btn')
    const leaderboardBtn = document.getElementById('view-leaderboard-btn')
    const gameMessage = document.getElementById('game-message')

    let currentText = ""
    let currentIndex = 0
    let score = 0
    let isGameActive = false
    let timeLeft = 60
    let timerInterval = null

    function startGame() {
        const user = Storage.getCurrentUser()
        const config = Storage.getConfig()

        playerEl.textContent = user

        // Pick specific paragraphs or random? Assuming random from list.
        const paragraphs = config.paragraphs.length > 0 ? config.paragraphs : ["No paragraphs configured by admin."]
        currentText = paragraphs[Math.floor(Math.random() * paragraphs.length)]

        currentIndex = 0
        score = 0
        timeLeft = config.timerDuration
        isGameActive = true

        updateDisplay()
        scoreEl.textContent = score
        timerEl.textContent = timeLeft

        restartBtn.classList.add('hidden')
        gameMessage.classList.add('hidden')
        gameMessage.textContent = ''

        // Start Timer
        if (timerInterval) clearInterval(timerInterval)
        timerInterval = setInterval(() => {
            if (!isGameActive) return
            timeLeft--
            timerEl.textContent = timeLeft

            if (timeLeft <= 0) {
                finishGame("Time's Up!")
            }
        }, 1000)

        // Focus listener to capture typing
        window.addEventListener('keydown', handleInput)
    }

    function updateDisplay() {
        // Simple HTML generation
        let html = ''
        for (let i = 0; i < currentText.length; i++) {
            let classes = 'char'
            if (i < currentIndex) classes += ' correct'
            else if (i === currentIndex) classes += ' current'

            html += `<span class="${classes}">${currentText[i]}</span>`
        }
        display.innerHTML = html
    }


    function handleInput(e) {
        if (!isGameActive) return

        // Prevent Backspace
        if (e.key === 'Backspace') {
            e.preventDefault()
            return
        }

        // Ignore modifier keys
        if (e.key.length > 1) return

        const expectedChar = currentText[currentIndex]

        if (e.key === expectedChar) {
            // Correct
            score += 1
            currentIndex++
        } else {
            // Incorrect
            score -= 1
        }

        scoreEl.textContent = score
        updateDisplay()

        // Check Win Condition (Completed paragraph)
        // Option: Load new paragraph? Or finish game? 
        // Requirement says "add paragraph... timer time change". 
        // If timer-based, usually they just keep typing. 
        // Let's finish for now as per previous logic, but maybe we should load next paragraph?
        // User didn't specify continuous mode. Simple completion is safer for now.
        if (currentIndex >= currentText.length) {
            finishGame("Completed!")
        }
    }

    function finishGame(reason) {
        isGameActive = false
        window.removeEventListener('keydown', handleInput)
        if (timerInterval) clearInterval(timerInterval)

        const user = Storage.getCurrentUser()
        const userData = Storage.getUserData(user)

        // Update best score
        if (score > userData.bestScore) {
            userData.bestScore = score
            Storage.saveUserData(user, userData)
            gameMessage.textContent = `New High Score: ${score}! (${reason})`
        } else {
            gameMessage.textContent = `Game Over! Score: ${score} (${reason})`
        }

        gameMessage.classList.remove('hidden')
        restartBtn.classList.remove('hidden')

        if (onFinish) onFinish(score)
    }

    // Event Bindings
    restartBtn.addEventListener('click', startGame)

    logoutBtn.addEventListener('click', () => {
        isGameActive = false
        if (timerInterval) clearInterval(timerInterval)
        window.removeEventListener('keydown', handleInput)
        Storage.clearCurrentUser()
        if (onLogout) onLogout()
    })

    leaderboardBtn.addEventListener('click', () => {
        isGameActive = false
        if (timerInterval) clearInterval(timerInterval)
        window.removeEventListener('keydown', handleInput)
        if (onViewLeaderboard) onViewLeaderboard()
    })

    // Hook to start game when screen becomes active?
    // Since we reconstruct the app or switch screens, we might need a way to trigger start. 
    // currently main.js calls initGame -> returns object -> we can call restart?
    // Actually main.js logic: if initGame is called, it registers listeners. 
    // It should probably expose a "start" or "reset" method that main.js calls when switching to 'game'.

    // For now, let's just export the start function reference or rely on manual start after load.
    // Actually, we called startGame() at the end of init previously.
    // We should add an Observer to auto-start or just wait for user to click separate "Start" if we wanted.
    // Let's stick to auto-start for now but add a check if current screen is active.

    // Better: Expose a mount/unmount or show/hide hook.
    // But to keep it simple with current architecture:
    const section = document.getElementById('game-screen')
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (section.classList.contains('active')) {
                    startGame()
                } else {
                    isGameActive = false
                    if (timerInterval) clearInterval(timerInterval)
                    window.removeEventListener('keydown', handleInput)
                }
            }
        })
    })
    observer.observe(section, { attributes: true })
}

