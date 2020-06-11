global.Discord = require('discord.js');
const remote = require('electron').remote;
const fs = require('fs');
let jsonSettings = require("./json/settings.json");

let selectedGuild;
let selectedChan;
let selectedChatDiv;
let oldimg;
let barry = false;

// Create the app and attach event listeners
function create() {
    let newlineCode = "&#13;&#10;";

    document.getElementById("msgbox")
        .addEventListener("keydown", event => {
            if (event.keyCode === 13 && event.shiftKey) {
                // Add a new line in to the message box
                document.getElementById("msgbox").innerHTML = document.getElementById("msgbox").innerHTML + newlineCode;
            } else if (event.keyCode === 13) {
                sendmsg();
            }
        });


    document.getElementById("tokenbox")
        .addEventListener("keydown", event => {
            if (event.keyCode === 13) {
                unloadAllScripts();
                setToken();
            }
        });
    
    // Call the settings meny builder
    buildSettingsMenu(jsonSettings);

    load(localStorage.getItem('livebot-token'));
}

// Save the token to localstorage
// Will be upgraded to database eventually
function savetoken() {
    localStorage.setItem('livebot-token', document.getElementById('tokenbox').value);
    setToken();
}

function typing() {
    if (selectedChan) {
        let isTyping = bot.user._typing.has(selectedChan.id);

        // Handle start and stop typing
        if (document.getElementById("msgbox").value.length > 0 && !isTyping) {
            
            // Text box is not empty, start typing
            selectedChan.startTyping();
        } else if (document.getElementById("msgbox").value.length == 0 && isTyping) {

            // Text box is empty, stop typing
            selectedChan.stopTyping(true);
        }
    }
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
