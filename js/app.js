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

// Disable the security warning from electron
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;

// Custom error messages
function loginErrors(err){
    let code = err.code ? err.code : err;
    switch(code){
        case('NO-TOKEN'):
            console.error('There is no token stored');
            settings.functions.openSettings('User');
            break;
        case('EMPTY-TOKEN'):
            console.error('The token is empty');
            break;
        case('TOKEN_INVALID'):
            console.error('Invalid Token');
            break;
        case('SHARDING_REQUIRED'):
            console.error('Sharding is not a feature yet');
            break;
        default:
            console.error(`Error code: ${err.code}\n${err}`);
            break;
    }
}

// Create the app and attach event listeners
function create() {
    document.getElementById("msgbox")
        .addEventListener("keydown", event => {
            if (event.keyCode === 13 && !event.shiftKey) {
                event.preventDefault();
                sendmsg();
            }
        })

    document.getElementById("msgbox")
        .addEventListener("input", event => {
            let rows = document.getElementById("msgbox").value.split('\n').length;
            if (rows == 0)
                rows++;
            //document.getElementById("msgbox").rows = rows;
        });
    
    // Call the settings menu builder
    buildSettingsMenu(jsonSettings);

    // Call the general click event listener script
    addDocListener();

    // Load the bot with the token in storage or throw an error if there isn't any
    if(settings.token)
        load(settings.token);
    else
        loginErrors('NO-TOKEN')
}

// Alert that you are typing
function typing() {
    if(!selectedChan || !document.getElementById("msgbox").value) return;
    selectedChan.startTyping(1);
    let channels = bot.user._typing.keys()
    let channel = channels.next();
    while(!channel.done){
        if(channel.done || !channel.value) return
        typingTimer.typingTimeout[1](channel.value)
        channel = channels.next(); 
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
