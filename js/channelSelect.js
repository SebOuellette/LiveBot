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

// Create message
async function messageCreate(channel) {
    let messages = document.getElementById("message-list");
    let fetchSize = 100;
    generatingMessages = true;
    // Loop through messages
    let count = 0;
    await channel.messages.fetch({limit: fetchSize})
        .then(msg => {
            msg.map(mseg => mseg).reverse().forEach(m => {
                count++;
                let message = generateMsgHTML(m, msg.map(mesg => mesg).reverse()[count-2], count, fetchSize);
                document.getElementById('message-list').appendChild(message);
            });
        }
    );
    // Add the no load apology
    let shell = document.createElement("div");
    shell.classList.add("sorryNoLoad");
    let text = document.createElement("p");
    text.innerText = "Sorry! No messages beyond this point can be displayed.";
    shell.appendChild(text);
    document.getElementById("message-list").prepend(shell);

    messages.scrollTop = messages.scrollHeight;
    generatingMessages = false;
}

let channelSelect = (channel, name) => {

    if (channel.type == 'voice') {
        selectedVoice = channel;
        return;
    }

    if (generatingMessages) {
        return;
    }

    selectedChan = channel;
    selectedChanDiv = name;
    name.style.color = '#eee';
    messageCreate(channel);

    // Refresh the typing indicator
    typingStatus(true)

    // Set the message bar placeholder
    document.getElementById('msgbox').placeholder = `Message #${channel.name}`

    // Remove the notification class
    name.classList.remove("newMsg");

    // Clear the messages
    while (messages.firstChild) {
        messages.removeChild(messages.firstChild);
    }

    // Set colour of the channel
    try {
        selectedChanDiv.style.color = '#606266';
        name.addEventListener('mouseover', () => {
            if (name.style.color != 'rgb(238, 238, 238)') {
                name.style.color = '#B4B8BC';
            }
        });
    
        name.addEventListener('mouseleave', () => {
            if (name.style.color != 'rgb(238, 238, 238)') {
                name.style.color = '#606266';
            }
        });
    } catch (err) {console.log(err)}

    messageCreate(channel);
}

let dmChannelSelect = async (user, name = 'test') => {
    if (u.bot || bot.user == user) return;

    if (!user.dmChannel) {
        await user.createDM();
    }

    let channel = user.dmChannel;

    if (generatingMessages) {
        return;
    }
    if (!user.openDM) user.openDM = true;

    if(selectedChatDiv){
        selectedChatDiv.classList.remove('selectedChan')
        selectedChatDiv = undefined;
    }

    selectedChan = channel;

    messageCreate();

    // Refresh the typing indicator
    typingStatus(true)

    // Set the message bar placeholder
    document.getElementById(
      "msgbox"
    ).placeholder = `Message #${channel.recipient.username}`;

    // Clear the messages
    while (messages.firstChild) {
        messages.removeChild(messages.firstChild);
    }

    messageCreate(channel);
}
