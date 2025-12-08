# How to Write LiveBot Scripts
A reference guide for extending and customizing LiveBot using standalone JavaScript modules.

LiveBot supports user-created scripts that can modify the UI, automate moderation tasks, add developer tools, and enhance the overall client experience. This guide explains how to write clean, safe, and maintainable scripts that integrate smoothly with LiveBot’s environment.

---

## ✅ 1. Overview
LiveBot loads all `.js` files placed inside the `/scripts` directory.  
Each script runs in the LiveBot renderer process and has access to:

- The Discord.js client (`window.bot`)
- The DOM of the LiveBot UI
- Standard browser APIs (MutationObserver, fetch, localStorage, etc.)
- Node.js modules (via `require()`)

Scripts are **modular**, **self-contained**, and **do not require modifying LiveBot’s core files**.

---

## ✅ 2. Basic Script Structure

A typical LiveBot script looks like this:

```js
(function() {
    console.log("My script loaded!");

    // Your logic here
})();
```

Wrapping your code in an IIFE:
- Prevents global namespace pollution
- Ensures your script runs immediately
- Keeps variables isolated and safe

---

## ✅ 3. Accessing the Discord Client

LiveBot exposes the Discord.js client as:

```js
window.bot
```

Example:

```js
const guilds = window.bot.guilds.cache;
console.log("Loaded guilds:", guilds.map(g => g.name));
```

This gives you full access to:

- Guilds
- Channels
- Roles
- Members
- Permissions
- Events

LiveBot typically uses Discord.js v14, so permission flags follow:

```js
PermissionsBitField.Flags.SendMessages
PermissionsBitField.Flags.CreateInstantInvite
```

---

## ✅ 4. Detecting the Current Guild

LiveBot does not expose a global “current guild” variable.  
The most reliable method is to detect the **selected channel** in the UI and resolve its guild:

```js
function getCurrentGuild() {
    const selected = document.querySelector(".channel.selectedChan");
    if (!selected) return null;

    const channelId = selected.id;

    return window.bot.guilds.cache.find(g =>
        g.channels.cache.has(channelId)
    );
}
```

This works across all LiveBot versions.

---

## ✅ 5. Watching for UI Changes

LiveBot’s UI re-renders frequently.  
To safely inject buttons, panels, or UI elements, use a `MutationObserver`:

```js
new MutationObserver(() => {
    const list = document.getElementById("channel-list");
    if (!list) return;

    if (!document.getElementById("myButton")) {
        const btn = document.createElement("button");
        btn.id = "myButton";
        btn.textContent = "Click Me";
        list.prepend(btn);
    }
}).observe(document.body, { childList: true, subtree: true });
```

This ensures your UI elements persist even after LiveBot refreshes the DOM.

---

## ✅ 6. Editing Permissions (Discord.js v14)

Example: Lock all channels for @everyone:

```js
const { PermissionsBitField } = require("discord.js");

async function lockAllChannels(guild) {
    const everyone = guild.roles.everyone;

    guild.channels.cache.forEach(async channel => {
        try {
            await channel.permissionOverwrites.edit(everyone, {
                [PermissionsBitField.Flags.SendMessages]: false
            });
        } catch (err) {
            console.error("Failed to lock:", channel.name, err);
        }
    });
}
```

---

## ✅ 7. Adding Custom UI Panels

You can create floating panels, toolbars, or menus:

```js
function createPanel() {
    if (document.getElementById("myPanel")) return;

    const panel = document.createElement("div");
    panel.id = "myPanel";
    panel.style.cssText = `
        position: absolute;
        top: 80px;
        left: 10px;
        width: 250px;
        background: #2f3136;
        padding: 12px;
        border-radius: 8px;
        color: white;
        z-index: 9999;
    `;

    panel.innerHTML = `
        <h3>My Tools</h3>
        <button id="toolBtn">Run Tool</button>
    `;

    document.body.appendChild(panel);
}
```

---

## ✅ 8. Best Practices

### ✅ Keep scripts modular  
Avoid modifying LiveBot’s core files.  
Scripts should be drop‑in and reversible.

### ✅ Avoid global variables  
Use IIFEs or namespaces.

### ✅ Use MutationObserver for UI injection  
LiveBot re-renders often.

### ✅ Fail gracefully  
If a guild or channel isn’t detected, log a warning instead of throwing.

### ✅ Document your script  
Include a header explaining what it does.

### ✅ Test on multiple servers  
Different guild structures help catch edge cases.

---

## ✅ 9. Example: A Complete Mini Script

```js
(function() {
    const { PermissionsBitField } = require("discord.js");

    function getGuild() {
        const selected = document.querySelector(".channel.selectedChan");
        if (!selected) return null;
        return window.bot.guilds.cache.find(g => g.channels.cache.has(selected.id));
    }

    function lock() {
        const guild = getGuild();
        if (!guild) return console.warn("No guild detected");

        const everyone = guild.roles.everyone;

        guild.channels.cache.forEach(ch => {
            ch.permissionOverwrites.edit(everyone, {
                [PermissionsBitField.Flags.SendMessages]: false
            });
        });
    }

    new MutationObserver(() => {
        const list = document.getElementById("channel-list");
        if (!list || document.getElementById("lockBtn")) return;

        const btn = document.createElement("button");
        btn.id = "lockBtn";
        btn.textContent = "Lock All Channels";
        btn.style.cssText = "width:100%;padding:8px;margin-bottom:8px;";
        btn.onclick = lock;

        list.prepend(btn);
    }).observe(document.body, { childList: true, subtree: true });
})();
```

---

## ✅ 10. Contributing Your Scripts

If you’d like to contribute your scripts to the official LiveBot repository:

1. Fork the repo  
2. Add your script to `/scripts`  
3. Add documentation to this file if needed  
4. Submit a pull request  

Please ensure your scripts are:

- Safe  
- Self-contained  
- Well-documented  
- Compatible with Discord.js v14  

---

## ✅ Final Notes

LiveBot scripting is powerful — you can build:

- Moderation tools  
- Developer utilities  
- UI enhancements  
- Automation systems  
- Quality‑of‑life features  

This guide will continue to evolve as the community contributes new patterns and best practices.

If you have improvements, feel free to submit a PR!
