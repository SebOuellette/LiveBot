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

"use strict";


// This file handles all menus that appear out of nowhere when an element is clicked


function addDocListener() {
    document.addEventListener('keydown', (e) => {
        // When ESC is pressed
        if (e.key == 27) {
            // Safe check so there is only one DOM to edit messages
            checkEditDoms();
        }
    });

    document.addEventListener('mousedown', async (e) => {
        // Set the target and whatnot
        e = e || window.event;
        let target = e.target || e.srcElement;

        // X and Y position of the click
        let x = e.clientX;
        let y = e.clientY;

        let rcMenu = document.getElementById('rcMenu');
        if (e.button == 0) {
            // Left click
            // Close the right click menus
            rcMenu.classList.remove('open');

            // Find if a distant child of certain parent
            let domElements = ['mLOuterDiv', 'memberMenu'];
            // If the element clicked is not in domElements, recurse to the parent
            // The purpose of this is to check that anywhere inside of an element, even one of the children, is clicked
            while (
                !domElements.some((r) => target.classList.contains(r)) &&
                target != document.body
            ) {
                target = target.parentElement;
            }

            // If the element clicked is not the member menu, delete the member menu
            if (!target.classList.contains(domElements[1])) {
                let element = document.getElementsByClassName('memberMenu')[0];
                if (element) element.parentElement.removeChild(element);
            }
            if (target == document.body) return;

            // If the element clicked is a member on the member list, build the member menu
            if (target.classList.contains(domElements[0])) {
                buildMemberMenu(target);
            }

            // This is not in the domElements, because it has no child elements to check for
            if (target.id == "embedBuilderIcon") {
                buildEmbedMenu();
            }

            // If the element clicked is not the embed builder menu, delete the embed builder menu
            
        } else if (e.button == 2) {
            // Right click
            // Clear the menu (It's only needed here because you only open it when you right click)
            rcMenu.innerHTML = '';

            if (
                e.target.classList.contains('rcOption') ||
                e.target.parentElement.classList.contains('rcOption')
            ) {
                return rcMenu.classList.remove('open');
            }
            // Get the message block containing the message
            let domElements = [
                'messageBlock',
                'mLUserDiv',
                'messageUsername',
                'messageImg',
                'dmChannel',
            ];
            // Find if a distant child of certain parent
            while (
                !domElements.some((r) => target.classList.contains(r)) &&
                target != document.body
            ) {
                target = target.parentElement;
            }
            // Check if the target is the body and if it is then return
            if (target == document.body) return rcMenu.classList.remove('open');

            // Variable to keep track of if the menu should be opened
            let open;
            // Check what the menu is for and then build the menu so we can use the height
            if (target.classList.contains(domElements[0]))
                open = await buildMsgMenu(target, rcMenu);
            else if (
                domElements.splice(1).some((r) => target.classList.contains(r))
            )
                open = await buildUserMenu(target, rcMenu);

            // Check if it should be opened and if it shoudn't close it just in case
            if (!open) return rcMenu.classList.remove('open');

            // Open the menu if it's ready
            rcMenu.classList.add('open');

            // How far away from the bottom it will appear, in px
            let menuOffset = 10;

            // Check if the menu is overflowing
            if (y + rcMenu.clientHeight > window.innerHeight)
                y = window.innerHeight - rcMenu.clientHeight - menuOffset;
            if (x + rcMenu.clientWidth > window.innerWidth)
                x = x - rcMenu.clientWidth;

            rcMenu.style.left = `${x}px`;
            rcMenu.style.top = `${y}px`;
        } else if (e.button == 1) {
        } // Check if it's middle click since you don't need to remove it if it is
        else rcMenu.classList.remove('open');
    });
}

// Function to create the html for an option
function newOption(label, func, red = false, greyed, ...args) {
    let item = document.createElement('div');
    item.classList.add('rcOption');
    if (red) item.classList.add('red');

    // Check if the option is available
    if (greyed) {
        item.classList.add('greyed');
    } else {
        // Add the event listener to func
        item.addEventListener('mousedown', () => {
            func(...args);
        });
    }

    // Create the text
    let text = document.createElement('span');
    text.innerText = label;

    // Add text to the div
    item.appendChild(text);

    return item;
}

function newBreak() {
    let item = document.createElement('hr');
    item.classList.add('rcBreak');
    return item;
}

// Build the menu for right clicking messages
function buildMsgMenu(target) {
    let message = selectedChan.messages.cache.get(target.id);
    let menu = document.getElementById('rcMenu');

    // Check permissions
    let editGreyed = message.author.id == bot.user.id ? false : true;
    let pinGreyed = selectedChan.members
        ? selectedChan.members.get(bot.user.id).hasPermission('MANAGE_MESSAGES')
            ? false
            : true
        : false;
    let deleteGreyed =
        message.author.id == bot.user.id
            ? false
            : selectedChan.members
            ? selectedChan.members
                  .get(bot.user.id)
                  .hasPermission('MANAGE_MESSAGES')
                ? false
                : true
            : true;

    // Edit option
    let editOption = newOption(
        'Edit Message',
        editMsg,
        false,
        editGreyed,
        target
    );
    menu.appendChild(editOption);

    // Pin option
    let pinOption = newOption(
        message.pinned ? 'Unpin Message' : 'Pin Message',
        pinMsg,
        false,
        pinGreyed,
        target.id,
        !message.pinned
    );
    menu.appendChild(pinOption);

    // Delete option
    let deleteOption = newOption(
        'Delete Message',
        deleteMsg,
        true,
        deleteGreyed,
        target.id
    );
    menu.appendChild(deleteOption);

    // A break to separate the text to make it look nicer
    menu.append(newBreak());

    // Copy message link option
    let copyLinkOption = newOption(
        'Copy Message Link',
        copyMessageLink,
        false,
        false,
        target.id,
        message
    );
    menu.appendChild(copyLinkOption);

    // Copy message ID option
    let copyIDOption = newOption(
        'Copy Message ID',
        copyMessageID,
        false,
        false,
        target.id
    );
    menu.appendChild(copyIDOption);

    return true;
}

// Build the user menu for right clicking users
function buildUserMenu(target) {
    let guild = !!target.id;
    let dm = target.parentElement.parentElement.classList.contains('dms');
    let id = target.id
        ? target.id
        : target.parentElement.parentElement.classList[1];

    if (target.classList.contains('dmChannel')) {
        guild = false;
        dm = true;
    }

    let member = guild
        ? selectedGuild.members.cache.get(id)
        : !dm
        ? selectedChan.guild.members.cache.get(id)
        : bot.users.cache.get(id);
    if (!member) return false;
    let menu = document.getElementById('rcMenu');

    // Check if it's not dm's
    if (!dm) {
        // Get the user rather than the member
        let user = member.user ? member.user : member;
        // Check if the user isn't a bot and that it's not you (Just in case there's ever user support)
        if (!user.bot && bot.user != user) {
            // DM option
            let dmOption = newOption('Message', dmUser, false, false, user);
            menu.appendChild(dmOption);
            // A break to separate the text to make it look nicer
            menu.append(newBreak());
        }
    }

    // Mention option
    let mentionOption = newOption('Mention', mentionUser, false, false, id);
    menu.appendChild(mentionOption);

    // Copy user ID option
    let copyIDOption = newOption('Copy ID', copyUserID, false, false, id);
    menu.appendChild(copyIDOption);

    // Copy avatar link option
    let copyAvatarLinkOption = newOption(
        'Copy Avatar Link',
        copyAvatarLink,
        false,
        false,
        member
    );
    menu.appendChild(copyAvatarLinkOption);

    return true;
}
