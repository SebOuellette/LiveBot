const customTitlebar = require('custom-electron-titlebar');

// Create the custom titlebar
new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#202225'),
    menu: null,
    titleHorizontalAlignment: "left"
});