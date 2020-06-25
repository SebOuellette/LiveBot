global.Discord = require('discord.js');
const {remote, clipboard} = require('electron');
const fs = require('fs');
let jsonSettings = require("./json/settings.json");

let selectedGuild;
let selectedChan;
let selectedVoice;
let selectedChatDiv;
let oldimg;
let generatingMessages = false;
let barry = false;

// Create the app and attach event listeners
function create() {
    document.getElementById("msgbox")
        .addEventListener("keydown", event => {
            if (event.keyCode === 13 && !event.shiftKey) {
                sendmsg();
                event.preventDefault();
            }
        })

    document.getElementById("msgbox")
        .addEventListener("input", event => {
            let rows = document.getElementById("msgbox").value.split('\n').length;
            if (rows == 0)
                rows++;
            //document.getElementById("msgbox").rows = rows;
        });


    document.getElementById("tokenbox")
        .addEventListener("keydown", event => {
            if (event.keyCode === 13) {
                unloadAllScripts();
                setToken();
            }
        });
    
    // Call the settings menu builder
    buildSettingsMenu(jsonSettings);

    // Call the general click event listener script
    addDocListener();
    
    // Load the bot with the token in storage
    load(localStorage.getItem('livebot-token'));
}

// Save the token to localstorage
// Will be upgraded to database eventually
function savetoken() {
    localStorage.setItem('livebot-token', document.getElementById('tokenbox').value);
    setToken();
}

// Alert that you are typing
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

// Why has this code been in livbot this long????
// Options on the right pane
function options(type, content) {
    switch(type) {
        case 'username':
            bot.user.setUsername(content);
            document.getElementById('userCardName').innerHTML = content;
        break;

        case 'invite':
            selectedChan.createInvite().then(invite => command('Created invite for '+invite.guild.name+' \nhttps://discord.gg/'+invite.code));
        break;
    }
}
