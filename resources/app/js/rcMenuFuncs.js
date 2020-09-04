// -------- MESSAGE MENU --------

// Used for removing the edit message DOM and replacing it with the original
let editDOM = (target, textarea, elementText) => {
    // Remove the text field, replace with normal message
    target.removeChild(textarea);  

    let newMsgElement = document.createElement('p');
    newMsgElement.classList.add('messageText');
    newMsgElement.innerHTML = elementText;
    target.appendChild(newMsgElement);
}

let checkEditDoms = () => {
    // Check if there's any edit message menu already open and close it
    let messageMenus = document.getElementsByClassName('editTextarea')

    for(let messageMenu of messageMenus){
        let id = messageMenu.classList[2];
        let text = selectedChan.messages.cache.get(id).cleanContent;
        editDOM(messageMenu.parentElement, messageMenu, text)
    }
}

// Edit a message
function editMsg(target) {
    // Safe check so there is only one DOM to edit messages
    checkEditDoms();

    // Find and delete the message text <p> element
    let textElement = target.querySelector('.messageText');

    // Get the text in the message
    let elementText = textElement.innerHTML;
    let msg = selectedChan.messages.cache.get(target.id);
    let text = msg.cleanContent;

    target.removeChild(textElement);

    let textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.classList.add('editTextarea');
    textarea.classList.add('messageBoxText');
    textarea.classList.add(target.id);
    textarea.rows = '1';
    setRows(textarea);
    target.appendChild(textarea);

    textarea.addEventListener("keydown", e => {

            if (e.keyCode === 13 && !e.shiftKey) {
                if(textarea.value == text) return editDOM(target, textarea, text)
                let newText = textarea.value;
                newText = newText.replace(/(<a?:)(!)?(.+?:[0-9]+?>)/gm, (a, b, c, d) => {
                    if (c != '!') {
                        return `${b}!${d}`; 
                    }
                    return a;
                });

                newText = parseSend(newText);

                msg.edit(newText).catch(e => {command('Message failed to send\nError: ' + e.message)});;

                editDOM(target, textarea, elementText);
            }
        });

    textarea.addEventListener("input", e => setRows(textarea));
}

function setRows(textarea) {
    let rows = textarea.value.split('\n').length;
    if (rows > 6)
        rows = 6;
    if (rows == 0)
        rows++;
    textarea.rows = rows;
}

function pinMsg(id, pin) {
    try {
        pin ? selectedChan.messages.cache.get(id).pin() : selectedChan.messages.cache.get(id).unpin();
    } catch (e) {
        console.log(e); 
    }
}

function deleteMsg(id) {
    try {
        selectedChan.messages.cache.get(id).delete();
    } catch (e) {
        console.log(e);
    }
}

function copyMessageLink(id, msg) {
    clipboard.writeText(`https://discordapp.com/channels/${msg.guild.id}/${msg.channel.id}/${id}`);
}

function copyMessageID(id) {
    clipboard.writeText(id);
}

// -------- USER MENU --------

function dmUser(user){
    dmChannelSelect(user)
}

function mentionUser(id){
    let msgBox = document.getElementById('msgbox')
    msgBox.value += `<@${id}>`
}

function copyUserID(id){
    clipboard.writeText(id);
}

function copyAvatarLink(member){
    member = member.user ? member.user : member;
    clipboard.writeText( member.avatar ? member.avatar.startsWith('a_') ? member.displayAvatarURL().replace('.webp', '.gif') : member.displayAvatarURL() : member.displayAvatarURL());
}