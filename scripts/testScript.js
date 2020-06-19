module.exports.info = {
    title: "Test Script #1",
    description: "This is used to test scripts in discord livebot! This is a longer description so I can make sure it cuts it off properly"
}

module.exports.start = () => {
    console.log(bot.user.username + " Is loaded!");
};

module.exports.stop = () => {
    console.log("Bot has disconnected!");
}