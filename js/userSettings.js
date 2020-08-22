///   Methods available in json:
//   dropdown - special, options, default
//   slider - default
//   shortinput - placeholder
//   longinput - placeholder
//   image
//   checkbox - default, label, value
//   toggles - default
//   separator - label

let settings = {
    // LiveBot database
    get token() { return global.bot ? global.bot.token : ''},
    get tokens() { return this.settings.tokens},
    get defaultToken() { return this.settings.defaultToken},
    get lastGuild() { return this.tokenSettings.lastGuild},
    get guilds() { return this.tokenSettings.guilds},

    get settings() {
        let settings = JSON.parse(localStorage.getItem('LiveBot-Settings'));
        if(settings == null) settings = {};
        if(settings.defaultToken == null) settings.defaultToken = '';
        if(typeof settings.tokens != 'array') settings.tokens = [];

        if(this.token != '' && !settings.tokens.includes(this.token) ){
            settings.tokens.push(this.token);
        }

        if(settings.tokenSettings == null) settings.tokenSettings = {};
        Object.keys(settings.tokenSettings).forEach(token => !settings.tokens.includes(token) ? settings.tokens.push(token) : undefined);

        return settings;
    },
    get tokenSettings() {
        let tokenSettings = (this.settings.tokenSettings)[this.token];

        if(tokenSettings == null) tokenSettings = {};
        if(tokenSettings.guilds == null) tokenSettings.guilds = {};
        if(tokenSettings.lastGuild == null) tokenSettings.lastGuild = '';
        if(tokenSettings.teamUser == null) tokenSettings.teamUser = '';

        return tokenSettings;
    },

    set defaultToken(token) { this.settings = {defaultToken: token}},
    set lastGuild(guild) { this.tokenSettings = {'lastGuild': guild} },
    set guilds(guild) { this.tokenSettings = {'guilds': {...this.guilds, ...guild}}},

    set settings(args) {
        let settings = this.settings;
        settings = {...settings, ...args};
        localStorage.setItem('LiveBot-Settings', JSON.stringify(settings));
    },

    set rawSettings(args) {
        let settings = {...args};
        localStorage.setItem('LiveBot-Settings', JSON.stringify(settings));
    },

    set tokenSettings(args) {
        let settings = this.settings;
        let tokenSettings = this.tokenSettings;

        if (settings.tokenSettings == null) settings.tokenSettings = {};

        settings.tokenSettings[this.token] = {...tokenSettings, ...args};
        this.settings = {...settings};
    },

    set rawTokenSettings(args) {
        let settings = this.settings;

        if (settings.tokenSettings == null) settings.tokenSettings = {};

        settings.tokenSettings[this.token] = {...args};
        this.settings = {...settings};
    },

    // I hate this function with all my soul
    delete: function (object, path = ''){
        let recursive = (settingsO, p = '') => {
            let settings = {...settingsO};
            
            let args;
            if(p.length)
                args = p.split('|');
            else
                args = [];

            if (path.split('|').length <= p.split('|').length){
                for(let arg of args){
                    settings = settings[arg];
                }
            }
            for(let setting in settings){
                if (JSON.stringify(settings[setting]) == JSON.stringify(object) && path.split('|').length <= p.split('|').length){
                    let set = {...settings};
                    delete set[setting];
                    while(args.length){
                        settings = {...settingsO};
                        for(let arg of args){
                            if(args.indexOf(arg) == args.length-1){
                                settings[arg] = {...set};
                                set = {...settings};
                            }
                            else
                                settings = settings[arg];
                        }
                        args.pop();
                    }
                    settings = {...set};
                    return settings;
                }else
                    if(['object', 'array'].includes(typeof settings)){
                        let ret = recursive(settingsO, p.length ? p + '|' + setting : setting);
                        if(ret){
                            return [ret, settingsO];
                        }
                    }else{
                        continue;
                    }
            }
        }
        let ret = recursive(this.settings, path);
        if (ret){
            this.rawSettings = ret[0];
            return {finished: true, value: ret[0], old: ret[1]};
        }
        else{
            return {finished: false, value: undefined, old: undefined};
        }
    },

    // Runtime settings
    options: {
        settingsOpened: false,
        splash: true
    },

    // Settings function
    functions: {
        getGroup: (groupName) => {
            let element = Array.from(document.getElementsByClassName('settingLabel')).find(e => e.innerText == groupName).parentElement
            let groups = ['Presence', 'User', 'Scripts', 'Servers']
            let group = jsonSettings[0]["groups"][groups.indexOf(groupName)];
            return [element, group]
        },
        openSettings: (groupName) => {
            if (!settings.options.settingsOpened) {
                toggleSettings();
                let [element, group] = settings.functions.getGroup(groupName)
                setTimeout(() => {openPopup(element, group)}, 600);
            }
        },
        closeSettings: (groupName) => {
            if (settings.options.settingsOpened) {
                toggleSettings();
            }
        },
        closePopups: () => {
            // Remove all popups
            let items = document.getElementById("optionGroups").parentElement.querySelectorAll(".settingsPopup");
            items.forEach(item => {
                if(!item.parentElement) return;
                item.parentElement.removeChild(item);
            });
        }
    }
}

