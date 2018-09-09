global.Discord = require('discord.js');
let selectedGuild;
let selectedChan;
let selectedChatDiv;
let oldimg;
let barry = false;
const remote = require('electron').remote;
const fs = require('fs');
require('electron-titlebar');

function create() {

  document.getElementById("msgbox")
    .addEventListener("keyup", function(event) {
      if (event.keyCode === 13) {
        sendmsg();
      }
    });

  document.getElementById("usernameBox")
    .addEventListener("keyup", function(event) {
      if (event.keyCode === 13) {
        options('username', document.getElementById('usernameBox').value);
        document.getElementById("usernameBox").value = '';
      }
    });

  document.getElementById("tokenbox")
    .addEventListener("keyup", function(event) {
      if (event.keyCode === 13) {
        setToken();
      }
    });

    load(localStorage.getItem('livebot-token'));
}

function load(token) {

  global.bot = new Discord.Client();
  bot.login(token);
  document.getElementById('userCardName').innerHTML = 'Logging in';

  bot.on('ready', () => {
    try {
      console.log(`Logged in as ${bot.user.tag}`);
    } catch (err) {
      console.log('Invalid Token');
      return;
    }

    document.getElementById('userCardName').innerHTML = bot.user.username;
    document.getElementById('userCardDiscrim').innerHTML = `#${bot.user.discriminator}`;
    document.getElementById('userCardIcon').src = `${bot.user.displayAvatarURL}`;
    if (bot.user.bot) {
      document.getElementById('userCardBot').innerHTML = `BOT`;
      document.getElementById('userCardBot').style.marginLeft = `8px`;
    } else {
      document.getElementById('userCardBot').innerHTML = `USER`;
      document.getElementById('userCardBot').style.marginLeft = `5px`;
    }

    bot.guilds.forEach(g => {


      if (g.iconURL === null) {

        let img = document.createElement('div');
        img.style.height = '40px';
        img.style.width = '40px';
        img.id = `guild-icon`;
        img.style.backgroundColor = '#2F3136';
        img.style.marginBottom = '4px';
        img.classList.add(g.id);
        img.onclick = function(){guildSelect(g, this); selectedGuild = g};
        img.onmouseover = function(){img.style.borderRadius = '25%'};
        img.onmouseleave = function(){if(selectedGuild == g){img.style.borderRadius = '25%'}else{img.style.borderRadius = '50%'}};
        document.getElementById('guild-list').appendChild(img);

        let abrev = document.createElement('p');
        abrev.id = 'guildAbrev';
        abrev.appendChild(document.createTextNode(g.nameAcronym));
        img.appendChild(abrev);
      } else {
        let img = document.createElement('img');
        let ico;
        ico = g.iconURL;
        img.src = ico;
        img.alt = g.name;
        img.title = g.name;
        img.height = '40';
        img.width = '40';
        img.style.height = '40px';
        img.style.width = '40px';
        img.id = `guild-icon`;
        img.classList.add(g.id);
        img.onclick = function(){guildSelect(g, this); selectedGuild = g};
        img.onmouseover = function(){img.style.borderRadius = '25%'};
        img.onmouseleave = function(){if(selectedGuild == g){img.style.borderRadius = '25%'}else{img.style.borderRadius = '50%'}};
        document.getElementById('guild-list').appendChild(img);
      }
    });
  });

  bot.on('message', (m) => {
    if (selectedChan) {
      if (m.channel.id == selectedChan.id) {
        //document.getElementById('message-list').removeChild(document.getElementById('message-list').firstChild);
        let bunch;
        fetchLast();

        async function fetchLast() {
          await m.channel.fetchMessages({limit: 2}).then(msg => {
            if(msg.map(mseg => mseg)[1].author.id == m.author.id) {
              bunch = true;
            } else {
              bunch = false;
            }
          });

          let scroll = false;
          if(document.getElementById('message-list').scrollHeight - document.getElementById('message-list').scrollTop == document.getElementById('message-list').clientHeight) {
            scroll = true;
          }

          if (barry) {
            bunch = false;
            barry = false;
          }

          let div;
          if (!bunch) {
            div = document.createElement('div');
            div.id = 'messageCont';
            div.classList.add(m.author.id);
            document.getElementById('message-list').appendChild(div);

            let img = document.createElement('img');
            img.id = 'messageImg';
            img.src = m.author.displayAvatarURL;
            div.appendChild(img);

            let name = document.createElement('p');
            let username = document.createTextNode(m.member.displayName);

            name.appendChild(username);
            name.id = 'messageUsername';
            try {
              let color = m.member.roles.sort((r1, r2) => r1.position - r2.position).map(p => p.color).length;
              let colors = m.member.roles.sort((r1, r2) => r1.position - r2.position).map(p => p.color);
              while (colors[color-1] == 0) {
                color -= 1;
              }
              let zeros = '';
              for(i=0;i<(6-colors[color-1].toString(16).length);i++) {
                zeros+='0';
              }
              name.style.color = `#${zeros+colors[color-1].toString(16)}`;
            } catch (err) {
              name.style.color = '#fff';
            }
            div.appendChild(name);
          } else {
            div = document.getElementsByClassName(m.author.id);
            div = div[div.length - 1]
          }

          let text = document.createElement('p');

          let content = document.createTextNode(m.cleanContent);
          text.appendChild(content);
          text.id = 'messageText';
          div.appendChild(text);
          if (scroll == true) {
            document.getElementById('message-list').scrollTop = document.getElementById('message-list').scrollHeight;
            scroll = false;
          }
        }
      }
    }
  });
}

