let addMemberList = guild => {
    let listDiv = document.getElementById("memberBar");

    // Clear members list
    listDiv.innerHTML = '';

    console.log(guild.roles.map(r=>r).sort((r1, r2) => r2.position - r1.position));

    // Loop through roles
    guild.roles
        .map(r => r) // Convert to array
        .filter(r => r.hoist) // Check if it is a displayed role
        .sort((r1, r2) => r2.position - r1.position) // Sort by highest to lowest rank
        .forEach(r => { // Loop through
            // Role container
            let container = document.createElement("div");
            container.id = r.id;
            listDiv.appendChild(container);

            // Add the role name
            let name = document.createElement("span");
            name.classList.add("roleTitle");
            name.innerText = r.name;
            container.appendChild(name);
            
            // Add each user
            r.members
                .filter(m => (m.hoistRole.id == r.id && m.presence.status != 'offline'))
                .sort((m1, m2) => m1.id - m2.id)
                .forEach(m => {
                    // Make the div for the user
                    let userDiv = document.createElement("div");
                    userDiv.id = m.id;
                    userDiv.classList.add('mLUserDiv');
                    container.appendChild(userDiv);

                    // Add the user icon
                    let icon = document.createElement("img");
                    icon.src = m.user.avatarURL || "resources/images/default.png";
                    icon.classList.add('mLIcon');
                    userDiv.appendChild(icon);

                    // Make the username text
                    let username = document.createElement("p");
                    username.classList.add("mLUsername");
                    username.innerText = m.nickname || m.user.username;
                    username.style.color = `#${r.color.toString(16)}`;
                    userDiv.appendChild(username);
                });
        });
    
    // Create offline label text
    let container = document.createElement("div");
    container.id = 'offlineUserList';
    listDiv.appendChild(container);

    let name = document.createElement("span");
    name.classList.add("roleTitle");
    name.innerText = 'offline';
    container.appendChild(name);

    let content = document.createElement("div");
    content.id = 'offlineUsersTransparent';
    container.appendChild(content);

    // Show offline users
    guild.members
        .filter(m => m.presence.status == 'offline')
        .sort((m1, m2) => m1.id - m2.id)
        .forEach(m => {
            // Make the div for the user
            let userDiv = document.createElement("div");
            userDiv.id = m.id;
            userDiv.classList.add('mLUserDiv');
            content.appendChild(userDiv);

            // Add the user icon
            let icon = document.createElement("img");
            icon.src = m.user.avatarURL || "resources/images/default.png";
            icon.classList.add('mLIcon');
            userDiv.appendChild(icon);

            // Make the username text
            let username = document.createElement("p");
            username.classList.add("mLUsername");
            username.innerText = m.nickname || m.user.username;
            username.style.color = `#${m.hoistRole.color.toString(16)}`;
            userDiv.appendChild(username);
        });
};