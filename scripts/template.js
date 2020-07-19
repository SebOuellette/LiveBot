module.exports.info = {
    author: "Your discord username and tag (ex: daniel_crime#1551)",
    title: "Name of your script",
    description: "Description of your script",
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
}