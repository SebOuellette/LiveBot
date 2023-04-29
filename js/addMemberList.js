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

async function addMemberList(guild) {
    const listDiv = document.getElementById('memberBar');

    // Clear members list
    listDiv.innerHTML = '';

    if (!selectedChan) return;

    let members = guild.members.cache;
    let roles = new Discord.Collection();

    if (members.size !== guild.memberCount)
        members = await guild.members.fetch();

    guild.roles.cache
        .sort((role1, role2) => role2.rawPosition - role1.rawPosition)
        .forEach((role) =>
            roles.set(role.id, { id: role.id, name: role.name })
        );

    // add Online and Offline roles to display members without hoist role
    roles.set('online', { id: 'online', name: 'Online' });
    roles.set('offline', { id: 'offline', name: 'Offline' });

    members
        .sort((member1, member2) => {
            if (member1.displayName < member2.displayName) return -1;
            if (member1.displayName > member2.displayName) return 1;

            return 0;
        })
        .forEach((member) => {
            if (
                !member
                    .permissionsIn(selectedChan)
                    .has(Discord.PermissionFlagsBits.ViewChannel)
            )
                return;

            let role;

            if (!member.presence || member.presence.status == 'offline') {
                if (members.size < 1000) role = roles.get('offline');
                else return;
            } else if (member.roles.hoist)
                role = roles.get(member.roles.hoist.id);
            else if (member.presence.status != 'offline')
                role = roles.get('online');

            if (!role.container) {
                role.container = document.createElement('div');
                role.container.id = role.id;
                role.container.classList.add('roleContainer');

                role.container.name = document.createElement('span');
                role.container.name.classList.add('roleTitle');
                role.container.appendChild(role.container.name);
            }

            // Create the outer div
            let outerDiv = document.createElement('div');
            outerDiv.classList.add('mLOuterDiv');
            role.container.appendChild(outerDiv);

            // Make the div for the user
            let userDiv = document.createElement('div');
            userDiv.id = member.id;
            userDiv.classList.add('mLUserDiv');
            outerDiv.appendChild(userDiv);

            // Add the user icon
            let icon = document.createElement('img');
            icon.classList.add('mLIcon');
            icon.src = member.displayAvatarURL({ size: 64, forceStatic: true });
            userDiv.onmouseenter = (e) => {
                icon.src = member.displayAvatarURL({ size: 64 });
            };
            userDiv.onmouseleave = (e) => {
                icon.src = member.displayAvatarURL({
                    size: 64,
                    forceStatic: true,
                });
            };
            userDiv.appendChild(icon);

            // Make the username text
            let username = document.createElement('p');
            username.classList.add('mLUsername');
            let name = member.displayName;
            username.innerText = name;
            username.style.color = member.roles.color?.hexColor || '#8E9297';
            userDiv.appendChild(username);
        });

    roles
        .filter((role) => role.container)
        .forEach((role) => {
            // Add the role name with member count
            role.container.name.innerText = `${role.name} — ${
                role.container.childElementCount - 1
            }`;

            listDiv.appendChild(role.container);
        });
}
