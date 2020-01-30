global.Discord = require('discord.js');
const remote = require('electron').remote;
const fs = require('fs');

let selectedGuild;
let selectedChan;
let selectedChatDiv;
let oldimg;
let barry = false;

// Create the app and attach event listeners
function create() {
    document.getElementById("msgbox")
        .addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
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
