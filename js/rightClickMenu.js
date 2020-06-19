function addDocListener() {
    document.addEventListener("mousedown", e => {
        // Set the target and whatnot
        e = e || window.event;
        let target = e.target || e.srcElement;
        
        // X and Y position of the click
        let x = e.clientX;
        let y = e.clientY;

        if (e.which == 1) {
            document.getElementById('rcMenu').classList.remove('open');
            // Left click
        } else if (e.which == 3) { // Right click
            // Get the message block containing the message
            while (!target.classList.contains('messageBlock') && target != document.body) {
                target = target.parentElement;
            }

            // Checking otherwise
            if (target.classList.contains('messageBlock')) {
                console.log(target.querySelector('.messageText').innerHTML);
                let rcMenu = document.getElementById('rcMenu');
                rcMenu.classList.add('open');
                rcMenu.style.left = `${x}px`;
                rcMenu.style.top = `${y}px`;
            }
        }
    })
}