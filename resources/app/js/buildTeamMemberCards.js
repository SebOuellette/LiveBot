function buildTeamMemberCards(funky) {
    bot.team.forEach(m => {
        // Create the container
        let container = document.createElement('div');
        container.classList.add('teamMember');
        document.getElementById('selectMember').appendChild(container);

        // Create the area for the icon and name
        let userArea = document.createElement('div');
        userArea.classList.add('userArea');
        container.appendChild(userArea);

        // Create the icon and username
        let img = document.createElement('img');
        if(m.user.avatar && m.user.avatar.startsWith('a_'))
            img.src = m.user.displayAvatarURL().replace('.webp', '.gif');
        else            
            img.src = m.user.displayAvatarURL();
        img.classList.add('teamMemberIcon');
        userArea.appendChild(img);

        let tag = document.createElement('div');
        tag.classList.add('teamMemberTag');
        userArea.appendChild(tag);

        // Username
        let username = document.createElement('span');
        username.classList.add('teamMemberName');
        username.innerText = m.user.username;
        tag.appendChild(username);

        // Descriminator
        let descrim = document.createElement('span');
        descrim.classList.add('teamMemberDisc');
        descrim.innerText = `#${m.user.discriminator}`;
        tag.appendChild(descrim);


        // Buttons
        let once = document.createElement('div');
        once.classList.add('teamMemberButton');
        container.appendChild(once);

        let onceSpan = document.createElement('span');
        onceSpan.classList.add('oneline');
        onceSpan.innerText = 'Sign in once';
        once.appendChild(onceSpan);

        // Default button
        let defaultButton = document.createElement('div');
        defaultButton.classList.add('teamMemberButton');
        container.appendChild(defaultButton);

        let defaultSpan = document.createElement('span');
        defaultSpan.innerText = 'Sign in and set as default';
        defaultButton.appendChild(defaultSpan);


        // Event listeners
        once.addEventListener('click', () => {
            bot.owner = m.user;
            funky();
        });
        defaultButton.addEventListener('click', () => {
            bot.owner = m.user;
            settings.tokenSettings = {teamUser: m.user.id}

            funky();
        });
    });
}


function buildSplashToken() {
    let container = document.createElement('div');
    container.classList.add('splashTokenContainer');
    document.getElementById('selectMember').appendChild(container);

    // Create the token input field
    let input = document.createElement('input');
    input.classList.add('splashScreenToken');
    input.classList.add('tokenbox'); // Added cause of the animation
    input.type = "password";
    input.placeholder = "Input your token";
    container.appendChild(input);

    // One time button
    let oneTimeButton = document.createElement('div');
    oneTimeButton.classList.add('tokenAddButton');
    container.appendChild(oneTimeButton);

    let oneTimeSpan = document.createElement('span');
    oneTimeSpan.innerText = "One time login";
    oneTimeButton.appendChild(oneTimeSpan);

    // Default button
    let defaultButton = document.createElement('div');
    defaultButton.classList.add('tokenAddButton');
    container.appendChild(defaultButton);

    let defaultSpan = document.createElement('span');
    defaultSpan.innerText = "Log in and save as default";10
    defaultButton.appendChild(defaultSpan);

    // Event listeners
    oneTimeButton.addEventListener('click', async () => {
        let token = input.value;
        let error = [false, 'none'];

        if (global.bot === undefined)
            error = await load(token);
        else
            error = await setToken(token);

        if (!error[0]) {
            document.getElementById('selectMember').removeChild(container);
            setLoadingPerc(0);
        } else {
            errorHandler(error[1])
        }
    });
    defaultButton.addEventListener('click', async () => {
        let token = input.value;
        let error = await saveToken(token);
        if (!error[0]) {
            document.getElementById('selectMember').removeChild(container);
            setLoadingPerc(0.05);
        } else {
            errorHandler(error[1])
        }
    });
}