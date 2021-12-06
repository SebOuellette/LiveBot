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

const Discord = require('discord.js');
const { clipboard } = require('electron');
const fs = require('fs');
let jsonSettings = require('./json/settings.json');

let selectedGuild;
let selectedChan;
let selectedChanDiv;
let selectedVoice;
let selectedChatDiv;
let oldimg;
let generatingMessages = false;
let barry = false;

// Disable the security warning from electron that comes from using an uncompiled version
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
// Set the permissions umask to 0, allowing writing to files using the exact specified permissions
process.umask(0);
// Allows LiveBot to work as an executable
process.chdir(__dirname);
// Display that LiveBot has started
console.log('LiveBot started');

// Create the app and attach event listeners
async function create() {
    document.getElementById("clearCache").onclick = e => {
        clearSettingsFile();
        document.getElementById("clearCache").parentElement.innerHTML = "<p class='greenText'>Cache cleared! Now you can restart LiveBot</p>";
    };

    document.getElementById('msgbox').addEventListener('keydown', (event) => {
        if (event.key == "Enter" && !event.shiftKey) {
            event.preventDefault();

            // If the message was able to be sent, reset the message box size
            if (!sendmsg()) {
                // Reset the textbox height
                let msgBox = document.getElementById("sendmsg");
                msgBox.style.height = '38px'; // Reset the height first
                msgBox.style.transform = '';
            }
        }
    });

    document.getElementById('msgbox').addEventListener('input', (event) => {
        let textElem = document.getElementById('msgbox');
        let rows = textElem.value.split('\n').length;
        rows = (rows == 0) ? 1 : rows;
        // document.getElementById("msgbox").rows = rows;
        
        let msgBox = document.getElementById("sendmsg");

        if (textElem.scrollHeight < 38*5) {
            msgBox.style.height = '0px' // Reset the height first
            msgBox.style.height = `${textElem.scrollHeight}px`;
            msgBox.style.transform = `translateY(-${textElem.scrollHeight-38}px)`
        }
    });

    // Call the settings menu builder
    buildSettingsMenu(jsonSettings);

    // Call the general click event listener script
    addDocListener();

    // Load the bot with the token in storage or throw an error if there isn't any
    setLoadingPerc(0);
    if (settings.defaultToken) {
        var error = await load(settings.defaultToken);
        if (error[0]) {
            buildSplashToken();
        }
    } else {
        buildSplashToken();
        // errorHandler('NO-TOKEN');
    }
}

// Alert that you are typing
function typing() {
    if (!selectedChan || !document.getElementById('msgbox').value) return;
    selectedChan.startTyping(1);
    let channels = bot.user._typing.keys();
    let channel = channels.next();
    while (!channel.done) {
        if (channel.done || !channel.value) return;
        typingTimer.typingTimeout.check(channel.value);
        channel = channels.next();
    }
}

// Why has this code been in livbot this long????
// Options on the right pane
function options(type, content) {
    switch (type) {
        case 'username':
            bot.user.setUsername(content);
            document.getElementById('userCardName').innerText = content;
            break;

        case 'invite':
            selectedChan
                .createInvite()
                .then((invite) =>
                    command(
                        'Created invite for ' +
                            invite.guild.name +
                            ' \nhttps://discord.gg/' +
                            invite.code
                    )
                );
            break;
    }
}
