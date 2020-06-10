///  Methods available in json:
//   dropdown - special, options, default
//   slider - default
//   shortinput - placeholder
//   longinput - placeholder
//   image
//   checkbox - defaults
//   toggles - defaults

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


// Building popup menu
function togglePopup(parent, jsonObj) {
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
            let params = [];

            if (option.type == "dropdown") {
                params = [optionContainer, option.options, option.default, group, option];
            }

            addItem(option.type, ...params);
        });

        // Add the update button if necessary
        if (group.update) {
            let btn = document.createElement("button");
            btn.addEventListener("click", event => {
                let allDropdowns = Array.from(btn.parentElement.querySelectorAll(".dropdown")).map(x => `'${x.firstElementChild.firstElementChild.innerText}'`);

                let activityInput = 'null';
                if (btn.parentElement.querySelector(".activityInput"))
                    activityInput = `'${btn.parentElement.querySelector(".activityInput").value}'`;
                else 
                    activityInput = "null";

                let streamURL = 'null';
                if (btn.parentElement.querySelector(".streamURLInput"))
                    streamURL = `'${btn.parentElement.querySelector(".streamURLInput").value}'`;

                let funcString = group.call
                    .replace("DROPDOWNS", `${allDropdowns}`)
                    .replace("ACTIVITYNAME", activityInput)
                    .replace("STREAMURL", streamURL);

                //console.log(funcString);
                eval(funcString);
            });
            btn.classList.add("settingsUpdateBtn");
            btn.innerText = "Update";
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

// Shortinput box stuff
function genShortInput(parent, special = false, placeholder, customClass, id) {
    let input = document.createElement("input");
    input.classList.add(customClass);
    if (special)
        input.classList.add('special');
    input.placeholder = placeholder;

    parent.insertAdjacentElement('afterend', input);
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
                    eval(group.call.replace("DROPDOWNS", `'${option.innerText}'`));
                }

                // Remove all the other specials in this section first
                Array.from(dropdown.parentElement.querySelectorAll('.special')).forEach(special => {
                    dropdown.parentElement.removeChild(special);
                });

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


function setStatus(status) {
    console.log(status);
}

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
