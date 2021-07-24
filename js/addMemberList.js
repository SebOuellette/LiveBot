// Copyright 2017 Sebastian Ouellette

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use strict";

function addMemberList(guild) {
    let listDiv = document.getElementById('memberBar');

    // Clear members list
    listDiv.innerHTML = '';

    // Loop through roles
    // console.log(guild.roles.cache.map(r => r));
    let roles = guild.roles.cache
        .map((r) => r) // Convert to array
        .filter((r) => r.hoist) // Check if it is a displayed role
        .sort((r1, r2) => r2.position - r1.position); // Sort by highest to lowest rank

    roles.forEach((r) => {
        // Loop through
        let memberCount = r.members.filter(
            (m) =>
                m.roles.hoist &&
                m.roles.hoist.id == r.id &&
                m.presence.status != 'offline'
        ).size;

        if (memberCount) {
            // Role container
            let container = document.createElement('div');
            container.id = r.id;
            container.classList.add('roleContainer');
            listDiv.appendChild(container);

            // Add the role name
            let name = document.createElement('span');
            name.classList.add('roleTitle');
            name.innerText = r.name;
            container.appendChild(name);

            // Add each user
            r.members
                .filter(
                    (m) =>
                        m.roles.hoist &&
                        m.roles.hoist.id == r.id &&
                        m.presence.status != 'offline'
                )
                .sort((m1, m2) => m1.id - m2.id)
                .forEach((m) => {
                    // Create the outer div
                    let outerDiv = document.createElement('div');
                    outerDiv.classList.add('mLOuterDiv');
                    container.appendChild(outerDiv);

                    // Make the div for the user
                    let userDiv = document.createElement('div');
                    userDiv.id = m.id;
                    userDiv.classList.add('mLUserDiv');
                    outerDiv.appendChild(userDiv);

                    // Add the user icon
                    let icon = document.createElement('img');
                    icon.src = m.user
                        .displayAvatarURL()
                        .replace(/(size=)(\d+)/gi, '$164');
                    icon.classList.add('mLIcon');
                    userDiv.appendChild(icon);

                    // Make the username text
                    let username = document.createElement('p');
                    username.classList.add('mLUsername');
                    let name = m.nickname || m.user.username;
                    // if (name.length > 15) {
                    //     name = `${name.substring(0, 15)}...`
                    // }
                    username.innerText = name;
                    username.style.color = m.displayHexColor || '#8E9297';
                    userDiv.appendChild(username);
                });
        }
    });

    let onlineCount = guild.members.cache.filter(
        (m) => m.presence.status != 'offline' && m.roles.hoist == null
    ).size;
    if (onlineCount) {
        // Create offline label text
        let container = document.createElement('div');
        container.id = 'onlineUserList';
        container.classList.add('roleContainer');
        listDiv.appendChild(container);

        let name = document.createElement('span');
        name.classList.add('roleTitle');
        name.innerText = 'online';
        container.appendChild(name);

        // Show online users
        guild.members.cache
            .filter(
                (m) => m.presence.status != 'offline' && m.roles.hoist == null
            )
            .sort((m1, m2) => m1.id - m2.id)
            .forEach((m) => {
                // Create the outer div
                let outerDiv = document.createElement('div');
                outerDiv.classList.add('mLOuterDiv');
                container.appendChild(outerDiv);

                // Make the div for the user
                let userDiv = document.createElement('div');
                userDiv.id = m.id;
                userDiv.classList.add('mLUserDiv');
                outerDiv.appendChild(userDiv);

                // Add the user icon
                let icon = document.createElement('img');
                icon.src = m.user
                    .displayAvatarURL()
                    .replace(/(size=)(\d+)/gi, '$164');
                icon.classList.add('mLIcon');
                userDiv.appendChild(icon);

                // Make the username text
                let username = document.createElement('p');
                username.classList.add('mLUsername');
                username.innerText = m.nickname || m.user.username;
                username.style.color =
                    m.displayColor == 0 ? '#8E9297' : m.displayHexColor;
                userDiv.appendChild(username);
            });
    }

    let offline = [];

    // Display the offline users
    let offlineCount = guild.members.cache.filter(
        (m) => m.presence.status == 'offline'
    ).size;
    if (offlineCount) {
        // Create offline label text
        let container = document.createElement('div');
        container.id = 'offlineUserList';
        container.classList.add('roleContainer');
        listDiv.appendChild(container);

        let name = document.createElement('span');
        name.classList.add('roleTitle');
        name.innerText = 'offline';
        container.appendChild(name);

        // Show offline users
        guild.members.cache
            .filter((m) => m.presence.status == 'offline')
            .sort((m1, m2) => m1.id - m2.id)
            .forEach((m) => {
                offline.push(m.user.id);
                let outerDiv = document.createElement('div');
                outerDiv.classList.add('mLOuterDiv');
                outerDiv.classList.add('mLOuterDivOffline');
                container.appendChild(outerDiv);

                // Make the div for the user
                let userDiv = document.createElement('div');
                userDiv.id = m.id;
                userDiv.classList.add('mLUserDivOffline');
                userDiv.classList.add('mLUserDiv');
                outerDiv.appendChild(userDiv);

                // Add the user icon
                let icon = document.createElement('img');
                icon.src = m.user
                    .displayAvatarURL()
                    .replace(/(size=)\d+?($| )/, '$164');
                icon.classList.add('mLIcon');
                userDiv.appendChild(icon);

                // Make the username text
                let username = document.createElement('p');
                username.classList.add('mLUsername');
                username.innerText = m.displayName || m.user.username;
                username.style.color =
                    m.displayColor == 0 ? '#8E9297' : m.displayHexColor;
                userDiv.appendChild(username);
            });
    }

    // Display the unsorted, online users
    if (true) {
        guild.members.fetch().then((members) => {
            members = members.array();
            // Display the other unshown users users
            let offlineCount = members.filter(
                (m) =>
                    m.presence.status == 'offline' &&
                    !offline.includes(m.user.id)
            ).length;
            if (offlineCount) {
                // Create offline label text
                let container = document.createElement('div');
                container.id = 'offlineUserList';
                container.classList.add('roleContainer');
                listDiv.appendChild(container);

                let name = document.createElement('span');
                name.classList.add('roleTitle');
                name.innerText = 'uncached users';
                container.appendChild(name);

                // Show offline users
                members
                    .filter(
                        (m) =>
                            m.presence.status == 'offline' &&
                            !offline.includes(m.user.id)
                    )
                    .sort((m1, m2) => m1.id - m2.id)
                    .forEach((m) => {
                        // Create outer div
                        let outerDiv = document.createElement('div');
                        outerDiv.classList.add('mLOuterDiv');
                        outerDiv.classList.add('mLOuterDivOffline');
                        container.appendChild(outerDiv);

                        // Make the div for the user
                        let userDiv = document.createElement('div');
                        userDiv.id = m.id;
                        userDiv.classList.add('mLUserDivOffline');
                        userDiv.classList.add('mLUserDiv');
                        outerDiv.appendChild(userDiv);

                        // Add the user icon
                        let icon = document.createElement('img');
                        icon.src = m.user
                            .displayAvatarURL()
                            .replace(/(size=)\d+?($| )/, '$164');
                        icon.classList.add('mLIcon');
                        userDiv.appendChild(icon);

                        // Make the username text
                        let username = document.createElement('p');
                        username.classList.add('mLUsername');
                        username.innerText = m.displayName || m.user.username;
                        username.style.color =
                            m.displayColor == 0 ? '#8E9297' : m.displayHexColor;
                        userDiv.appendChild(username);
                    });
            }
        });
    }
}
