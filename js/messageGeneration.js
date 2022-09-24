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

function findTimeDiff(m, previousMessage, count) {
    let bunch = false;
    let timebunch = false;

    if (previousMessage && previousMessage.author.id == m.author.id) {
        bunch = true;

        if (
            Math.floor(
                previousMessage.createdTimestamp / 1000 / 60 / 60 / 24
            ) != Math.floor(m.createdTimestamp / 1000 / 60 / 60 / 24)
        ) {
            bunch = false;
            timebunch = true;
        }
    } else {
        bunch = false;
    }

    return [bunch, timebunch];
}

function generateMsgHTML(
    m,
    previousMessage,
    count = -1,
    fetchSize = undefined
) {
    // Check if the messages should be grouped or not
    let result = [false, false];
    if (count == -1 || (count > 2 && count <= fetchSize)) {
        result = findTimeDiff(m, previousMessage);
    }

    // The bunched values
    let bunch = result[0];
    let timebunch = result[1];

    // Create the div for the dark background
    let darkBG = document.createElement('div');
    darkBG.classList.add('messageBlock');
    darkBG.id = m.id;

    // Create the messages
    let div;
    if (!bunch) {
        // Create message div
        div = document.createElement('div');
        div.classList.add('messageCont');
        div.classList.add(m.author.id);
        if (m.channel.type == 'dm') div.classList.add('dms');
        if (timebunch) {
            div.classList.add('timeSeparated');
        }

        // Inline message container
        // messageContainer = document.createElement("div");
        // messageContainer.classList.add(m.author.id);
        // messageContainer.classList.add('inlineMsgCont');
        // div.appendChild(messageContainer);

        // Create the dark background
        darkBG.classList.add('firstmsg');
        div.appendChild(darkBG);

        // Create user image
        let img = document.createElement('img');
        let userImg = m.author
            .displayAvatarURL()
            .replace(/(size=)\d+?($| )/, '$128');
        if (m.author.avatar && m.author.avatar.startsWith('a_')) {
            let userGif = m.author
                .displayAvatarURL()
                .replace('.webp', '.gif')
                .replace(/(size=)\d+?($| )/, '$128');
            img.src = userGif;
            darkBG.onmouseenter = (e) => {
                img.src = userGif;
            };
            darkBG.onmouseleave = (e) => {
                img.src = userImg;
            };
        }
        img.classList.add('messageImg');
        img.src = userImg;
        img.height = '40';
        img.width = '40';
        darkBG.appendChild(img);

        // Create user's name
        let name = document.createElement('p');
        name.innerText =
            (m.member ? m.member.nickname : m.author.username) ||
            m.author.username;
        name.classList.add('messageUsername');

        // Find the colour of their name
        // Use the highest role for their color
        name.style.color =
            m.member && (m.member.roles.color && m.member.roles.color.hexColor) ||
            '#fff';

        darkBG.appendChild(name);

        // Create timestamp
        let timestamp = document.createElement('p');
        timestamp.innerText =
            ' ' +
            m.createdAt.toLocaleString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        timestamp.classList.add('messageTimestamp');
        darkBG.appendChild(timestamp);
    } else {
        div = document.getElementsByClassName(m.author.id);
        div = div[div.length - 1];
        div.appendChild(darkBG);
    }

    // Prepend message text
    if (m.cleanContent.length) {
        // Render message text
        let text = document.createElement('p');
        text.classList.add('messageText');
        text.innerHTML = parseMessage(m.cleanContent, m, false);

        if (m.editedAt)
            text.innerHTML += '<time class="edited"> (edited)</time>';

        darkBG.appendChild(text);
    }

    // Append embeds
    m.embeds.forEach((embed) => {
        showEmbed(embed, darkBG, m);
    });
    return div;
}
