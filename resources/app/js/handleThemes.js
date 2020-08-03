let loadedThemes = []

function loadThemes() {
    // Set the directory of the themes
    let dir = './themes/'

    // Get all the files in the themes folder
    let files = fs.readdirSync(dir);

    // Remove the template file out of the equasion if there is one
    if(files.includes('template.css'))
        files.splice(files.indexOf('template.css'), 1);

    // Don't bother loading if there is nothing
    if(!files.length) return;
    
    console.log('Loading themes...');

    files.forEach(file => {
        if (!file.endsWith(".css")) return;

        let script = document.createElement('link');
        script.id = file
        script.rel = 'stylesheet';
        script.href = dir+file;

        loadedThemes.push([script, file]);

        document.head.appendChild(script)
        console.log('\n%c  '  + file + ' loaded', 'color:Lime')
    })
}

function unloadThemes(){
    // If there's nothing there don't bother
    if(!loadedThemes.length) return

    // Display that the themes are being unloaded
    console.log('Unloading themes...');

    // Go through each of the elements that are saved in the memory
    for(element of loadedThemes){
        document.head.removeChild(element[0])
        console.log('%c  '  + element[1] + ' unloaded', 'color:Red')
    }
    // Delete all the elements that were once loaded
    loadedThemes = [];
}