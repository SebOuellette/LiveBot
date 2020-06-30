let channelSelect = (c, name) => {
    let messages = document.getElementById("message-list");
    let fetchSize = 100;

    if (c.type == 'voice') {
        selectedVoice = c;
        return;
    }

    if (generatingMessages) {
        return;
    }

    // Stop typing in the current channel before switching
    if (selectedChan) {
        selectedChan.stopTyping(true);
    }
    selectedChan = c;
    selectedChanDiv = name;
    name.style.color = '#eee';
    messageCreate();

    // Refresh the typing indicator
    typingStatus()

    // Set the message bar placeholder
    document.getElementById('msgbox').placeholder = `Message #${c.name}`

    // Remove the notification class
    name.classList.remove("newMsg");

    // Clear the messages
    while (messages.firstChild) {
        messages.removeChild(messages.firstChild);
    }

    // Set colour of message
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

    // Create message
    async function messageCreate() {
        generatingMessages = true;
        // Loop through messages
        let count = 0;
        await c.messages.fetch({limit: fetchSize})
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
}
