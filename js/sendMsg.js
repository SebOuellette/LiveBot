let helpMsg = [
    'Here is a list of available commands. \n',
    '/help - Lists all commands.',
    '/shrug - Prepends ¯\\_(ツ)_/¯ to your message.',
    '/tableflip - Prepends (╯°□°）╯︵ ┻━┻ to your message.',
    '/unflip - Prepends (╯°□°）╯︵ ┻━┻  to your message.',
    '/lenny - Prepends ( ͡° ͜ʖ ͡°) to your message.',
    '/me - Displays text with emphasis',
    '/ping - Check the hearbeat to discord.',
    '/delete - Deletes 1 message if there is no number',
    '/server - Get some info about the server.',
    '/eval - Execute a command.'
].join('\n')


// Commands  
function sendmsg() {
    if (selectedChan) {
        let text = document.getElementById('msgbox').innerText;
        if (text.substring(0, 1) == '/') {
            let cmd = text.split(' ')[0].substring(1);
            let msg = text.split(' ').splice(1).join(' ');

            switch (cmd) {
                case 'help':
                    command(helpMsg);
                    break;

                case 'shrug':
                    selectedChan.send('¯\\_(ツ)_/¯ ' + msg);
                    document.getElementById('msgbox').innerText = '';
                    break;

                case 'tableflip':
                    selectedChan.send('(╯°□°）╯︵ ┻━┻ ' + msg);
                    document.getElementById('msgbox').innerText = '';
                    break;

                case 'unflip':
                    selectedChan.send('┬─┬ ノ( ゜-゜ノ)' + msg);
                    document.getElementById('msgbox').innerText = '';
                    break;

                case 'lenny':
                    selectedChan.send('( ͡° ͜ʖ ͡°) ' + msg);
                    document.getElementById('msgbox').innerText = '';
                    break;

                case 'me':
                    selectedChan.send('_' + msg + '_');
                    document.getElementById('msgbox').innerText = '';
                    break;

                case 'ping':
                    command('🏓 | Pong! The heartbeat is ' + Math.round(bot.ping) + 'ms.');
                    break;

                case 'delete':
                    if (msg.length == 0) {
                        selectedChan.bulkDelete(1)
                        command("1 message has been deleted")
                        document.getElementById('msgbox').innerText = '';
                        break;
                    } else {
                        var reg = /^\d+$/;
                        if (!reg.test(msg) || msg.length > 3 || msg.content > 400) {
                            command('It must be a number between 1 to 400')
                            break;
                        }
                        selectedChan.bulkDelete(msg)
                        command(msg + msg.content == 1 ? " message has been deleted" : `${msg} messages have been deleted`)
                        break;
                    }

                case 'server':
                    channels = {}
                    users = {}
                    selectedChan.guild.channels.forEach(e=> {channels[e.type] == undefined ? channels[e.type] = 1 : channels[e.type] += 1})
                    selectedChan.guild.members.forEach(e=> {users[e.user.bot] == undefined ? users[e.user.bot]  = 1 : users[e.user.bot]  += 1})
                    let serverinfo = [
                        'Here is some info about ' + selectedChan.guild.name + '. \n',
                        'Members - ' + selectedChan.guild.memberCount,
                        '   | Bots - ' + users[true] ,
                        '   | Users - ' + users[false],
                        'Channels - ' + (channels["text"] + channels["voice"]) ,
                        '   | Categories - ' + channels["category"] ,
                        '   | Text channels - ' + channels["text"] ,
                        '   | Voice channels - ' + channels["voice"],
                        'Roles - ' + selectedChan.guild.roles.size,
                        'Id - ' + selectedChan.guild.id,
                        'Owner - ' + selectedChan.guild.owner.user.tag
                    ].join('\n');
                    command(serverinfo);
                    break;

                case 'eval':
                    try {
                        command(`📥 Eval \n ${msg} \n\n 📤 Output \n ${eval(msg)}`);
                    } catch (err) {
                        command(`📥 Eval \n ${msg} \n\n 📤 Output \n ${err}`);
                    }
                    document.getElementById('msgbox').innerText = '';
                    break;
            }
        } else {
            // Make a new message with the sent text
            text = parseSend(text);
            selectedChan.send(text);
            document.getElementById('msgbox').innerText = '';
        }
    }
    return false;
}