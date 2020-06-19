function addDocListener() {
    document.addEventListener("mousedown", e => {
        // Set the target and whatnot
        e = e || window.event;
        let target = e.target || e.srcElement;
        
        // X and Y position of the click
        let x = e.clientX;
        let y = e.clientY;

        if (e.which == 1) {
            // Left click
        } else if (e.which == 3) { // Right click
            // Right click a message
            if (target.parentElement.classList.contains('messageBlock')) {
                target = target.parentElement;
            }

            // Checking otherwise
            if (target.classList.contains('messageBlock')) {
                console.log(target.querySelector('.messageText').innerHTML);
            }
        }
    })
}