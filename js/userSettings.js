///   Methods available in json:
//   dropdown - special, options, default
//   slider - default
//   shortinput - placeholder
//   longinput - placeholder
//   image
//   checkbox - default, label, value
//   toggles - default
//   separator - label

let toggleSettings = () => {
    let userCard = document.getElementById('userSettings');
    if (userCard.classList.length) {
        userCard.classList.toggle('userSettingsToggleOff');
    }
    userCard.classList.toggle('userSettingsToggle');

    let userPullOutIcon = document.getElementById('userPullOutIcon');
    if (userPullOutIcon.classList.length) {
        userPullOutIcon.classList.toggle('userSettingsFlipOff');
    }
    userPullOutIcon.classList.toggle('userSettingsFlip');
};

// Building main settings menu
function buildSettingsMenu(jsonObj) {
    let parent = document.getElementById("optionGroups");
    jsonObj.forEach(menuSection => {
        // Create and add the title
        let centerTag = document.createElement("center");
        let sectionTitle = document.createElement("h2");
        sectionTitle.innerText = menuSection.name;
        centerTag.appendChild(sectionTitle);
        parent.appendChild(centerTag);

        // Loop through each section
        menuSection.groups.forEach(group => {
            // Create the category container
            let categoryContainer = document.createElement("div");
            categoryContainer.classList.add("optionCategoryContainer");
            parent.appendChild(categoryContainer);

            // Span surrounding div
            let category = document.createElement("div");
            category.classList.add("optionCategory");
            categoryContainer.appendChild(category);

            let span = document.createElement("span");
            span.classList.add("settingLabel");
            span.innerText = group.name;
            category.appendChild(span);

            // Add the on click event listener
            category.addEventListener("click", event => {
    
                Array.from(document.getElementsByClassName("optionCategory")).forEach(category2 => {
                    if (category != category2) {
                        category2.classList.remove("toggledOn");
                    }
                });
    
                category.classList.toggle("toggledOn");
                if (category.classList.contains("toggledOn")) {
                    createPopup(category.parentElement,  group);
                } else {
                    category.parentElement.querySelector(".settingsPopup").remove();
                }
            });

        })
    })
}

// Building popup menu
function createPopup(parent, jsonObj) {
    // Remove all other popups before continuing
    let items = parent.parentElement.querySelectorAll(".settingsPopup");
    items.forEach(item => {
        item.parentElement.removeChild(item);
    });

    let popupContainer = document.createElement("div");
    popupContainer.classList.add("settingsPopup");

    // Loop through all the option sections
    jsonObj.settings.forEach(group => {
        let optionContainer = document.createElement("div");
        optionContainer.classList.add("option");
        popupContainer.appendChild(optionContainer);

        // The label for the settings group
        let label = document.createElement("label");
        label.innerText = group.name;
        optionContainer.appendChild(label);

        // Add the description
        if (group.description) {
            let descrip = document.createElement("p");
            descrip.classList.add("description");
            descrip.innerText = group.description;
            optionContainer.appendChild(descrip);
        }

        // Check what kind of option should be added
        group.options.forEach(option => {
            let params = [optionContainer];

            if (option.type == "dropdown") {
                params = params.concat([option.options], option.default, group, option);
            } else if (option.type == "shortinput") {
                params = params.concat(false, option.placeholder, option.class);
            } else if (option.type == "checkbox") {
                params = params.concat(option);
            } else if (option.type == "separator") {
                params = params.concat(option.label);
            }

            addItem(option.type, ...params);
        });

        // Add the update button if necessary
        if (group.update) {
            let btn = document.createElement("button");
            btn.addEventListener("click", event => {
                let allDropdowns = Array.from(btn.parentElement.querySelectorAll(".dropdown")).map(x => `'${x.firstElementChild.firstElementChild.innerText.replace(/\\*'/g, '\\\'')}'`);

                let activityInput = 'null';
                if (btn.parentElement.querySelector(".activityInput"))
                    activityInput = `'${btn.parentElement.querySelector(".activityInput").value.replace(/\\*'/g, '\\\'')}'`;
                else 
                    activityInput = "null";

                let streamURL = 'null';
                if (btn.parentElement.querySelector(".streamURLInput"))
                    streamURL = `'${btn.parentElement.querySelector(".streamURLInput").value.replace(/\\*'/g, '\\\'')}'`;

                let username = 'null';
                if (btn.parentElement.querySelector(".newNameInput"))
                    username = `'${btn.parentElement.querySelector(".newNameInput").value.replace(/\\*'/g, '\\\'')}'`

                let codes = [];
                if (btn.parentElement.querySelector('.checkbox'))
                    codes = Array.from(btn.parentElement.querySelectorAll('.checkbox.toggled')).map(e => parseInt(e.id, 16));

                let funcString = group.call
                    .replace("DROPDOWNS", `${allDropdowns}`)
                    .replace("ACTIVITYNAME", activityInput)
                    .replace("STREAMURL", streamURL)
                    .replace("USERNAME", username)
                    .replace("CODES", `[${codes.join(',')}]`);

                eval(funcString);
            });
            btn.classList.add("settingsUpdateBtn");
            btn.innerText = group.updateLabel || "Update";
            optionContainer.appendChild(btn);
        }

        // Add the hr element if it's not the last element
        let last = jsonObj.settings[jsonObj.settings.length - 1].name == group.name;
        if (!last) {
            let hr = document.createElement("hr");
            popupContainer.appendChild(hr);
        }
    });

    parent.appendChild(popupContainer);
}

