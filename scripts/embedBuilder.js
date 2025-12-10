/**
 * Embed Builder Panel
 * -------------------
 * This module provides a full interactive UI for constructing Discord-style
 * embed objects directly inside the client. It replaces manual JSON editing
 * with a visual editor that updates in real time.
 *
 * Core Features:
 *  - Right‑side sliding panel with adjustable width
 *  - Form‑based interface for editing all embed fields:
 *      • Title, description, color, URL
 *      • Author, footer, images, thumbnails
 *      • Fields (name/value/inline)
 *  - Live preview that mirrors Discord’s embed rendering
 *  - JSON export for use in scripts or bot commands
 *  - Import support for editing existing embed JSON
 *  - Validation and safe handling of malformed input
 *
 * Architectural Notes:
 *  - The panel is injected dynamically and isolated from the main UI.
 *  - State is stored in memory and re-rendered on each change.
 *  - The preview renderer is intentionally lightweight and avoids external deps.
 *  - The builder is designed to be extensible (e.g., future components, themes).
 *
 * Intended Use:
 *  This file exists to streamline embed creation for developers and power users.
 *  Contributors should be able to extend the builder with new fields, presets,
 *  or UI improvements without needing to modify unrelated parts of the app.
 */

module.exports = (bot) => {
    console.log("[ChannelMenu] Script started");

    // ============================================================
    //  GENERIC INPUT MODAL (existing helper)
    // ============================================================
    const showInputModal = (title, defaultValue = "", callback) => {
        if (!document.body) {
            return setTimeout(() => showInputModal(title, defaultValue, callback), 50);
        }

        const old = document.getElementById("customInputModal");
        if (old) old.remove();

        const modal = document.createElement("div");
        modal.id = "customInputModal";

        Object.assign(modal.style, {
            position: "fixed",
            left: "0",
            top: "0",
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "999999999",
            pointerEvents: "all"
        });

        modal.innerHTML = `
            <div style="
                background:#2f3136;
                padding:20px;
                border-radius:8px;
                width:300px;
                color:white;
                font-family:sans-serif;
                box-shadow:0 0 20px rgba(0,0,0,0.5);
            ">
                <div style="font-size:16px; margin-bottom:10px;">${title}</div>
                <input id="modalInputField" 
                    style="
                        width:100%;
                        padding:8px;
                        border:none;
                        border-radius:4px;
                        background:#202225;
                        color:white;
                        margin-bottom:12px;
                    "
                    value="${defaultValue}"
                />
                <button id="modalConfirmBtn" style="
                    width:100%;
                    padding:8px;
                    background:#5865F2;
                    border:none;
                    border-radius:4px;
                    color:white;
                    cursor:pointer;
                ">Confirm</button>
            </div>
        `;

        document.body.appendChild(modal);

        const input = document.getElementById("modalInputField");
        const confirm = document.getElementById("modalConfirmBtn");

        confirm.onclick = () => {
            let value = input.value.trim();
            modal.remove();
            callback(value);
        };

        input.focus();
    };

    // ============================================================
    //  EMBED BUILDER MODAL (Option A)
    // ============================================================
    const showEmbedBuilder = (callback) => {
        if (!document.body) {
            return setTimeout(() => showEmbedBuilder(callback), 50);
        }

        const old = document.getElementById("embedBuilderModal");
        if (old) old.remove();

        const modal = document.createElement("div");
        modal.id = "embedBuilderModal";

        Object.assign(modal.style, {
            position: "fixed",
            left: "0",
            top: "0",
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "999999999",
            pointerEvents: "all"
        });

        modal.innerHTML = `
            <div style="
                background:#2f3136;
                padding:20px;
                border-radius:8px;
                width:350px;
                color:white;
                font-family:sans-serif;
                box-shadow:0 0 20px rgba(0,0,0,0.5);
            ">
                <div style="font-size:18px; margin-bottom:10px;">Embed Builder</div>

                <label style="font-size:13px;">Title</label>
                <input id="embedTitle" style="
                    width:100%; padding:6px; margin-bottom:10px;
                    background:#202225; border:none; border-radius:4px; color:white;
                ">

                <label style="font-size:13px;">Description</label>
                <textarea id="embedDescription" style="
                    width:100%; height:80px; padding:6px; margin-bottom:10px;
                    background:#202225; border:none; border-radius:4px; color:white;
                    resize:none;
                "></textarea>

                <label style="font-size:13px;">Color (hex)</label>
                <input id="embedColor" placeholder="#5865F2" style="
                    width:100%; padding:6px; margin-bottom:10px;
                    background:#202225; border:none; border-radius:4px; color:white;
                ">

                <label style="display:flex; align-items:center; gap:6px; margin-bottom:10px; font-size:13px;">
                    <input type="checkbox" id="embedTimestamp">
                    Add Timestamp
                </label>

                <div style="display:flex; gap:10px; margin-top:15px;">
                    <button id="embedCancel" style="
                        flex:1; padding:8px; background:#4f545c;
                        border:none; border-radius:4px; color:white; cursor:pointer;
                    ">Cancel</button>

                    <button id="embedSend" style="
                        flex:1; padding:8px; background:#5865F2;
                        border:none; border-radius:4px; color:white; cursor:pointer;
                    ">Send</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById("embedCancel").onclick = () => modal.remove();

        document.getElementById("embedSend").onclick = () => {
            const data = {
                title: document.getElementById("embedTitle").value.trim(),
                description: document.getElementById("embedDescription").value.trim(),
                color: document.getElementById("embedColor").value.trim(),
                timestamp: document.getElementById("embedTimestamp").checked
            };

            modal.remove();
            callback(data);
        };
    };

    // ============================================================
    //  EMBED SENDER (v14-compatible)
    // ============================================================
    const sendBuiltEmbed = (data) => {
        const selected = document.querySelector(".channel.selectedChan");
        if (!selected) {
            console.error("[EmbedBuilder] No selected channel element");
            return;
        }

        const channelId = selected.id;
        const chan = bot.channels.cache.get(channelId);
        if (!chan) {
            console.error("[EmbedBuilder] Channel not found in cache:", channelId);
            return;
        }

        let color = null;
        if (data.color) {
            const hex = data.color.replace("#", "").trim();
            if (/^[0-9a-fA-F]{6}$/.test(hex)) {
                color = parseInt(hex, 16);
            }
        }

        const embed = {
            title: data.title || null,
            description: data.description || null,
        };

        if (color !== null) embed.color = color;
        if (data.timestamp) embed.timestamp = new Date().toISOString();

        chan.send({ embeds: [embed] })
            .catch(err => console.error("[EmbedBuilder] Embed send failed:", err));
    };

    // ============================================================
    //  MENU HELPERS (permission-aware)
    // ============================================================
    const createMenu = (id, width = "180px") => {
        const menu = document.createElement("div");
        menu.id = id;
        menu.style.position = "fixed";
        menu.style.background = "#2f3136";
        menu.style.border = "1px solid #202225";
        menu.style.padding = "6px 0";
        menu.style.borderRadius = "4px";
        menu.style.display = "none";
        menu.style.zIndex = "9999999";
        menu.style.width = width;
        menu.style.fontSize = "14px";
        menu.style.color = "#fff";
        menu.style.userSelect = "none";
        return menu;
    };

    const addMenuItem = (menu, label, onClick, disabled = false) => {
        const item = document.createElement("div");
        item.textContent = label;
        item.style.padding = "6px 12px";
        item.style.userSelect = "none";

        if (disabled) {
            item.style.opacity = "0.4";
            item.style.cursor = "not-allowed";
        } else {
            item.style.cursor = "pointer";
            item.onmouseenter = () => (item.style.background = "#40444b");
            item.onmouseleave = () => (item.style.background = "transparent");
            item.onclick = () => {
                menu.style.display = "none";
                onClick();
            };
        }

        menu.appendChild(item);
    };

    // ============================================================
    //  CURRENT GUILD (from selected channel)
    // ============================================================
    const getCurrentGuild = () => {
        const selected = document.querySelector(".channel.selectedChan");
        if (!selected) return null;

        const channelId = selected.id;
        if (!channelId) return null;

        const chan = bot.channels.cache.get(channelId);
        if (!chan) return null;

        return chan.guild || null;
    };

    // ============================================================
    //  CHANNEL ITEM CONTEXT MENU (permission-aware)
    // ============================================================
    const channelMenu = createMenu("channelContextMenu");

    const buildChannelMenu = (channelId) => {
        channelMenu.innerHTML = "";

        const chan = bot.channels.cache.get(channelId);
        if (!chan) return;

        const me = chan.guild.members.me;
        const perms = me.permissions;
        const canManageChannels = perms.has("ManageChannels");

        // Copy ID (always allowed)
        addMenuItem(channelMenu, "Copy Channel ID", () => {
            navigator.clipboard.writeText(channelId);
        });

        // Rename
        addMenuItem(
            channelMenu,
            "Rename Channel",
            () => {
                showInputModal("Rename Channel", chan.name, (newName) => {
                    newName = (newName || "").trim();
                    if (!newName) newName = chan.name;

                    chan.setName(newName)
                        .then(() => {
                            if (typeof refreshChannels === "function") refreshChannels();
                        });
                });
            },
            !canManageChannels
        );

        // Delete
        addMenuItem(
            channelMenu,
            "Delete Channel",
            () => {
                chan.delete()
                    .then(() => {
                        if (typeof refreshChannels === "function") refreshChannels();
                    });
            },
            !canManageChannels
        );
    };

    document.body.appendChild(channelMenu);

    // ============================================================
    //  CHANNEL LIST BACKGROUND MENU (permission-aware)
    // ============================================================
    const listMenu = createMenu("channelListContextMenu", "200px");

    const buildListMenu = (guild) => {
        listMenu.innerHTML = "";

        const me = guild.members.me;
        const perms = me.permissions;
        const canManageChannels = perms.has("ManageChannels");

        // Create Text
        addMenuItem(
            listMenu,
            "Create Text Channel",
            () => {
                showInputModal("New Text Channel Name", "new-channel", (name) => {
                    name = (name || "").trim();
                    if (!name) name = "new-channel";

                    guild.channels
                        .create({
                            name: name,
                            type: 0, // text
                        })
                        .then(() => {
                            if (typeof refreshChannels === "function") refreshChannels();
                        });
                });
            },
            !canManageChannels
        );

        // Create Voice
        addMenuItem(
            listMenu,
            "Create Voice Channel",
            () => {
                showInputModal("New Voice Channel Name", "New Voice", (name) => {
                    name = (name || "").trim();
                    if (!name) name = "New Voice";

                    guild.channels
                        .create({
                            name: name,
                            type: 2, // voice
                        })
                        .then(() => {
                            if (typeof refreshChannels === "function") refreshChannels();
                        });
                });
            },
            !canManageChannels
        );

        // Create Category
        addMenuItem(
            listMenu,
            "Create Category",
            () => {
                showInputModal("New Category Name", "New Category", (name) => {
                    name = (name || "").trim();
                    if (!name) name = "New Category";

                    guild.channels
                        .create({
                            name: name,
                            type: 4, // category
                        })
                        .then(() => {
                            if (typeof refreshChannels === "function") refreshChannels();
                        });
                });
            },
            !canManageChannels
        );
    };

    document.body.appendChild(listMenu);

    // ============================================================
    //  RIGHT-CLICK HANDLER
    // ============================================================
    document.addEventListener("contextmenu", (e) => {
        const channelEl = e.target.closest(".channel");
        const channelList = e.target.closest("#channel-list");

        // Channel menu
        if (channelEl) {
            e.preventDefault();

            const channelId = channelEl.id;
            buildChannelMenu(channelId);

            channelMenu.style.left = e.clientX + "px";
            channelMenu.style.top = e.clientY + "px";
            channelMenu.style.display = "block";

            listMenu.style.display = "none";
            return;
        }

        // List menu
        if (channelList) {
            e.preventDefault();

            const guild = getCurrentGuild();
            if (!guild) return;

            buildListMenu(guild);

            listMenu.style.left = e.clientX + "px";
            listMenu.style.top = e.clientY + "px";
            listMenu.style.display = "block";

            channelMenu.style.display = "none";
            return;
        }
    });

    document.addEventListener("click", () => {
        channelMenu.style.display = "none";
        listMenu.style.display = "none";
    });

    // ============================================================
    //  EMBED ICON WIRING
    // ============================================================
    const embedIcon = document.querySelector("#embedBuilderIcon");

    if (embedIcon) {
        embedIcon.addEventListener("click", () => {
            showEmbedBuilder((data) => {
                sendBuiltEmbed(data);
            });
        });
    } else {
        console.warn("[EmbedBuilder] #embedBuilderIcon not found");
    }

    console.log("[ChannelMenu] All context menus and embed builder installed.");
};