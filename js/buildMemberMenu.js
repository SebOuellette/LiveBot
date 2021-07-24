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

function buildMemberMenu(parent) {
    let member = selectedGuild.members.cache.get(parent.firstChild.id);

    let div = document.createElement('div');
    div.classList.add('memberMenu');
    parent.appendChild(div);

    // The top section of the member menu
    let user = document.createElement('div');
    user.classList.add('memberMenuUserDiv');
    div.appendChild(user);

    // The user icon
    let userIcon = document.createElement('img');
    userIcon.classList.add('memberIcon');

    if (member.user.avatar && member.user.avatar.startsWith('a_'))
        userIcon.src = member.user.displayAvatarURL().replace('.webp', '.gif');
    else userIcon.src = member.user.displayAvatarURL();

    user.appendChild(userIcon);

    // Username and nickname
    let topName = document.createElement('span');
    topName.classList.add('memberTopName');
    topName.innerText = member.nickname
        ? member.nickname
        : member.user.username;
    user.appendChild(topName);

    if (member.nickname != null) {
        // Create the full tag below
        let bottomName = document.createElement('span');
        bottomName.classList.add('memberBottomName');
        bottomName.innerText = member.user.tag;
        user.appendChild(bottomName);
    } else {
        // Add the discriminator to the top name
        let topDisc = document.createElement('span');
        topDisc.classList.add('memberTopDisc');
        topDisc.innerText = `#${member.user.discriminator}`;
        topName.appendChild(topDisc);
    }

    // Custom presence div
    let presenceDiv = document.createElement('div');
    presenceDiv.classList.add('menuPresenceDiv');
    user.appendChild(presenceDiv);

    // Custom presence
    let custPresence = member.user.presence.activities.filter(
        (a) => a.type == 'CUSTOM_STATUS'
    )[0];
    if (custPresence) {
        if (custPresence.emoji) {
            // Status emoji
            let custEmoji = document.createElement('div');
            custEmoji.classList.add('memberCustomEmoji');
            if (custPresence.emoji.id) {
                // Custom emoji
            } else {
                // Twemoji
                custEmoji.innerHTML = twemoji.parse(custPresence.emoji.name);
            }
            presenceDiv.appendChild(custEmoji);
        }

        // Status text
        let custPres = document.createElement('span');
        custPres.classList.add('memberCustomPresence');
        custPres.innerText = custPresence.state;
        presenceDiv.appendChild(custPres);
    }

    // Set the final position of the menu
    let borderOffset = 40;
    let y = window.pageYOffset + parent.getBoundingClientRect().top - 20;
    if (y + div.clientHeight > window.innerHeight)
        y = window.innerHeight - div.clientHeight - borderOffset;

    div.style.top = `${y}px`;
}
