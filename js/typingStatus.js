let typingTimer = { 
    indicator:
    {
        timer: null, // Current timer
        func: function(){ // Function
            typingStatus(false)
        },
        check: function(time, size){
            if(this.timer == null && size){
                this.timer = setInterval(this.func, time);
            } else if (!size && this.timer != null) {
                clearInterval(this.timer);
                this.timer = null;                
            }
        }
    },
    typingTimeout:
    {
        timers: {}, // Current timers
        check: function(id) {
            if(id in this.timers) {
                this.timers[id]['timeout'] = bot.user._typing.get(id).count;
                return
            }

            let timeout = bot.user._typing.get(id).count;
            let channel = bot.channels.cache.find(e => e.id == id);

            if(!channel) return;

            let interval = setInterval(() => {this.decrease(id, channel)}, 1000);
            this.timers[id] = {timeout, interval};
        },
        decrease: function(id, channel){
            channel.stopTyping();
            this.timers[id]['timeout']--;
            if(this.timers[id]['timeout'] < 0){
                clearInterval(this.timers[id]['interval']);
                delete this.timers[id];
            }
        }
    }
}

function typingStatus(override = false, m = undefined) {
    if (!selectedChan) return;
    let dms = selectedChan.type == 'dm';
    let indicator = document.getElementById('typingIndicator');
    let users = [];
    selectedChan._typing.forEach(e => users.push(dms ? bot.users.cache.get(e.user.id) : selectedChan.members.get(e.user.id)))
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
        let name = dms ? users[user].username : users[user].displayName
        if (user != length - 1)
            text += name + ", ";
        else
            text += name;
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
            if (m != undefined){
                let id = m.author.id;
                if(e.user.id == id && selectedChan._typing.has(id)){
                    clearTimeout(selectedChan._typing.get(id).timeout);
                    selectedChan._typing.delete(id);
                    return typingStatus();
                }
            }
            if(lastTime < e.elapsedTime){
                shortestTime = e.elapsedTime;
                let elapsedTime = new Date().getTime() - new Date(e.lastTimestamp).getTime();
                if(shortestTime > shortestTime - elapsedTime)
                    shortestTime = elapsedTime;
            }
        })
    }

    typingTimer.indicator.check(shortestTime, selectedChan._typing.size);
}

let lastTime = 0;

// setInterval(typingStatus, 1000);