function guildSelect(g, img) {
  // Update the selected guild
  document.getElementById('guildIndicator').style.display = 'block';
  try {
    oldimg.classList.remove('selectedGuild');
    oldimg.style.borderRadius = '50%';
  } catch (err){}
  img.classList.add('selectedGuild');

  function guildPos(id) {
    return id == g.id;
  }

  document.getElementById('guildIndicator').style.marginTop = `${bot.guilds.map(gu => `${gu.id}`).findIndex(guildPos)*44+4}px`;
  img.style.borderRadius = '25%';

  oldimg = img;

  // Update the message count

  try {
    clearInterval(memberLoop);
  } catch(err){}
  global.memberLoop = setInterval(function(){
    document.getElementById('members-count').innerHTML = g.memberCount;
  },500)

  document.getElementById('members-count').innerHTML = g.memberCount;

  // Clear the channels list

  let channelList = document.getElementById("channel-elements");
  while (channelList.firstChild) {
      channelList.removeChild(channelList.firstChild);
  }

  // Update guild profile

  if (g.name.length <= 22) {
    document.getElementById('guildName').innerHTML = g.name;
  } else {
    document.getElementById('guildName').innerHTML = g.name.substring(0, 19)+'...';
  }

  if (g.iconURL != null) {
    document.getElementById('guildImg').src = g.iconURL;
  } else {
    document.getElementById('guildImg').src = 'images/default.png';
  }

  let textPlaced = false;
  let voicePlaced = false;

  // List all categorised channels

  g.channels.sort((c1, c2) => c1.position - c2.position).forEach(c => {

    g.channels.forEach(c1 => {
      if (c1.type === 'text' && c1.parent === null && textPlaced == false) {
       let div = document.createElement('div');
       div.id = 'channel';
       document.getElementById('channel-elements').appendChild(div);

       let text = document.createElement('h5');
       let content;
       if (c1.name.length < 25) {
         content = document.createTextNode(`# ${c1.name}`);
       } else {
         content = document.createTextNode(`# ${c1.name.substring(0,25)}...`);
       }
       text.appendChild(content);
       if (!c1.permissionsFor(g.me).has("VIEW_CHANNEL")) {
         text.style.textDecoration = 'line-through';
         text.classList.add('blockedText');
       } else {
         text.classList.add('viewableText');
         text.onclick = function(){channelSelect(c1, text)};
       }
       text.id = 'channelTextx';
       div.appendChild(text);

     } else if (c1.type === 'voice' && c1.parent === null && voicePlaced == false) {
       let div = document.createElement('div');
       div.id = 'voice';
       document.getElementById('channel-elements').appendChild(div);

       let text = document.createElement('h5');
       let content;
       if (c1.name.length < 25) {
         content = document.createTextNode(`🔊 ${c1.name}`);
       } else {
         content = document.createTextNode(`🔊 ${c1.name.substring(0,25)}...`);
       }
       text.appendChild(content);
       if (!c1.permissionsFor(g.me).has("VIEW_CHANNEL")) {
         text.style.textDecoration = 'line-through';
         text.classList.add('blockedVoice');
       } else {
         text.classList.add('viewableVoice');
         text.onclick = function(){channelSelect(c1, text)};
       }
       text.id = 'channelVoicex';
       div.appendChild(text);
     }
   });
   textPlaced = true;
   voicePlaced = true;
    if (c.type === null) {

      // Categories
      let div = document.createElement('div');
      div.id = 'category';
      document.getElementById('channel-elements').appendChild(div);

      let text = document.createElement('h5');
      let content;
      if (c.name.length < 25) {
        content = document.createTextNode(`⌄ ${c.name.toLowerCase()}`);
      } else {
        content = document.createTextNode(`⌄ ${c.name.substring(0,25).toLowerCase()}...`);
      }
      text.appendChild(content);
      text.id = 'categoryText';
      div.appendChild(text);

      // Categorized text channels
      g.channels.filter(c1 => c1.parent == c && c1.type === 'text').sort((c1, c2) => c1.position - c2.position).forEach(c1 => {
        let div1 = document.createElement('div');
        div1.id = 'channel';
        div.appendChild(div1);

        let text1 = document.createElement('h5');
        let content1;
        if (c1.name.length < 25) {
          content1 = document.createTextNode(`# ${c1.name}`);
        } else {
          content1 = document.createTextNode(`# ${c1.name.substring(0,25)}...`);
        }
        text1.appendChild(content1);
        if (!c1.permissionsFor(g.me).has("VIEW_CHANNEL")) {
          text1.style.textDecoration = 'line-through';
          text1.classList.add('blockedText');
        } else {
          text1.classList.add('viewableText');
          text1.onclick = function(){channelSelect(c1, text1)};
        }
        text1.id = 'channelText';
        div1.appendChild(text1);
      });
      // Categorized voice channels
      g.channels.filter(c1 => c1.parent == c && c1.type === 'voice').sort((c1, c2) => c1.position - c2.position).forEach(c1 => {
        let div1 = document.createElement('div');
        div1.id = 'voice';
        div.appendChild(div1);

        let text1 = document.createElement('h5');
        let content1;
        if (c1.name.length < 25) {
          content1 = document.createTextNode(`🔊 ${c1.name}`);
        } else {
          content1 = document.createTextNode(`🔊 ${c1.name.substring(0,25)}...`);
        }
        text1.appendChild(content1);
        if (!c1.permissionsFor(g.me).has("VIEW_CHANNEL")) {
          text1.style.textDecoration = 'line-through';
          text1.classList.add('blockedVoice');
        } else {
          text1.classList.add('viewableVoice');
          text1.onclick = function(){channelSelect(c1, text1)};
        }
        text1.id = 'channelVoice';

        div1.appendChild(text1);
      });
    }
  });

}

