let helpMsg = [
        'Here is a list of available commands. \n',
        '`/help` - Lists all commands.',
        '`/shrug` - Appends ¯\\_(ツ)_/¯ to your message.',
        '`/tableflip` - Appends (╯°□°）╯︵ ┻━┻ to your message.',
        '`/unflip` - Appends ┬─┬ ノ( ゜-゜ノ) to your message.',
        '`/lenny` - Appends ( ͡° ͜ʖ ͡°) to your message.',
        '`/ping` - Check the hearbeat to discord.',
        '`/server` - Get some info about the server.',
        '`/purge <num> <true>(bypass)` - Deletes 1 or more messages if specified.',
        '`/eval` - Execute a command.'
    ].join('\n')
  
// Commands  
let sendmsg = (text = '') => {
    if (selectedChan) {
        text = text.length ? text : document.getElementById('msgbox').value;
        if(!text.replace(/ |\n| /gm, '')) return;
        // If the emoji isn't a gloabal emoji, treat it as one. 
        // let customEmoji = /(<a?:)(!)?(.+?:[0-9]+?>)/gm
        // text = text.replace(customEmoji, (a, b, c, d) => {
        //     if (c != '!') {
        //         return `${b}!${d}`; 
        //     }
        //     return a;
        // });

        if (text.substring(0,1) == '/') {
            let cmd = text.split(' ')[0].substring(1);
            let args = text.split(' ').splice(1)
            let msg = args.join(' ');
            
            switch (cmd) {
                case 'help':
                    command(helpMsg);
                break;
        
                case 'shrug':
                    selectedChan.send(msg+'¯\\_(ツ)_/¯ ');
                break;
        
                case 'tableflip':
                    selectedChan.send(msg+'(╯°□°）╯︵ ┻━┻ ');
                break;
                case 'unflip':
                    selectedChan.send(msg+'┬─┬ ノ( ゜-゜ノ)');
                break;
                case 'lenny':
                    selectedChan.send(msg+'( ͡° ͜ʖ ͡°)');
                break;
                case 'ping':
                    command('🏓 | Pong! The heartbeat is '+Math.round(bot.ws.ping)+'ms.');
                break;
                case 'server':
                    let botSize = selectedChan.guild.members.cache.filter(e => e.user.bot).size
                    let userSize = selectedChan.guild.members.cache.filter(e => !e.user.bot).size
                    let dif = {u: userSize - botSize, b: botSize - userSize};
                    let serverinfo = [
                            'Here is some info about '+selectedChan.guild.name+'. \n',
                            'Members - '+selectedChan.guild.memberCount,
                            '   Bots - '+botSize,
                            '   Users - '+userSize,
                            `   Difference - Users: `+dif.u+' | Bots: '+dif.b,
                            'Channels - '+selectedChan.guild.channels.cache.size,
                            'Roles - '+selectedChan.guild.roles.cache.size,
                            'Server ID - '+selectedChan.guild.id,
                            'Owner - '+selectedChan.guild.owner.user.tag+` (${selectedChan.guild.owner.user.id})`
                        ].join('\n');
                    command(serverinfo);
                break;
                case 'purge':
                    document.getElementById('msgbox').value = '';
                    selectedChan.stopTyping(true);
                    if(msg.length){
                        let num = parseInt(args[0])
                        if(Number.isNaN(num))
                            command('The value specified must be a number', 5000)
                        else if (num < 1){
                            command('The number must be higer than 0', 5000)
                        } else {
                            (async () => {
                                let delet = async function(tries = 0, messages = 1){
                                    if(tries >= 5)
                                        return command('Exceeded the limit of 5 retries', 2000)

                                    let err = undefined;
                                    await selectedChan.bulkDelete(messages).catch(e => {err = e});

                                    if(err && err.message == 'Unknown Message'){
                                        command(`Message failed to delete, trying again`, 3000);
                                        delet(++tries);
                                    }
                                    if(err && err.message == 'You can only bulk delete messages that are under 14 days old.'){
                                        command(`Bypass ${args[1] == 'true' ? 'is on! You turned it on yourself so the responsibility lies on you\nWe\'re in no way responsible for you turning this on, we gave a warning beforehand.' : 'is off! Do you want to take the responsibility in your hands by turning it on?\nWe\'re in no way responsible if you turn the bypass on, if anything happens then you\'re on your own'}`, 20000);
                                        let delet = async function(id = undefined) {
                                            await selectedChan.bulkDelete(1).catch((e) => {err = e})
                                            if(err){
                                                command(err.message, 3000)
                                                delet('')
                                            }
                                            else
                                                command(`Deleted 1 message older than 14 days`, 3000);
                                        }
                                        if(args[1] == 'true'){
                                            for(let i in '.'.repeat(messages)){
                                                delet()
                                            }
                                        }
                                    }
                                    else if (err)
                                        command(err.message, 500);
                                    else
                                        command(`Deleted ${messages} ${messages == 1 ? 'message' : 'messages'}`, 5000)
                                }
                                for(let i of '.'.repeat(num).match(/.{1,100}/g))
                                    await delet(0, i.length);
                                return undefined;
                            })();
                        }
                    }
                    else{
                        (async () => {
                            let delet = async function(tries = 0){
                                if(tries >= 5)
                                        return command('Exceeded the limit of 5 retries', 2000)

                                let err = undefined;
                                await selectedChan.bulkDelete(1).catch(e => {err = e});

                                if(err && err.message == 'Unknown Message'){
                                    command(`Message failed to delete, trying again`, 3000)
                                    delet(++tries);
                                }
                                else if (err)
                                    command(err.message, 5000)
                                else
                                    command(`Deleted 1 message`, 5000)
                            }
                            return delet()
                        })();
                    }
                break;
                case 'eval':
                    try {
                        command(`📥 Eval \n ${msg} \n\n 📤 Output \n ${eval(msg)}`);
                    } catch (err) {
                        command(`📥 Eval \n ${msg} \n\n 📤 Output \n ${err}`);
                    }
                    document.getElementById('msgbox').value = '';
                break;
                default:
                    // Make a new message with the sent text
                    text = parseSend(text);
                    selectedChan.send(text).catch(errorHandler);
                break;
            }
            document.getElementById('msgbox').value = '';
            selectedChan.stopTyping(true);
        } else {
            // Make a new message with the sent text
            text = parseSend(text);
            selectedChan.send(text).catch(errorHandler);
            setTimeout(() => {
                document.getElementById('msgbox').value = '';
                selectedChan.stopTyping(true);
            },1);
        }
    }
    return false;
};