// Check which option should be added, add it
function addItem(method, ...args) {
    if (method == "dropdown") {
        genDropDown(...args);
    } else if (method == "shortinput") {
        genShortInput(...args);
    } else if (method == "checkbox") {
        genCheckbox(...args);
    } else if (method == "separator") {
        genSeparator(...args);
    }
}

// Toggling the special boxes
function handleSpecials(item, group, option, parent) {
    // Check for special options
    if (option.special) {

        option.special.forEach(special => {
            if (option.options.indexOf(item) == special.id) {

                special.needs.forEach(object => {
                    addItem(object.type, parent, true, object.placeholder, object.class, special.id);
                });
            }
        });
    }
}

// Separator generation
function genSeparator(parent, label) {
    let text = document.createElement('p');
    text.innerText = label;
    text.classList.add('settingsSeparator');
    parent.appendChild(text);
}

// Checkbox stuff
function genCheckbox(parent, option) {
    let container = document.createElement("div");
    container.classList.add('checkBoxContainer');
    parent.appendChild(container);

    // Create label
    let label = document.createElement('span');
    label.innerText = option.label;
    container.appendChild(label);

    // Create the actual checkbox
    let checkbox = document.createElement('div');
    checkbox.classList.add('checkbox');
    if (option.default)
        checkbox.classList.add('toggled');
    checkbox.id = option.value;
    container.appendChild(checkbox);

    // Event listener
    container.addEventListener('click', e => {
        checkbox.classList.toggle('toggled');
    })
}

// Shortinput box stuff
function genShortInput(parent, special = false, placeholder, customClass, id) {
    let input = document.createElement("input");
    input.classList.add(customClass);
    input.placeholder = placeholder;

    if (special) {
        input.classList.add('special');
        parent.insertAdjacentElement('afterend', input);
    } else {
        parent.appendChild(input);
    }
}

// Dropdown stuff
function dropSelect(option) {
    let text = option.innerText;
    option.parentElement.parentElement.firstElementChild.firstElementChild.innerText = text;

    Array.from(option.parentElement.children).forEach(opt => {
        opt.classList.remove('selectedOption');
    });
    option.classList.toggle('selectedOption');
}

