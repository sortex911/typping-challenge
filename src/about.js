export function initAbout(onBack) {
    const backBtn = document.getElementById('back-from-about');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (onBack) onBack();
        });
    }
}
