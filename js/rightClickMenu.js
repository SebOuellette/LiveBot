function addDocListener() {
    document.addEventListener('keydown', e => {
        // When ESC is pressed
        if(e.keyCode == 27){
            // Safe check so there is only one DOM to edit messages
            checkEditDoms();
        }
    })

    document.addEventListener("mousedown", e => {
        // Set the target and whatnot
        e = e || window.event;
        let target = e.target || e.srcElement;
        
        // X and Y position of the click
        let x = e.clientX;
        let y = e.clientY;

        let rcMenu = document.getElementById('rcMenu');
        rcMenu.innerHTML = '';
        if (e.which == 1) { // Left click
            rcMenu.classList.remove('open');
        } else if (e.which == 3) { // Right click
            if (e.target.classList.contains('rcOption') || e.target.parentElement.classList.contains('rcOption')) return rcMenu.classList.remove('open');
            // Get the message block containing the message
            while (!target.classList.contains('messageBlock') && !target.classList.contains('mLUserDiv') && target != document.body) {
                target = target.parentElement;
            }

            // Checking otherwise
            if (target.classList.contains('messageBlock') || target.classList.contains('mLUserDiv')) {
                rcMenu.classList.add('open');

                // Check what the menu is for and then build the menu so we can use the height
                if(target.classList.contains('messageBlock'))
                    buildMsgMenu(target, rcMenu);
                else if(target.classList.contains('mLUserDiv'))
                    buildUserMenu(target, rcMenu)

                // How far away from the bottom it will appear, in px
                let menuOffset = 10;

                // Check if the menu is overflowing
                if (y + rcMenu.clientHeight > window.innerHeight)
                    y = window.innerHeight - rcMenu.clientHeight - menuOffset;
                if (x + rcMenu.clientWidth > window.innerWidth)
                    x = window.innerWidth - rcMenu.clientWidth - menuOffset;

                rcMenu.style.left = `${x}px`;
                rcMenu.style.top = `${y}px`;
            } else { 
                rcMenu.classList.remove('open');
            }
        } else {
            rcMenu.classList.remove('open');
        }
    })
}

// Function to create the html for an option
function newOption(label, func, red = false, greyed, ...args) {
    let item = document.createElement('div');
    item.classList.add('rcOption');
    if (red)
        item.classList.add('red');

    // Check if the option is available
    if (greyed) {
        item.classList.add('greyed');
    } else {
        // Add the event listener to func
        item.addEventListener('mousedown', () => {
            func(...args)
        });
    }

    // Create the text
    let text = document.createElement('span');
    text.innerText = label;

    // Add text to the div
    item.appendChild(text);

    return item;
}

function newBreak(){
    let item = document.createElement('hr')
    item.classList.add('rcBreak')
    return item
}

// Build the menu for right clicking messages
function buildMsgMenu(target) {
    let message = selectedChan.messages.cache.get(target.id);
    let menu = document.getElementById('rcMenu');

    // Check permissions
    let editGreyed = message.author.id == bot.user.id ? false : true;
    let pinGreyed = selectedChan.members.get(bot.user.id).hasPermission('MANAGE_MESSAGES') ? false : true;
    let deleteGreyed = message.author.id == bot.user.id ? false : selectedChan.members.get(bot.user.id).hasPermission('MANAGE_MESSAGES') ? false : true;
    
    // Edit option
    let editOption = newOption('Edit Message', editMsg, false, editGreyed, target);
    menu.appendChild(editOption);

    // Pin option
    let pinOption = newOption(message.pinned ? 'Unpin Message' : 'Pin Message', pinMsg, false, pinGreyed, target.id, !message.pinned);
    menu.appendChild(pinOption);

    // Delete option
    let deleteOption = newOption('Delete Message', deleteMsg, true, deleteGreyed, target.id);
    menu.appendChild(deleteOption);
    
    // A break to separate the text to make it look nicer
    menu.append(newBreak())

    // Copy message link option
    let copyLinkOption = newOption('Copy Message Link', copyMessageLink, false, false, target.id, message);
    menu.appendChild(copyLinkOption);

    // Copy message ID option
    let copyIDOption = newOption('Copy Message ID', copyMessageID, false, false, target.id);
    menu.appendChild(copyIDOption);
}

// Build the user menu for right clicking users
function buildUserMenu(target) {
    let member = selectedGuild.members.cache.get(target.id);
    let menu = document.getElementById('rcMenu');
    
    // Mention option
    let mentionOption = newOption('Mention', mentionUser, false, false, target.id);
    menu.appendChild(mentionOption);

    // Copy user ID option
    let copyIDOption = newOption('Copy ID', copyUserID, false, false, target.id);
    menu.appendChild(copyIDOption);

    // Copy avatar link option
    let copyAvatarLinkOption = newOption('Copy Avatar Link', copyAvatarLink, false, false, member);
    menu.appendChild(copyAvatarLinkOption);

}