module.exports.info = {
    author: "SharkFin#1504",
    title: "Dev Unlock",
    description: "Unlocks certain aspects of Livebot for developers",
    version: "1.0.0"
}

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
    console.log(`TestScript.js: ${bot.user.tag} has been loaded!`);
    bot.hideUnallowed = true; // default: true
}