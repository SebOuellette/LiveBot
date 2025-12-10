/**
 * Scripts Manager Panel
 * ---------------------
 * This module injects a full in‑app script management interface into the client.
 * It provides a right‑side sliding panel where developers can create, edit,
 * reload, and delete custom scripts without leaving the application.
 *
 * Core Features:
 *  - Dynamic panel injection with smooth open/close animations
 *  - Resizable panel width with persistent UI behavior
 *  - Script discovery and status tracking (loaded / error / unknown)
 *  - Inline script editor with:
 *      • Line numbers
 *      • Search bar (toggleable)
 *      • Text search + line jump
 *      • Up/down navigation through multiple matches
 *  - Safe‑guarding of core system files (scriptsManager.js cannot be edited/deleted)
 *  - Modal dialogs for creating and deleting scripts
 *  - Automatic script reloading after save
 *
 * Architectural Notes:
 *  - The panel is injected only once and reused across sessions.
 *  - Editor mode replaces the script list view but preserves panel state.
 *  - All DOM elements are created dynamically to avoid modifying core HTML.
 *  - The script directory is resolved relative to this file’s location.
 *  - Script execution is sandboxed by requiring each file as a function(bot).
 *
 * Intended Use:
 *  This file is designed to make script development accessible and fast.
 *  Contributors should feel comfortable extending UI components, adding new
 *  editor tools, or improving script lifecycle handling without needing to
 *  understand the entire application architecture.
 */

const fs = require("fs");
const path = require("path");
const { shell } = require("electron");

module.exports.info = {
    author: 'developer51709',
    title: 'Official Scripts Manager',
    description: 'LiveBot\'s official scripts manager tool',
    version: '1.0.0',
};

