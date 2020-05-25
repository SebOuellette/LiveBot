let loadAllScripts = () => {
    let files = fs.readdirSync('./resources/app/scripts', );

    // Preoad all the scripts
    console.log('Loading scripts...');
    files.forEach(file => {
        if (file.endsWith(".js") && file != "template.js") {
            delete require.cache[require.resolve(`./scripts/${file}`)];

            require('./scripts/' + file);
            console.log('  ' + file + ' loaded!');
        }
    });

    // Start all the loaded scripts
    console.log("Starting scripts...");
    files.forEach(file => {
        if (file.endsWith(".js") && file != "template.js") {
            require.cache[require.resolve(`./scripts/${file}`)].exports.start();

            console.log('  ' + file + ' started!');
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