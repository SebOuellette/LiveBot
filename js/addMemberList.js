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

'use strict';

function addMemberList(guild) {
    const listDiv = document.getElementById('memberBar');

    // Clear members list
    listDiv.innerHTML = '';

    let cachedMembers = [];

    // Loop through roles
    // console.log(guild.roles.cache.toJSON();
    let roles = guild.roles.cache
        .filter((r) => r.hoist) // Check if it is a displayed role
        .sort((role1, role2) => role2.rawPosition - role1.rawPosition); // Sort by highest to lowest rank

    roles.each((r) => {
        // Loop through
        const members = r.members
            .filter(
                (m) =>
                    m.roles.hoist?.id == r.id &&
                    m.presence &&
                    m.presence.status != 'offline' &&
                    !cachedMembers.includes(m.user.id)
            )
            .toJSON();

        if (members.length) {
            // Role container
            let container = document.createElement('div');
            container.id = r.id;
            container.classList.add('roleContainer');
            listDiv.appendChild(container);

            // Add the role name
            let name = document.createElement('span');
            name.classList.add('roleTitle');
            name.innerText = `${r.name} - ${members.length}`;
            container.appendChild(name);

            // Add each user
            if (members.length < 30) {
                // rendering too many members here causes performance issues.
                members
                    .sort((m1, m2) => m1.id - m2.id)
                    .forEach((m) => {
                        cachedMembers.push(m.id);

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
                        icon.src = m.displayAvatarURL({ size: 64 });
                        icon.classList.add('mLIcon');
                        userDiv.appendChild(icon);

                        // Make the username text
                        let username = document.createElement('p');
                        username.classList.add('mLUsername');
                        let name = m.displayName;
                        // if (name.length > 15) {
                        //     name = `${name.substring(0, 15)}...`
                        // }
                        username.innerText = name;
                        username.style.color =
                            m.roles.color?.hexColor || '#8E9297';
                        userDiv.appendChild(username);
                    });
            }
        }
    });

    const onlineMembers = guild.members.cache
        .filter(
            (m) =>
                !m.roles.hoist &&
                m.presence &&
                m.presence.status != 'offline' &&
                !cachedMembers.includes(m.user.id)
        )
        .toJSON();
    if (onlineMembers.length < 50) {
        // Create online label text
        let container = document.createElement('div');
        container.id = 'onlineUserList';
        container.classList.add('roleContainer');
        listDiv.appendChild(container);

        let name = document.createElement('span');
        name.classList.add('roleTitle');
        name.innerText = 'online';
        container.appendChild(name);

        // Show online users
        onlineMembers
            .sort((m1, m2) => m1.id - m2.id)
            .forEach((m) => {
                cachedMembers.push(m.id);

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
                icon.src = m.displayAvatarURL({ size: 64 });
                icon.classList.add('mLIcon');
                userDiv.appendChild(icon);

                // Make the username text
                let username = document.createElement('p');
                username.classList.add('mLUsername');
                username.innerText = m.nickname || m.user.username;
                username.style.color = m.roles.color?.hexColor || '#8E9297';
                userDiv.appendChild(username);
            });
    }

    // Display the offline users
    const offlineMembers = guild.members.cache
        .filter(
            (m) =>
                !m.presence ||
                (m.presence.status === 'offline' &&
                    !cachedMembers.includes(m.user.id))
        )
        .toJSON();
    if (offlineMembers.length) {
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
        offlineMembers
            .sort((m1, m2) => m1.id - m2.id)
            .forEach((m) => {
                cachedMembers.push(m.id);

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
                icon.src = m.displayAvatarURL({ size: 64 });
                icon.classList.add('mLIcon');
                userDiv.appendChild(icon);

                // Make the username text
                let username = document.createElement('p');
                username.classList.add('mLUsername');
                username.innerText = m.displayName;
                username.style.color = m.roles.color?.hexColor || '#8E9297';
                userDiv.appendChild(username);
            });
    }

    // Display the unsorted, online users
    if (true) {
        guild.members.fetch().then((members) => {
            // Display the other unshown users
            const offMembers = members
                .filter(
                    (m) =>
                        (!m.presence || m.presence.status === 'offline') &&
                        !cachedMembers.includes(m.user.id)
                )
                .toJSON();
            if (offMembers.length) {
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
                        icon.src = m.displayAvatarURL({ size: 64 });
                        icon.classList.add('mLIcon');
                        userDiv.appendChild(icon);

                        // Make the username text
                        let username = document.createElement('p');
                        username.classList.add('mLUsername');
                        username.innerText = m.nickname || m.user.username;
                        username.style.color =
                            m.roles.color?.hexColor || '#8E9297';
                        userDiv.appendChild(username);
                    });
            }
        });
    }
}
