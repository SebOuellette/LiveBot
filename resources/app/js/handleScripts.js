let loadAllScripts = () => {
    let files = fs.readdirSync('./resources/app/scripts');

    // Preoad all the scripts
    console.log('Loading scripts...');
    files.forEach(file => {
        if (file.endsWith(".js") && file != "template.js") {
            delete require.cache[require.resolve(`./scripts/${file}`)];

            require('./scripts/' + file);
            console.log(`%c  ${file} loaded!`, 'color:Green');
        }
    });

    // Start all the loaded scripts
    console.log("Starting scripts...");
    files.forEach(file => {
        if (file.endsWith(".js") && file != "template.js") {
            require.cache[require.resolve(`./scripts/${file}`)].exports.start();

            console.log(`%c  ${file} started!`, 'color:Green');
        }
    });
};

let unloadAllScripts = () => {
    let files = fs.readdirSync('./scripts', );

    // Stop and unload all the scripts
    console.log('Stopping scripts...');
    files.forEach(file => {
        if (file.endsWith(".js") && file != "template.js" && require.cache[require.resolve(`./scripts/${file}`)]) {
            try {
                require.cache[require.resolve(`./scripts/${file}`)].exports.stop();

                console.log(`%c  ${file} stopped!`, 'color:Red');
            } catch (e) {
                // Doing it this way so that the script still gets unloaded
                console.error(e);
            }

            delete require.cache[require.resolve(`./scripts/${file}`)];
            console.log(`%c  ${file} unloaded!`, 'color:Red');
        }
    });
};

let getData = () => {
    let object = {}

    let files = fs.readdirSync('./scripts', );

    files.forEach(file => {
        if (file.endsWith(".js") && file != "template.js") {
            object[file] = require.cache[require.resolve(`./scripts/${file}`)].exports.info;
            object[file].file = file;
        }
    });

    return object;
}