module.exports.start = () => {
    console.log("[ScriptsManager] Loaded");

    const scriptsDir = path.join(__dirname);

    // Track script load status/errors
    const scriptStatus = {};

    const reloadScript = (file) => {
        const full = path.join(scriptsDir, file);
        try {
            delete require.cache[require.resolve(full)];
            const script = require(full);
            if (typeof script === "function") {
                script(bot);
            }
            scriptStatus[file] = { status: "loaded", error: null };
            console.log(`[ScriptsManager] Reloaded script: ${file}`);
        } catch (err) {
            scriptStatus[file] = { status: "error", error: err.message };
            console.error(`[ScriptsManager] Error reloading script ${file}:`, err);
        }
    };

    const reloadAllScripts = () => {
        const files = fs.readdirSync(scriptsDir)
            .filter(f => f.endsWith(".js") && f !== "scriptsManager.js"); 
	    // I want to show this as an example script
        files.forEach(file => reloadScript(file));
    };

    // UI state
    let currentEditor = null;
    let currentEditingFile = null;
    let inEditorMode = false;
    let scriptPendingDelete = null;

    // Search state
    let searchMatches = [];
    let searchIndex = 0;

    // ============================================================
    // PANEL + MODALS
    // ============================================================
    const injectPanel = () => {
        if (document.getElementById("scriptsPanel")) return;

        const panel = document.createElement("div");
        panel.id = "scriptsPanel";
        panel.style = `
            position: fixed;
            top: 0;
            right: -500px;
            width: 500px;
            height: 100vh;
            min-height: 0;
            background: #2f3136;
            border-left: 1px solid #202225;
            z-index: 9999999;
            transition: right 0.3s ease;
            display: flex;
            flex-direction: column;
            color: white;
            font-family: sans-serif;
        `;

        panel.innerHTML = `
            <div id="scriptsResizeHandle" style="
                position:absolute;
                left:-5px;
                top:0;
                width:5px;
                height:100%;
                cursor:ew-resize;
                z-index:10000000;
            "></div>

            <div id="scriptsHeader" style="
                padding: 12px 16px;
                font-size: 16px;
                border-bottom: 1px solid #202225;
                display:flex;
                align-items:center;
                justify-content:space-between;
            ">
                <div style="display:flex; align-items:center; gap:10px;">
                    <button id="editorBackBtn" style="
                        padding:4px 10px; background:#4f545c; border:none;
                        border-radius:4px; color:white; cursor:pointer; font-size:12px;
                        display:none;
                    ">← Back</button>
                    <span id="editorFilename" style="opacity:0.8;"></span>
                </div>

                <div style="display:flex; align-items:center; gap:10px;">
                    <button id="newScriptBtn" style="
                        padding:4px 10px; background:#3ba55d; border:none;
                        border-radius:4px; color:white; cursor:pointer; font-size:12px;
                    ">New Script</button>

                    <button id="toggleSearchBar" style="
                        padding:4px 10px; background:#4f545c; border:none;
                        border-radius:4px; color:white; cursor:pointer; font-size:12px;
                        display:none;
                    ">🔍</button>

                    <button id="editorSaveBtn" style="
                        padding:4px 12px; background:#3ba55d; border:none;
                        border-radius:4px; color:white; cursor:pointer; font-size:12px;
                        display:none;
                    ">Save</button>

                    <span id="scriptsClose" style="cursor:pointer; font-size:20px;">×</span>
                </div>
            </div>

            <div id="lineSearchBar" style="
                display:none;
                padding:8px 16px;
                background:#2f3136;
                border-bottom:1px solid #202225;
                display:flex;
                align-items:center;
                gap:10px;
            ">
                <input id="lineSearchInput" type="text" placeholder="Search or go to line..." style="
                    flex:1;
                    padding:6px;
                    border-radius:4px;
                    border:none;
                    outline:none;
                    background:#202225;
                    color:white;
                    font-size:13px;
                ">

                <button id="searchUpBtn" style="
                    padding:4px 8px;
                    background:#4f545c;
                    border:none;
                    border-radius:4px;
                    color:white;
                    cursor:pointer;
                    font-size:12px;
                ">▲</button>

                <button id="searchDownBtn" style="
                    padding:4px 8px;
                    background:#4f545c;
                    border:none;
                    border-radius:4px;
                    color:white;
                    cursor:pointer;
                    font-size:12px;
                ">▼</button>
            </div>

            <div id="scriptsListView" style="
                flex:1;
                display:flex;
                flex-direction:column;
                min-height:0;
            ">
                <div style="
                    padding:10px;
                    border-bottom:1px solid #202225;
                    display:flex;
                    gap:10px;
                ">
                    <button id="openScriptsFolder" style="
                        flex:1; padding:6px; background:#4f545c; border:none;
                        border-radius:4px; color:white; cursor:pointer; font-size:13px;
                    ">Open Folder</button>

                    <button id="reloadAllScripts" style="
                        flex:1; padding:6px; background:#5865F2; border:none;
                        border-radius:4px; color:white; cursor:pointer; font-size:13px;
                    ">Reload All</button>
                </div>

                <div id="scriptsList" style="
                    flex:1;
                    overflow-y:auto;
                    padding:10px;
                    min-height:0;
                "></div>
            </div>

            <div id="scriptsEditorView" style="
                flex:1;
                display:none;
                flex-direction:column;
                min-height:0;
            ">
                <div id="scriptsEditorContainer" style="
                    flex:1;
                    padding:0;
                    display:flex;
                    min-height:0;
                    overflow:hidden;
                ">
                    <div id="lineNumbers" style="
                        width:50px;
                        background:#2b2b2b;
                        color:#888;
                        padding:10px 5px;
                        text-align:right;
                        font-family:Consolas,'Fira Code',monospace;
                        font-size:13px;
                        overflow:hidden;
                        user-select:none;
                    "></div>

                    <textarea id="editorTextarea" style="
                        flex:1;
                        width:100%;
                        background:#1e1e1e;
                        color:#d4d4d4;
                        border:none;
                        outline:none;
                        resize:none;
                        overflow-y:auto;
                        font-family:Consolas,'Fira Code',monospace;
                        font-size:13px;
                        padding:10px;
                        box-sizing:border-box;
                    " spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        // =========================
        // DRAGGABLE RESIZE HANDLE
        // =========================
        const resizeHandle = panel.querySelector("#scriptsResizeHandle");
        let isResizing = false;

        resizeHandle.addEventListener("mousedown", () => {
            isResizing = true;
            document.body.style.userSelect = "none";
        });

        document.addEventListener("mousemove", (e) => {
            if (!isResizing) return;

            const newWidth = window.innerWidth - e.clientX;
            const min = 350;
            const max = 900;
            const width = Math.min(max, Math.max(min, newWidth));

            panel.style.width = width + "px";

            const app = document.getElementById("app-mount") || document.body;
            app.style.marginRight = width + "px";
        });

        document.addEventListener("mouseup", () => {
            isResizing = false;
            document.body.style.userSelect = "";
        });

        // =========================
        // MODALS
        // =========================
        const modal = document.createElement("div");
        modal.id = "newScriptModal";
        modal.style = `
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.6);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000000;
        `;
        modal.innerHTML = `
            <div style="
                background:#2f3136;
                padding:20px;
                border-radius:8px;
                width:300px;
                display:flex;
                flex-direction:column;
                gap:10px;
                color:white;
                border:1px solid #202225;
            ">
                <span style="font-size:16px;">New Script Name</span>
                <input id="newScriptInput" type="text" placeholder="myScript" style="
                    padding:6px; border-radius:4px; border:none; outline:none;
                    background:#202225; color:white;
                ">
                <div style="display:flex; gap:10px; margin-top:10px;">
                    <button id="newScriptCancel" style="
                        flex:1; padding:6px; background:#4f545c; border:none;
                        border-radius:4px; color:white; cursor:pointer;
                    ">Cancel</button>
                    <button id="newScriptCreate" style="
                        flex:1; padding:6px; background:#3ba55d; border:none;
                        border-radius:4px; color:white; cursor:pointer;
                    ">Create</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const deleteModal = document.createElement("div");
        deleteModal.id = "deleteScriptModal";
        deleteModal.style = `
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.6);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000000;
        `;
        deleteModal.innerHTML = `
            <div style="
                background:#2f3136;
                padding:20px;
                border-radius:8px;
                width:300px;
                display:flex;
                flex-direction:column;
                gap:10px;
                color:white;
                border:1px solid #202225;
            ">
                <span style="font-size:16px;">Delete Script</span>
                <span id="deleteScriptName" style="opacity:0.8;"></span>

                <div style="display:flex; gap:10px; margin-top:10px;">
                    <button id="deleteScriptCancel" style="
                        flex:1; padding:6px; background:#4f545c; border:none;
                        border-radius:4px; color:white; cursor:pointer;
                    ">Cancel</button>

                    <button id="deleteScriptConfirm" style="
                        flex:1; padding:6px; background:#d83c3e;
                        border:none; border-radius:4px; color:white; cursor:pointer;
                    ">Delete</button>
                </div>
            </div>
        `;
        document.body.appendChild(deleteModal);

        // =========================
        // BUTTON HANDLERS
        // =========================
        document.getElementById("scriptsClose").onclick = closePanel;
        document.getElementById("openScriptsFolder").onclick = () => shell.openPath(scriptsDir);
        document.getElementById("reloadAllScripts").onclick = () => {
            reloadAllScripts();
            renderScripts();
        };
        document.getElementById("newScriptBtn").onclick = () => promptNewScriptName();

        document.getElementById("newScriptCancel").onclick = () => {
            document.getElementById("newScriptModal").style.display = "none";
        };
        document.getElementById("newScriptCreate").onclick = () => handleCreateNewScript();

        document.getElementById("deleteScriptCancel").onclick = () => {
            document.getElementById("deleteScriptModal").style.display = "none";
            scriptPendingDelete = null;
        };
        document.getElementById("deleteScriptConfirm").onclick = () => confirmDeleteScript();

        document.getElementById("editorSaveBtn").onclick = () => saveCurrentScript(true);

        // Search bar toggle
        document.getElementById("toggleSearchBar").onclick = () => {
            const bar = document.getElementById("lineSearchBar");
            bar.style.display = bar.style.display === "none" ? "flex" : "none";
            if (bar.style.display === "flex") {
                document.getElementById("lineSearchInput").focus();
            }
        };

        // Search input
        document.getElementById("lineSearchInput").addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                performSearch();
            }
        });

        // Arrow buttons
        document.getElementById("searchUpBtn").onclick = () => {
            if (searchMatches.length === 0) performSearch();
            else jumpToMatch(-1);
        };

        document.getElementById("searchDownBtn").onclick = () => {
            if (searchMatches.length === 0) performSearch();
            else jumpToMatch(1);
        };
    };

    // ============================================================
    // SEARCH / LINE NUMBERS
    // ============================================================
    const updateLineNumbers = () => {
        const textarea = document.getElementById("editorTextarea");
        const lineNumbers = document.getElementById("lineNumbers");
        if (!textarea || !lineNumbers) return;

        const lines = textarea.value.split("\n").length;
        let html = "";
        for (let i = 1; i <= lines; i++) {
            html += i + "<br>";
        }
        lineNumbers.innerHTML = html;
    };

    const performSearch = () => {
        const textarea = document.getElementById("editorTextarea");
        const input = document.getElementById("lineSearchInput");
        if (!textarea || !input) return;

        const query = input.value.trim();
        searchMatches = [];
        searchIndex = 0;

        if (!query) return;

        const lines = textarea.value.split("\n");

        // If numeric → treat as line number
        if (!isNaN(query)) {
            const lineNum = parseInt(query, 10);
            if (lineNum > 0 && lineNum <= lines.length) {
                searchMatches = [lineNum - 1];
            }
        } else {
            // Text search
            const lower = query.toLowerCase();
            lines.forEach((line, i) => {
                if (line.toLowerCase().includes(lower)) {
                    searchMatches.push(i);
                }
            });
        }

        jumpToMatch(0);
    };

    const jumpToMatch = (offset) => {
        const textarea = document.getElementById("editorTextarea");
        if (!textarea || searchMatches.length === 0) return;

        searchIndex = (searchIndex + offset + searchMatches.length) % searchMatches.length;

        const line = searchMatches[searchIndex];
        const lineHeight = 18; // approx line height in px
        textarea.scrollTop = line * lineHeight;
    };

    // ============================================================
    // PANEL OPEN/CLOSE
    // ============================================================
    const openPanel = () => {
        injectPanel();

        const panel = document.getElementById("scriptsPanel");
        const app = document.getElementById("app-mount") || document.body;

        panel.style.width = "500px";
        app.style.transition = "margin-right 0.3s ease";
        app.style.marginRight = "500px";

        panel.style.right = "0px";

        renderScripts();
    };

    const closePanel = () => {
        const panel = document.getElementById("scriptsPanel");
        const app = document.getElementById("app-mount") || document.body;

        app.style.marginRight = "0px";
        const width = parseInt(panel.style.width || "500", 10);
        panel.style.right = `-${width}px`;

        inEditorMode = false;
        currentEditingFile = null;
        currentEditor = null;
        scriptPendingDelete = null;
    };

    // ============================================================
    // NEW SCRIPT
    // ============================================================
    const promptNewScriptName = () => {
        const modal = document.getElementById("newScriptModal");
        const input = document.getElementById("newScriptInput");

        input.value = "";
        modal.style.display = "flex";
        input.focus();
    };

    const handleCreateNewScript = () => {
        const modal = document.getElementById("newScriptModal");
        const input = document.getElementById("newScriptInput");

        const name = input.value.trim();
        if (!name) return;

        const safe = name.replace(/[^\w\-]/g, "");
        if (!safe) return;

        const file = safe + ".js";
        const full = path.join(scriptsDir, file);

        if (file === "scriptsManager.js") {
            alert("This filename is reserved.");
            return;
        }

        if (fs.existsSync(full)) {
            alert("A script with that name already exists.");
            return;
        }

        const template = `module.exports.info = {
    author: 'Your discord username and tag (ex: SharkFin#1504)',
    title: 'Name of your script',
    description: 'Description of your script',
    version: '1.0.0',
};

// 'module.exports = () =>' will behave the same as 'module.exports.start = () =>'

module.exports.start = () => {
    /*
    Global Variables Available:
    bot             - the Discord.client() that is signed in
    selectedChan    - the current channel you're in (Object, not the DOM)
    selectedGuild   - the current guild you're in
    selectedVoice   - the last selected voice channel
                        This isn't really supported, but it's here for future use. If you need better accessibility with this variable,
                        ask for it in the discord (which you can find on the readme) and we'll see what we can do
    */

    // Your code goes here

    myFunction();
};

module.exports.stop = () => {
    // This code will call when the script should be unloaded
};

function myFunction() {
    // You can make normal functions and call them from start()
}`;

        try {
            fs.writeFileSync(full, template, "utf8");
            scriptStatus[file] = { status: "loaded", error: null };

            modal.style.display = "none";
            renderScripts();
            enterEditorMode(file);
        } catch (err) {
            console.error("[ScriptsManager] Error creating script:", err);
            alert("Error creating script: " + err.message);
        }
    };

    // ============================================================
    // DELETE SCRIPT
    // ============================================================
    const promptDeleteScript = (file) => {
        if (file === "scriptsManager.js" || file === "embedBuilder.js" || file === "template.js") {
            alert(`${file} is a core system script and cannot be deleted.`);
            return;
        }

        scriptPendingDelete = file;

        const modal = document.getElementById("deleteScriptModal");
        const nameLabel = document.getElementById("deleteScriptName");

        nameLabel.textContent = `Are you sure you want to delete "${file}"?`;
        modal.style.display = "flex";
    };

    const confirmDeleteScript = () => {
        if (!scriptPendingDelete) return;

        const file = scriptPendingDelete;
        const full = path.join(scriptsDir, file);

        try {
            if (fs.existsSync(full)) {
                fs.unlinkSync(full);
            }
            delete scriptStatus[file];
        } catch (err) {
            alert("Error deleting script: " + err.message);
        }

        scriptPendingDelete = null;
        document.getElementById("deleteScriptModal").style.display = "none";
        renderScripts();
    };

    // ============================================================
    // RENDER SCRIPT LIST
    // ============================================================
    const renderScripts = () => {
        if (inEditorMode) return;

        const list = document.getElementById("scriptsList");
        if (!list) return;

        const files = fs.readdirSync(scriptsDir)
            .filter(f => f.endsWith(".js")); // && f !== "scriptsManager.js");

        list.innerHTML = "";

        files.forEach(file => {
            const info = scriptStatus[file] || { status: "unknown", error: null };

	    const resolveName = `./${file}`;
	    require(resolveName);
	    const script = require.cache[require.resolve(resolveName)]?.exports?.info;
	    delete require.cache[require.resolve(resolveName)];

            const row = document.createElement("div");
            row.style = `
                background:#36393f;
                padding:10px;
                border-radius:6px;
                margin-bottom:10px;
            `;

            row.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>${script?.title ? script?.title : file} <span style="opacity:0.7">by ${script?.author}</span></strong>
                    <span style="font-size:12px; opacity:0.7;">${info.status}</span>
                </div>

                ${info.error ? `<div style="color:#ff6b6b; font-size:12px; margin-top:6px;">${info.error}</div>` : ""}

		${script?.author ? `<div style="display:flex; justify-content:space-between; align-items:center;">
		    <p>${script?.description}</p>
		    <p>v${script?.version}</p>
		</div>` : ""}

                <div style="display:flex; gap:10px; margin-top:10px;">
                    <button class="reloadScript" data-file="${file}" style="
                        flex:1; padding:6px; background:#5865F2;
                        border:none; border-radius:4px; color:white; cursor:pointer; font-size:12px;
                    " title="Reload this script">Reload</button>

                    <button class="editScript" data-file="${file}" style="
                        flex:1; padding:6px; background:#7289da;
                        border:none; border-radius:4px; color:white; cursor:pointer; font-size:12px;
                    " title="Edit this script">Edit</button>

                    <button class="deleteScript" data-file="${file}" style="
                        flex:1; padding:6px; background:#d83c3e;
                        border:none; border-radius:4px; color:white; cursor:pointer; font-size:12px;
                    " title="Delete this script">Delete</button>
                </div>
            `;

            list.appendChild(row);
        });

        document.querySelectorAll(".reloadScript").forEach(btn => {
            btn.onclick = () => {
                const file = btn.dataset.file;
                reloadScript(file);
                renderScripts();
            };
        });

        document.querySelectorAll(".editScript").forEach(btn => {
            btn.onclick = () => {
                const file = btn.dataset.file;
                enterEditorMode(file);
            };
        });

        document.querySelectorAll(".deleteScript").forEach(btn => {
            btn.onclick = () => {
                const file = btn.dataset.file;
                promptDeleteScript(file);
            };
        });
    };

    // ============================================================
    // EDITOR MODE
    // ============================================================
    const enterEditorMode = (file) => {
        if (file === "scriptsManager.js") {
            alert("scriptsManager.js is a core system script and cannot be edited.");
            return;
        }

        const listView = document.getElementById("scriptsListView");
        const editorView = document.getElementById("scriptsEditorView");
        const filenameLabel = document.getElementById("editorFilename");
        const textarea = document.getElementById("editorTextarea");
        const backBtn = document.getElementById("editorBackBtn");
        const saveBtn = document.getElementById("editorSaveBtn");
        const searchToggle = document.getElementById("toggleSearchBar");

        if (!listView || !editorView || !filenameLabel || !textarea) return;

        inEditorMode = true;
        currentEditingFile = file;

        const full = path.join(scriptsDir, file);
        let contents = "";
        try {
            contents = fs.readFileSync(full, "utf8");
        } catch (err) {
            contents = `// Error reading file: ${err.message}\n`;
        }

        filenameLabel.textContent = file;
        textarea.value = contents;

        listView.style.display = "none";
        editorView.style.display = "flex";

        if (backBtn) backBtn.style.display = "inline-block";
        if (saveBtn) saveBtn.style.display = "inline-block";
        if (searchToggle) searchToggle.style.display = "inline-block";

        currentEditor = {
            getValue: () => textarea.value,
            setValue: (v) => { textarea.value = v; }
        };

        // Line numbers + scroll sync
        const lineNumbers = document.getElementById("lineNumbers");
        if (lineNumbers) {
            updateLineNumbers();
            textarea.addEventListener("input", updateLineNumbers);
            textarea.addEventListener("scroll", () => {
                lineNumbers.scrollTop = textarea.scrollTop;
            });
        }
    };

    const exitEditorMode = (refreshList = true) => {
        const listView = document.getElementById("scriptsListView");
        const editorView = document.getElementById("scriptsEditorView");
        const textarea = document.getElementById("editorTextarea");
        const backBtn = document.getElementById("editorBackBtn");
        const saveBtn = document.getElementById("editorSaveBtn");
        const searchToggle = document.getElementById("toggleSearchBar");
        const lineSearchBar = document.getElementById("lineSearchBar");

        inEditorMode = false;
        currentEditingFile = null;
        currentEditor = null;

        if (textarea) {
            textarea.value = "";
            textarea.replaceWith(textarea.cloneNode(true)); // remove listeners safely
        }

        if (editorView) editorView.style.display = "none";
        if (listView) listView.style.display = "flex";

        if (backBtn) backBtn.style.display = "none";
        if (saveBtn) saveBtn.style.display = "none";
        if (searchToggle) searchToggle.style.display = "none";
        if (lineSearchBar) lineSearchBar.style.display = "none";

        searchMatches = [];
        searchIndex = 0;

        if (refreshList) renderScripts();
    };

    const saveCurrentScript = (autoReload = true) => {
        if (!currentEditingFile || !currentEditor) return;

        const full = path.join(scriptsDir, currentEditingFile);
        const value = currentEditor.getValue();

        try {
            fs.writeFileSync(full, value, "utf8");
            console.log(`[ScriptsManager] Saved script: ${currentEditingFile}`);

            if (autoReload && currentEditingFile !== "scriptsManager.js") {
                reloadScript(currentEditingFile);
            }

            exitEditorMode(true);
        } catch (err) {
            console.error("[ScriptsManager] Error saving script:", err);
            alert("Error saving script: " + err.message);
        }
    };

    // Back button behavior (hooked post-inject)
    document.addEventListener("click", (e) => {
        const target = e.target;
        if (target && target.id === "editorBackBtn") {
            exitEditorMode(true);
        }
    });

    // ============================================================
    // HOOK INTO "SCRIPTS" BUTTON
    // ============================================================
    const waitForScriptsButton = setInterval(() => {
        const btn = [...document.querySelectorAll(".optionCategory")]
            .find(el => el.innerText.trim() === "Scripts");

        if (!btn) return;

        clearInterval(waitForScriptsButton);

        btn.style.cursor = "pointer";
        btn.addEventListener("click", openPanel);

        console.log("[ScriptsManager] Hooked into Scripts button");
    }, 500);
};
