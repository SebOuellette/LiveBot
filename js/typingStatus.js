let typingTimer = { 
    indicator:
    [
        null, // Current timer
        func = () => { // Function
            typingStatus(false)
        },
        check = (time, size) => {
            let [timer, func] = typingTimer.indicator;
            if(timer == null && size){
                timer = setInterval(func, time);
                typingTimer.indicator[0] = timer;
            } else if (!size && timer != null) {
                clearInterval(timer);
                typingTimer.indicator[0] = null;
            }
        }
    ],
    typingTimeout:
    [
        {}, // Current timers
        check = (id) => {
            if(id in typingTimer.typingTimeout[0]) {
                typingTimer.typingTimeout[0][id]['timeout'] = bot.user._typing.get(id).count;
                return
            };

            let timeout = bot.user._typing.get(id).count;
            let channel = bot.channels.cache.find(e => e.id == id);

            if(!channel) return;

            let interval = setInterval(() => {typingTimer.typingTimeout[2](id, channel)}, 1000);
            typingTimer.typingTimeout[0][id] = {timeout, interval};
        },
        decrease = (id, channel) => {
            channel.stopTyping();
            typingTimer.typingTimeout[0][id]['timeout']--;
            if(typingTimer.typingTimeout[0][id]['timeout'] < 0){
                clearInterval(typingTimer.typingTimeout[0][id]['interval']);
                delete(typingTimer.typingTimeout[0][id]);
            }
        }
    ]
}

function typingStatus(override = false) {
    if (!selectedChan) return;

    let indicator = document.getElementById('typingIndicator');
    let users = [];
    selectedChan._typing.forEach(e => users.push(selectedChan.members.get(e.user.id)))
    let text = "";

    let self = users.find(member => member.user == bot.user);
    if(self)
        users.splice(users.indexOf(self), 1)

    let length = users.length;

    if (length) {
        document.getElementById('typingDots').classList.add('enabled');
    } else {
        document.getElementById('typingDots').classList.remove('enabled');
    }

    for (let user in users) {
        if (user != length - 1)
            text += users[user].displayName + ", ";
        else
            text += users[user].displayName;
    }


    let boldText = length > 4 ? `Several people are typing...` : `${text}`;
    let endText = `${length == 0 ? "" : length == 1 ? " is typing..." : " are typing..."}`

    if(indicator.innerText != boldText + endText){
        indicator.innerHTML = '';
        // Create the element for the bold text
        let boldTextElement = document.createElement('span');
        boldTextElement.innerText = boldText;
        boldTextElement.classList.add('bold');
        indicator.appendChild(boldTextElement);

        indicator.innerHTML += endText;
    }

    let shortestTime = 1000;
    if(selectedChan._typing.size){
        // Needs a set timer so it doesn't create 1000 timers at a time
        // The timings can be found in each users typing variable and checking by the smallest is the best bet
        selectedChan._typing.forEach(e => {
            if(lastTime < e.elapsedTime){
                shortestTime = e.elapsedTime;
                let elapsedTime = new Date().getTime() - new Date(e.lastTimestamp).getTime();
                if(shortestTime > shortestTime - elapsedTime)
                    shortestTime = elapsedTime;
            }
        })
    }

    typingTimer.indicator[2](shortestTime, selectedChan._typing.size);
}

let lastTime = 0;

// setInterval(typingStatus, 1000);