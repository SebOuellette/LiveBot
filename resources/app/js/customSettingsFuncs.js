// Set the activity
function setActivity(dropdowns, activityName, streamurl) {
    let status = dropdowns[0];
    let activity = dropdowns[1];

    if (status.includes("Not")) {
        status = 'dnd';
    }

    if (activity == "Streaming")
        bot.user.setPresence({ 
            activity: { 
                name: activityName, 
                type: activity.toUpperCase(), 
                url: streamurl 
            }, 
            status: status.toLowerCase()
        });
    else
        bot.user.setPresence({ 
            activity: { 
                name: activityName, 
                type: activity.toUpperCase()
            }, 
            status: status.toLowerCase()
        });
}

// Set the new username
async function setUsername(name) {
    try {
        if(!name.replace(/ |#/, '').length){
            errorHandler('EMPTY-NAME');
            throw('EMPTY-NAME')
        }
        await bot.user.setUsername(name).catch(err => {
            errorHandler(err)
            throw (err)
        });
        document.getElementById('userCardName').innerText = bot.user.username;
    } catch (err) {
        document.getElementsByClassName('newNameInput')[0].animate(animations.flashRed, {duration: 500});
    }
}

// Generate the invite code
function generateInvite(items) {
    let sum;
    if (items.length) {
        sum = items
            .reduce((a, b) => a + b);
    } else {
        sum = 0;
    }
    let invite = `https://discordapp.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=${sum}`;
    console.log(`Copied to Clipboard: ${invite}`);
    clipboard.writeText(invite);
}