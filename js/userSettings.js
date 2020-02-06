let toggleSettings = () => {
    let userCard = document.getElementById('userSettings');
    if (userCard.classList.length) {
        userCard.classList.toggle('userSettingsToggleOff');
    }
    userCard.classList.toggle('userSettingsToggle');

    let userPullOutIcon = document.getElementById('userPullOutIcon');
    if (userPullOutIcon.classList.length) {
        userPullOutIcon.classList.toggle('userSettingsFlipOff');
    }
    userPullOutIcon.classList.toggle('userSettingsFlip');
};