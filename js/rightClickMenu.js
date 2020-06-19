function addDocListener() {
    document.addEventListener("mousedown", e => {
        // Set the target and whatnot
        e = e || window.event;
        let target = e.target || e.srcElement;
        
        let x = e.clientX;
        let y = e.clientY;

        if (e.which == 1) {
            // Left click
        } else if (e.which == 3) { // Right click
            // Right click a message
            if (target.classList.contains('messageBlock') || target.parentElement.classList.contains('messageBlock')) {
                console.log("message");
            }
        }
    })
}