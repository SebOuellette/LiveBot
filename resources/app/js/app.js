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
// Display that LiveBot has started
console.log('LiveBot started');

// Animations used in javascript if they can't be used in css
let animations = {
    flashRed: [
        {borderColor: '#313339'},
        {borderColor: '#A00'},
        {borderColor: '#F00'},
        {borderColor: '#A00'},
        {borderColor: '#313339'}
    ],
    flashTextRed: [
        {color: '#B4B8BC'},
        {color: '#F00'},
        {color: '#B4B8BC'}
    ]
}

// Create the app and attach event listeners
async function create() {
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
    setLoadingPerc(0);
    if(settings.defaultToken) {
        var error = await load(settings.defaultToken);
        if (error[0]) {
            buildSplashToken();
        }
    } else {
        buildSplashToken();
        //errorHandler('NO-TOKEN');
    }
}

// Alert that you are typing
function typing() {
    if(!selectedChan || !document.getElementById("msgbox").value) return;
    selectedChan.startTyping(1);
    let channels = bot.user._typing.keys()
    let channel = channels.next();
    while(!channel.done){
        if(channel.done || !channel.value) return
        typingTimer.typingTimeout.check(channel.value)
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
