let addMemberList = guild => {
    let listDiv = document.getElementById("memberBar");

    // Clear members list
    listDiv.innerHTML = '';

    // Loop through roles
    let roles = guild.roles
        .map(r => r) // Convert to array
        .filter(r => r.hoist) // Check if it is a displayed role
        .sort((r1, r2) => r2.position - r1.position); // Sort by highest to lowest rank

    roles.forEach(r => { // Loop through
            let memberCount = r.members.filter(m => (m.hoistRole && m.hoistRole.id == r.id && m.presence.status != 'offline')).size;

            if (memberCount) {
                // Role container
                let container = document.createElement("div");
                container.id = r.id;
                container.classList.add("roleContainer");
                listDiv.appendChild(container);

                // Add the role name
                let name = document.createElement("span");
                name.classList.add("roleTitle");
                name.innerText = r.name;
                container.appendChild(name);
                
                // Add each user
                r.members
                    .filter(m => (m.hoistRole && m.hoistRole.id == r.id && m.presence.status != 'offline'))
                    .sort((m1, m2) => m1.id - m2.id)
                    .forEach(m => {
                        // Make the div for the user
                        let userDiv = document.createElement("div");
                        userDiv.id = m.id;
                        userDiv.classList.add('mLUserDiv');
                        container.appendChild(userDiv);

                        // Add the user icon
                        let icon = document.createElement("img");
                        icon.src = m.user.avatarURL ? m.user.avatarURL.replace(/(size=)(\d+)/gi, "$164") : "resources/images/default.png";
                        icon.classList.add('mLIcon');
                        userDiv.appendChild(icon);

                        // Make the username text
                        let username = document.createElement("p");
                        username.classList.add("mLUsername");
                        username.innerText = m.nickname || m.user.username;
                        username.style.color = m.displayHexColor || "#8E9297";
                        userDiv.appendChild(username);
                    });
            }
        });
    
    // Display the unsorted, online users
    let onlineCount = guild.members.filter(m => (m.presence.status != 'offline' && m.hoistRole == null)).size;
    if (onlineCount) {
        // Create offline label text
        let container = document.createElement("div");
        container.id = 'onlineUserList';
        container.classList.add("roleContainer");
        listDiv.appendChild(container);

        let name = document.createElement("span");
        name.classList.add("roleTitle");
        name.innerText = 'online';
        container.appendChild(name);

        // Show online users
        guild.members
            .filter(m => m.presence.status != 'offline' && m.hoistRole == null)
            .sort((m1, m2) => m1.id - m2.id)
            .forEach(m => {
                // Make the div for the user
                let userDiv = document.createElement("div");
                userDiv.id = m.id;
                userDiv.classList.add('mLUserDiv');
                container.appendChild(userDiv);

                // Add the user icon
                let icon = document.createElement("img");
                icon.src = m.user.avatarURL ? m.user.avatarURL.replace(/(size=)(\d+)/gi, "$164") : "resources/images/default.png";
                icon.classList.add('mLIcon');
                userDiv.appendChild(icon);

                // Make the username text
                let username = document.createElement("p");
                username.classList.add("mLUsername");
                username.innerText = m.nickname || m.user.username;
                username.style.color = m.displayHexColor || "#8E9297";
                userDiv.appendChild(username);
            });
    }

    
    // Display the offline users
    let offlineCount = guild.members.filter(m => (m.presence.status == 'offline')).size;
    if (offlineCount) {
        // Create offline label text
        let container = document.createElement("div");
        container.id = 'offlineUserList';
        container.classList.add("roleContainer");
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
                icon.src = m.user.avatarURL ? m.user.avatarURL.replace(/(size=)(\d+)/gi, "$164") : "resources/images/default.png";
                icon.classList.add('mLIcon');
                userDiv.appendChild(icon);

                // Make the username text
                let username = document.createElement("p");
                username.classList.add("mLUsername");
                username.innerText = m.nickname || m.user.username;
                username.style.color = m.displayHexColor || "#8E9297";
                userDiv.appendChild(username);
            });
    }
};