// Generate the custom dropdown
function genDropDown(parent, options, defaultOpt = 0, group, optionObj) {
    let defaultOption = options[defaultOpt];

    // Parent container
    let dropdown = document.createElement("div");
    dropdown.classList.add("dropdown");
    dropdown.tabIndex = "0";
    dropdown.addEventListener("click", event => {
        dropdown.classList.toggle('openDrop');
    });
    dropdown.addEventListener("focusout", event => {
        if (!dropdown.contains(event.relatedTarget))
            dropdown.classList.remove("openDrop");
    });


    // Always-visible container
    let dropdownDisplay = document.createElement("div");
    dropdownDisplay.classList.add("dropdownDisplay");
    dropdown.appendChild(dropdownDisplay);

    // Dropdown selected item text
    let dropdownText = document.createElement("span");
    dropdownText.classList.add("dropDownTitle");
    dropdownText.innerText = defaultOption;
    dropdownDisplay.appendChild(dropdownText);

    // SVG icon
    let icon = document.createElement("img");
    icon.classList.add("dropdownIcon");
    icon.src = "resources/icons/pullOut.svg";
    dropdownDisplay.appendChild(icon);


    // Dropdown children container
    let childContainer = document.createElement("div");
    childContainer.classList.add("dropdownChildren");
    dropdown.appendChild(childContainer);

    // Add all the options
    options.forEach(title => {
        let option = document.createElement("option");
        option.addEventListener("click", event => {
            if (!option.classList.contains("disabled")) {
                dropSelect(option);

                // Call the function only if there will not be an update button
                if (!group.update) {
                    eval(group.call.replace("DROPDOWNS", `'${option.innerText.replace(/\\|/g, c => '\\' + c)}'`));
                }

                // Remove all the other specials in this section first
                let target = dropdown.nextElementSibling;
                if (target) {
                    while (target.classList.contains("special")) {
                        let next = target.nextElementSibling;
                        dropdown.parentElement.removeChild(target);
                        target = next;
                    }
                }

                handleSpecials(option.innerText, group, optionObj, dropdown);
            }
            
            // Handle exceptions like if the status is 'invisible'
            if (optionObj.exception) {
                let target = dropdown;
                // Select the nth item in the DOM
                for (let i=0;i<optionObj.exception.with;i++) {
                    target = target.nextElementSibling;
                    // Don't want to select a special
                    while (target.classList.contains('special')) {
                        target = target.nextElementSibling;
                    }
                }

                let childCount = target.querySelector('.dropdownChildren').childElementCount;
                let child = target.querySelector('.dropdownChildren').firstElementChild;

                if (optionObj.exception.options[option.innerText]) {

                    for (let i=0;i<childCount;i++) {
                        if (optionObj.exception.options[option.innerText].includes(i)) {
                            child.classList.add("disabled");
                            if (child.classList.contains("selectedOption")) {
                                child.classList.remove("selectedOption");
                                target.querySelector('.dropdownChildren').firstElementChild.click();
                                target.click();
                            }
                        } else {
                            child.classList.remove("disabled");
                        }
                        child = child.nextElementSibling;
                    }
                } else {
                    for (let i=0;i<childCount;i++) {
                        child.classList.remove("disabled");
                        child = child.nextElementSibling;
                    }
                }
            }
        });
        option.innerText = title;

        if (title == defaultOption) {
            option.classList.add("selectedOption");
        }

        childContainer.appendChild(option);
    });

    // Finally, add everything
    parent.appendChild(dropdown);
}


//     Custom functions down here
// Set the activity
function setActivity(dropdowns, activityName, streamurl) {
    let status = dropdowns[0];
    let activity = dropdowns[1];

    if (status.includes("Not")) {
        status = 'dnd';
    }

    if (activity == "Streaming")
        bot.user.setPresence({ 
            game: { 
                name: activityName, 
                type: activity.toUpperCase(), 
                url: streamurl 
            }, 
            status: status.toLowerCase()
        });
    else
        bot.user.setPresence({ 
            game: { 
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