function channelSelect(c, name) {
  let memberlist = document.getElementById("member-list");
  while (memberlist.firstChild) {
      memberlist.removeChild(memberlist.firstChild);
  }


  let messages = document.getElementById("message-list");
  while (messages.firstChild) {
      messages.removeChild(messages.firstChild);
  }
  try {
    selectedChanDiv.style.color = '#606266';
    name.addEventListener('mouseover', () => {
      if (name.style.color != 'rgb(238, 238, 238)') {
        name.style.color = '#B4B8BC';
      }
    });

    name.addEventListener('mouseleave', () => {
      if (name.style.color != 'rgb(238, 238, 238)') {
        name.style.color = '#606266';
      }
    });

  } catch (err) {console.log(err)}
  selectedChan = c;
  selectedChanDiv = name;

  var onlinelist = document.createElement('div');
  var onlinelabel = document.createElement('p');
  onlinelabel.style.fontWeight = 'bold';
  var onlinetxt = document.createTextNode('ONLINE');
  onlinelabel.appendChild(onlinetxt)
  onlinelist.appendChild(onlinelabel)

  var offlinelist = document.createElement('div');
  var offlinelabel = document.createElement('p');
  offlinelabel.style.fontWeight = 'bold';
  var offlinetxt = document.createTextNode('OFFLINE');
  offlinelabel.appendChild(offlinetxt)
  offlinelist.appendChild(offlinelabel)

  memberlist.appendChild(onlinelist)
  memberlist.appendChild(offlinelist)

  c.members.forEach(function(member){
    var memberele = document.createElement("p");
    memberele.style.color = member.displayHexColor;
    memberele.title = member.user.tag + ' (' + member.id + ')';
    var membername = document.createTextNode(member.displayName);
    var membericon = document.createElement("img");
    membericon.src = member.user.displayAvatarURL;
    membericon.width = 16;
    membericon.height = 16;
    membericon.style.paddingRight = '4px';
    membericon.style.borderRadius = '50%';
    memberele.appendChild(membericon);
    memberele.appendChild(membername);
    if (member.user.presence.status != 'offline') {
      onlinelist.appendChild(memberele);
    } else {
      offlinelist.appendChild(memberele);
    }
  })

  console.log(selectedChanDiv.style.color);
  name.style.color = '#eee';
  messageCreate();
  async function messageCreate() {
    let count=0;
    await c.fetchMessages({limit: 50})
      .then(msg => {
        msg.map(mseg => mseg).reverse().forEach(m => {
          let bunch;
          count+=1;
          if (count > 2 && count <= 50) {
            if(msg.map(mesg => mesg).reverse()[count-2].author.id == m.author.id){
              bunch = true;

            } else {
              bunch = false;
            }

          }

          let div;
          if (!bunch) {

            div = document.createElement('div');
            div.id = 'messageCont';
            div.classList.add(m.author.id);
            document.getElementById('message-list').appendChild(div);

            let img = document.createElement('img');
            img.id = 'messageImg';
            img.src = m.author.displayAvatarURL;
            img.height = '40';
            img.width = '40';
            div.appendChild(img);

            let name = document.createElement('p');
            let username = document.createTextNode(m.author.username);
            name.appendChild(username);
            name.id = 'messageUsername';
            try {
              let color = m.member.roles.sort((r1, r2) => r1.position - r2.position).map(p => p.color).length;
              let colors = m.member.roles.sort((r1, r2) => r1.position - r2.position).map(p => p.color);
              while (colors[color-1] == 0) {
                color -= 1;
              }
              let zeros = '';
              for(i=0;i<(6-colors[color-1].toString(16).length);i++) {
                zeros+='0';
              }
              name.style.color = `#${zeros+colors[color-1].toString(16)}`;
            } catch (err) {
              name.style.color = '#fff';
            }
            div.appendChild(name);
          } else {
            div = document.getElementsByClassName(m.author.id);
            div = div[div.length - 1];
          }

          let text = document.createElement('p');
          let content = document.createTextNode(m.cleanContent);
          text.appendChild(content);
          text.id = 'messageText';
          div.appendChild(text);
        });
      }
    );
    messages.scrollTop = messages.scrollHeight;
  }
}

