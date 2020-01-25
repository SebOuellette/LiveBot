let helpMsg = [
        'Here is a list of available commands. \n',
        '/help - Lists all commands.',
        '/shrug - Prepends ¯\\_(ツ)_/¯ to your message.',
        '/tableflip - Prepends (╯°□°）╯︵ ┻━┻ to your message.',
        '/ping - Check the hearbeat to discord.',
        '/server - Get some info about the server.',
        '/eval - Execute a command.'
    ].join('\n')
  
// Commands  
function sendmsg() {
    if (selectedChan) {
        let text = document.getElementById('msgbox').value;
        if (text.substring(0,1) == '/') {
            let cmd = text.split(' ')[0].substring(1);
            let msg = text.split(' ').splice(1).join(' ');
            
            switch (cmd) {
                case 'help':
                    command(helpMsg);
                break;
        
                case 'shrug':
                    selectedChan.send('¯\\_(ツ)_/¯ '+msg);
                    document.getElementById('msgbox').value = '';
                break;
        
                case 'tableflip':
                    selectedChan.send('(╯°□°）╯︵ ┻━┻ '+msg);
                    document.getElementById('msgbox').value = '';
                break;
        
                case 'ping':
                    command('🏓 | Pong! The heartbeat is '+Math.round(bot.ping)+'ms.');
                break;
        
                case 'server':
                    let serverinfo = [
                            'Here is some info about '+selectedChan.guild.name+'. \n',
                            'Members - '+selectedChan.guild.memberCount,
                            'Channels - '+selectedChan.guild.channels.size,
                            'Roles - '+selectedChan.guild.roles.size,
                            'Id - '+selectedChan.guild.id,
                            'Owner - '+selectedChan.guild.owner.user.tag
                        ].join('\n');
                    command(serverinfo);
                break;
        
                case 'eval':
                    try {
                        command(`📥 Eval \n ${msg} \n\n 📤 Output \n ${eval(msg)}`);
                    } catch (err) {
                        command(`📥 Eval \n ${msg} \n\n 📤 Output \n ${err}`);
                    }
                    document.getElementById('msgbox').value = '';
                break;
            }
        } else {
            // Make a new message with the sent text
            selectedChan.send(text);
            document.getElementById('msgbox').value = '';
        }
    }
    return false;
}