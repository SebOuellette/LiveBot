window.onclick = function(event) {
    if (!event.target.matches('.msgMenu')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

window.addEventListener("keydown", function(e) {
    keys[e.key] = true
})

window.addEventListener("keyup", function(e) {
    keys[e.key] = false
})

function holdingKey(i) {
    return keys[i] == true
}

function offset(el) {
    var rect = el.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

function messageMenu(m, text) {
    let menu = document.createElement('div')
    let messageMenu = document.getElementById('messageMenu')
    menu.innerHTML = "⋮"
    menu.classList = "msgMenu"

    text.addEventListener("mouseenter", function(event) {
        menu.style.opacity = "1";
    });
    text.addEventListener("mouseleave", function(event) {
        menu.style.opacity = "0";
    });
    text.addEventListener("mouseup", function(e) {
        if (holdingKey('Delete')) {
            m.delete();
        }
    })
    menu.addEventListener("mouseup", function(e) {
        while (messageMenu.lastChild) {
            messageMenu.removeChild(messageMenu.lastChild);
        }
        if (m.pinnable) {
            let pin = document.createElement('a')
            pin.innerHTML = m.pinned ? "Unpin" : "Pin"
            pin.onclick = function(e) {
                m.pinned ? m.unpin() : m.pin();
            }
            messageMenu.appendChild(pin)
        }

        if (m.editable) {
            let edit = document.createElement('a')
            edit.innerHTML = "Edit"
            edit.onclick = function(e) {
                if (document.getElementById('msgbox').innerText.length) {
                    m.edit(document.getElementById('msgbox').innerText);
                    document.getElementById('msgbox').innerText = '';
                } else {
                    document.getElementById('msgbox').innerText = m.cleanContent
                }
            }
            messageMenu.appendChild(edit)
        }
        if (m.deletable) {
            let del = document.createElement('a')
            del.innerHTML = "Delete"
            del.onclick = function(e) {
                m.delete();
            }
            messageMenu.appendChild(del)
        }
        var offsets = offset(menu)
        messageMenu.style.left = offsets.left + "px"
        messageMenu.style.top = offsets.top + "px"
        messageMenu.classList.toggle("show");
    });
    text.appendChild(menu)
} 