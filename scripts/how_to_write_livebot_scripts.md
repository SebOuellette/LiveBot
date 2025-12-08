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
