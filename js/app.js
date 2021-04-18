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

global.Discord = require('discord.js');

// TEMPORARY CODE UNTILL INLINE REPLIES ARE ADDED TO STABLE DISCORD.JS https://gist.github.com/Allvaa/0320f06ee793dc88e4e209d3ea9f6256

const { Structures } = require('discord.js');

class Message extends Structures.get("Message") {
    async inlineReply(content, options) {
        const mentionRepliedUser = typeof ((options || content || {}).allowedMentions || {}).repliedUser === "undefined" ? true : ((options || content).allowedMentions).repliedUser;
        delete ((options || content || {}).allowedMentions || {}).repliedUser;

        const apiMessage = content instanceof APIMessage ? content.resolveData() : APIMessage.create(this.channel, content, options).resolveData();
        Object.assign(apiMessage.data, { message_reference: { message_id: this.id } });
    
        if (!apiMessage.data.allowed_mentions || Object.keys(apiMessage.data.allowed_mentions).length === 0)
            apiMessage.data.allowed_mentions = { parse: ["users", "roles", "everyone"] };
        if (typeof apiMessage.data.allowed_mentions.replied_user === "undefined")
            Object.assign(apiMessage.data.allowed_mentions, { replied_user: mentionRepliedUser });

        if (Array.isArray(apiMessage.data.content)) {
            return Promise.all(apiMessage.split().map(x => {
                x.data.allowed_mentions = apiMessage.data.allowed_mentions;
                return x;
            }).map(this.inlineReply.bind(this)));
        }

        const { data, files } = await apiMessage.resolveFiles();
        return this.client.api.channels[this.channel.id].messages
            .post({ data, files })
            .then(d => this.client.actions.MessageCreate.handle(d).message);
    }
}

Structures.extend("Message", () => Message);

// TEMPORARY CODE UNTILL INLINE REPLIES ARE ADDED TO STABLE DISCORD.JS https://gist.github.com/Allvaa/0320f06ee793dc88e4e209d3ea9f6256

const { remote, clipboard } = require('electron');
const fs = require('fs');
let jsonSettings = require('./json/settings.json');

let selectedGuild;
let selectedChan;
let selectedVoice;
let selectedChatDiv;
let oldimg;
let generatingMessages = false;
let barry = false;

// Disable the security warning from electron
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
// Display that LiveBot has started
console.log('LiveBot started');

// Animations used in javascript if they can't be used in css
let animations = {
    flashRed: [
        { borderColor: '#313339' },
        { borderColor: '#A00' },
        { borderColor: '#F00' },
        { borderColor: '#A00' },
        { borderColor: '#313339' },
    ],
    flashTextRed: [
        { color: '#B4B8BC' },
        { color: '#F00' },
        { color: '#B4B8BC' },
    ],
};

// Create the app and attach event listeners
async function create() {
    document.getElementById("clearCache").onclick = e => {
        localStorage.clear();
        document.getElementById("clearCache").parentElement.innerHTML = "<p class='greenText'>Cache cleared! Now you can restart LiveBot</p>";
    };

    document.getElementById('msgbox').addEventListener('keydown', (event) => {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            sendmsg();
        }
    });

    document.getElementById('msgbox').addEventListener('input', (event) => {
        let rows = document.getElementById('msgbox').value.split('\n').length;
        if (rows == 0) rows++;
        // document.getElementById("msgbox").rows = rows;
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
