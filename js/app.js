global.Discord = require('discord.js');
const remote = require('electron').remote;
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
    }
})


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
        .addEventListener("keyup", function(event) {
            if (event.keyCode === 13 && !keys.Shift) {
                event.preventDefault()
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

function typing() {
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