let toggleSettings = () => {
    if(settings.options.settingsOpened){
        settings.functions.closePopups();
    }
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
    settings.options.settingsOpened = !settings.options.settingsOpened;
};

// A function to open the popup so it can be used outside of the click event
// I could have just made it click the element but this is more elegant imo
function openPopup(category, group){
    Array.from(document.getElementsByClassName("optionCategory")).forEach(category2 => {
        if (category != category2) {
            category2.classList.remove("toggledOn");
        }
    });

    category.classList.toggle("toggledOn");
    if (category.classList.contains("toggledOn")) {
        createPopup(category.parentElement,  group);
    } else {
        let settingsPopout = category.parentElement.querySelector(".settingsPopup")
        if(settingsPopout)
            settingsPopout.remove();
    }
}

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

            // Add the onclick event listener
            category.onclick = () => {
                // Open the popup menu
                if(group.settings)
                    openPopup(category, group)
                else // If it's still in developement then don't open the menu but flash red
                    category.animate(animations.flashTextRed, {duration: 350});
            };

        })
    })
}

// Building popup menu
function createPopup(parent, jsonObj) {
    // Remove all other popups before continuing
    settings.functions.closePopups();

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
                params = params.concat(false, option.placeholder, option.class, option.id);
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

                let activityInput = '\'\'';
                if (btn.parentElement.querySelector(".activityInput"))
                    activityInput = `'${btn.parentElement.querySelector(".activityInput").value.replace(/\\*'/g, '\\\'')}'`;
                else 
                    activityInput = "\'\'";

                let streamURL = '\'\'';
                if (btn.parentElement.querySelector(".streamURLInput"))
                    streamURL = `'${btn.parentElement.querySelector(".streamURLInput").value.replace(/\\*'/g, '\\\'')}'`;

                let username = '\'\'';
                if (btn.parentElement.querySelector(".newNameInput"))
                    username = `'${btn.parentElement.querySelector(".newNameInput").value.replace(/\\*'/g, '\\\'')}'`

                let codes = [];
                if (btn.parentElement.querySelector('.checkbox'))
                    codes = Array.from(btn.parentElement.querySelectorAll('.checkbox.toggled')).map(e => parseInt(e.id, 16));

                let token = '\'\'';
                if (btn.parentElement.querySelector('.tokenbox'))
                    token = `'${btn.parentElement.querySelector('.tokenbox').value.replace(/\\*'/g, '\\\'')}'`

                let funcString = group.call
                    .replace("DROPDOWNS", `${allDropdowns}`)
                    .replace("ACTIVITYNAME", activityInput)
                    .replace("STREAMURL", streamURL)
                    .replace("USERNAME", username)
                    .replace("CODES", `[${codes.join(',')}]`)
                    .replace("TOKEN", token);

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
    // Create the container
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
    
    // Create the checkmark svg for inside the checkbox
    let checkmark = document.createElement('img');
    checkmark.src = 'resources/icons/checkmark.svg';
    checkbox.appendChild(checkmark);

    // Event listener
    container.addEventListener('click', e => {
        checkbox.classList.toggle('toggled');
    })
}

// Generate the token box
// function genTokenBox(parent, placeholder, customClass) {
//     // This is basically just a shortinput, but modified to have an id, event listener, etc

//     // Create the short input
//     genShortInput()
    
//     document.getElementById("tokenbox")
//         .addEventListener("keydown", event => {
//             if (event.keyCode === 13) {
//                 unloadAllScripts();
//                 setToken();
//             }
//         });
// }

// Shortinput box stuff
function genShortInput(parent, special = false, placeholder, customClass, id = undefined) {
    let input = document.createElement("input");
    input.classList.add(customClass);
    if (id != undefined && !special)
        input.id = id;
    input.placeholder = placeholder;

    if (special) {
        input.classList.add('special');
        parent.insertAdjacentElement('afterend', input);
    } else {
        parent.appendChild(input);
    }

    // Create the token event listeners
    if (id == 'tokenbox') {
        input.type = "password";
        input.addEventListener("keydown", event => {
                if (event.keyCode === 13)
                    showSplashScreen(input.value);
            });
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