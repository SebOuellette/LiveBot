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
        await bot.user.setUsername(name);
        document.getElementById('userCardName').innerText = bot.user.username;
        document.getElementsByClassName('newNameInput')[0].classList.remove('errorTextBox')
    } catch (e) {
        document.getElementsByClassName('newNameInput')[0].classList.add('errorTextBox')
        console.error(e)
    }
}

// Generate the invite code
function generateInvite(items) {
    let sum = items
        .reduce((a, b) => a + b);
    let invite = `Copied to Clipboard: https://discordapp.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=${sum}`;
    console.log(invite);
    clipboard.writeText(invite);
}