function command(text) {
  let div = document.createElement('div');
  div.id = 'messageCont';
  div.classList.add('barryCommand');
  div.style.backgroundColor = 'rgba(50,50,50,0.4)';
  document.getElementById('message-list').appendChild(div);

  let img = document.createElement('img');
  img.id = 'messageImg';
  img.src = './images/Barry.png';
  div.appendChild(img);

  let name = document.createElement('p');
  let username;

  username = document.createTextNode('Barry');
  name.appendChild(username);
  name.id = 'messageUsername';
  name.style.color = `#999999`;
  div.appendChild(name);

  let text2 = document.createElement('p');

  console.log(text);
  if (text.split('\n').length > 1) {
    for(i=0;i<text.split('\n').length;i++) {
      let content = document.createTextNode(text.split('\n')[i]);
      text2.appendChild(content);
      text2.id = 'messageText';

      let contentBreak = document.createElement('br');
      text2.appendChild(contentBreak);
    }
  } else {
    let content = document.createTextNode(text);
    text2.appendChild(content);
    text2.id = 'messageText';
  }
  div.appendChild(text2);
  document.getElementById('message-list').scrollTop = document.getElementById('message-list').scrollHeight;
  document.getElementById('msgbox').value = '';
  barry = true;
}

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
      let msg = text.split(' ').splice(1).join(' ')
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
          command('🏓 | Pong! The heartbeat is '+bot.ping+'ms.');
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
      selectedChan.send(text);
      document.getElementById('msgbox').value = '';
    }
  }
  return false;
}

async function setToken() {
  let client = new Discord.Client()
  try{
    await client.login(document.getElementById('tokenbox').value);
    client.destroy();

    let channels = document.getElementById('channel-elements');
    while (channels.firstChild) {
      channels.removeChild(channels.firstChild);
    }

    let guilds = document.getElementById('guild-list');
    while (guilds.firstChild) {
      guilds.removeChild(guilds.firstChild);
    }

    let messages = document.getElementById('message-list');
    while (messages.firstChild) {
      messages.removeChild(messages.firstChild);
    }

    div = document.createElement('div');
    div.id = 'guildIndicator';
    document.getElementById('guild-list').appendChild(div);

    bot.destroy();
    load(document.getElementById('tokenbox').value);
    document.getElementById('tokenbox').style.borderColor = '#484B51';
  }catch(err){
    document.getElementById('tokenbox').style.borderColor = '#f00';
  }
  document.getElementById('tokenbox').value = '';
}

function savetoken() {
  localStorage.setItem('livebot-token', document.getElementById('tokenbox').value);
  setToken();
}

function typing() {

}

function options(type, content) {
  switch(type) {
    case 'username':
      bot.user.setUsername(content);
      document.getElementById('userCardName').innerHTML = content;
    break;

    case 'invite':
      selectedChan.createInvite().then(invite => {command('Created invite for '+invite.guild.name+' \nhttps://discord.gg/'+invite.code);})

    break;
  }
}
