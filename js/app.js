global.Discord = require('discord.js');
const remote = require('electron').remote;
// In the future there will be two discord moudles, main and remote (For voice chat)
const fs = require('fs');

let selectedGuild;
let selectedChan;
let selectedChatDiv;
let oldimg;
let barry = false;

let shell = require('electron').shell
document.addEventListener('click', function(event) {
    if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
        event.preventDefault()
        shell.openExternal(event.target.href)
        // Just a thought but there are links to channels so that could be added here (ex. https://discordapp.com/channels/GuildID/ChannelId/MessageId)
    }
})

let keys = {
    delete: false,
    shift: false
}

function scale(w, h) {
    if (w <= 400 && h <= 400) {
        return [w, h];
    }

    if (w == h) {
        w = 400;
        h = 400;
    } else if (w > h) {
        h = Math.round((h * 400) / w);
        w = 400;
    } else {
        w = Math.round((w * 400) / h);
        h = 400;
    }
    return [w, h]
}

// Create the app and attach event listeners
function create() {
    document.getElementById("msgbox")
        // keydown because it adds a newline if it's keyup (discord also uses keydown)
        .addEventListener("keydown", function(event) {
            typing(true);
            if (event.keyCode === 13 && !keys.Shift) {
                // Prevent newline after sending a message
                event.preventDefault();
                typing(false);
                sendmsg();
            }
        });

    /*document.getElementById("usernameBox")
        .addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                options('username', document.getElementById('usernameBox').value);
                document.getElementById("usernameBox").value = '';
            }
        });*/

    document.getElementById("tokenbox")
        .addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                setToken();
            }
        });

    load(localStorage.getItem('livebot-token'));
}

// Save the token to localstorage
// Will be upgraded to database eventually
function savetoken() {
    localStorage.setItem('livebot-token', document.getElementById('tokenbox').value);
    setToken();
}


function typing(on) {
    // Needs a timer to work or it won't stop typing
    // on ? selectedChan.startTyping() : selectedChan.stopTyping(true)
}

// Options on the right pane
function options(type, content) {
    switch(type) {
        case 'username':
            bot.user.setUsername(content);
            document.getElementById('userCardName').innerHTML = content;
        break;

        case 'invite':
            selectedChan.createInvite().then(invite => {command('Created invite for '+invite.guild.name+' \nhttps://discord.gg/'+invite.code);})
        break;
    }
}
