// Edit a message
function editMsg(target) {
    // Find and delete the message text <p> element
    let textElement = target.querySelector('.messageText');

    // Get the text in the message
    let elementText = textElement.innerHTML;
    let text = selectedChan.messages.get(target.id).cleanContent;

    target.removeChild(textElement);

    let textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.classList.add('editTextarea');
    textarea.classList.add('messageBoxText');
    textarea.rows = '1';
    setRows(textarea)
    target.appendChild(textarea);

    textarea.addEventListener("keydown", e => {
            if (e.keyCode === 13 && !e.shiftKey) {
                let newText = textarea.value;
                newText = newText.replace(/(<a?:)(!)?(.+?:[0-9]+?>)/gm, (a, b, c, d) => {
                    if (c != '!') {
                        return `${b}!${d}`; 
                    }
                    return a;
                });

                selectedChan.messages.get(target.id).edit(newText); 

                // Remove the text field, replace with normal message
                target.removeChild(textarea);  

                let newMsgElement = document.createElement('p');
                newMsgElement.classList.add('messageText');
                newMsgElement.innerHTML = elementText;
                target.appendChild(newMsgElement);
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

function pinMsg(id) {
    try {
        selectedChan.messages.get(id).pin();
    } catch (e) {
        console.log(e); 
    }
}

function deleteMsg(id) {
    try {
        selectedChan.messages.get(id).delete();
    } catch (e) {
        console.log(e);
    }
}