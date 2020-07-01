// Guilds that are in the guild list
let cachedGuilds = [];

function addGuilds() {
    // Get the first guild in the list if there is any
    let lastGuild = cachedGuilds.length ? cachedGuilds[0][1] : null;
    bot.guilds.cache.forEach(g => {
        let img;
        // If there is no icon url for the server, create the letter icon
        if (g.iconURL() === null) {
            img = document.createElement('div');

            img.style.backgroundColor = '#2F3136';
            img.style.marginBottom = '4px';

            let abrev = document.createElement('p');
            abrev.id = 'guildAbrev';
            abrev.appendChild(document.createTextNode(g.nameAcronym));
            img.appendChild(abrev);
        } else {
            // The guild has an icon, create the image
            img = document.createElement('img');

            let ico;
            ico = `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.webp?size=64`;
            img.src = ico;

            img.alt = g.name;
            img.height = '40';
            img.width = '40';
        }

        // Styling for both image and letter icons
        img.style.height = '40px';
        img.style.width = '40px';
        img.classList.add("guild-icon");
        img.id = g.id;

        // Add the events for the guild icons
        img.onclick = () => {
            guildSelect(g, img);
            selectedGuild = g;
        };
        
        // Creating the container for the icon
        let guildIcon = document.createElement('div');
        // Creating the container for the guilds name
        let guildNameContainer = document.createElement('div');
        // Creating the text element which will display the name
        let guildName = document.createElement('p');

        // Adding classes to elements
        guildNameContainer.classList.add('guildNameContainer');
        guildName.classList.add('guildName');
        guildIcon.classList.add('guildIconDiv');

        // Setting the name
        guildName.innerText = g.name;
        // Appending the name to the name container
        guildNameContainer.appendChild(guildName);
        // Appending the image and the container in reverse order
        // so it could be manipulated with in css
        guildIcon.appendChild(img);
        guildIcon.appendChild(guildNameContainer);

        // Add image to the list of guilds
        if(lastGuild == null || lastGuild.parentElement.lastElementChild == lastGuild){
            // Append the guild to the last spot
            document.getElementById('guild-list').appendChild(guildIcon);
            cachedGuilds.push([g.id, guildIcon]);
        } else if (!cachedGuilds.find(e => e[0] == g.id)) {
            // Insert the guild in the respectful place
            document.getElementById('guild-list').insertBefore(guildIcon, lastGuild.nextSibling);
            cachedGuilds.push([g.id, guildIcon]);
        }
        // Check if the guild is in the cache just in case
        if(cachedGuilds.find(e => e[0] == g.id)){
            // Get this guild out of the cache and store it 
            lastGuild = cachedGuilds.find(e => e[0] == g.id)[1];
        }

        // Changing the width of the name container so it fits the text
        guildNameContainer.style.width = guildName.getBoundingClientRect().width + 8 + 'px';
    });
}

// Remove the guild
function removeGuild(g){
    // Find the guild in the cache
    let guild = cachedGuilds.find(e => e[0] == g.id);
    // If the guild ins't in the cache then cancel the rest
    if (!guild) return;
    // Get the guilds respected element
    let guildElement = guild[1];
    // If the guild is selected then hide the guild indicator and set all the needed variables to undefined
    if(g.id == selectedGuild.id){
        document.getElementById('guildIndicator').style.display = 'none';
        selectedGuild = undefined;
        if (selectedChan.guild.deleted){
            selectedChan = undefined;
            selectedChatDiv = undefined;
        }
    }
    // Remove the guild element from the guild list
    guildElement.parentElement.removeChild(guildElement);
    // Remove the guild out of the cache
    cachedGuilds.splice(cachedGuilds.indexOf(guildElement));
}