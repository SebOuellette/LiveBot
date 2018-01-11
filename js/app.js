global.Discord = require('discord.js');
let selectedGuild;
let selectedChan;
let oldimg;

function load() {
  global.bot = new Discord.Client();
  bot.login('');

  bot.on('ready', () => {
    bot.guilds.forEach(g => {
      let img = document.createElement('img');
      let ico;

      if (g.iconURL === null) {
        ico = 'images/default.png';
      } else {
        ico = g.iconURL;
      }

      img.src = ico;
      img.style.height = '40px';
      img.style.width = '40px';
      img.alt = g.name;
      img.title = g.name;
      img.id = `guild-icon`;
      img.classList.add(g.id);
      img.onclick = function(){guildSelect(g, this); selectedGuild = g};
      img.onmouseover = function(){img.style.borderRadius = '25%'};
      img.onmouseleave = function(){if(selectedGuild == g){img.style.borderRadius = '25%'}else{img.style.borderRadius = '50%'}};

      document.getElementById('guild-list').appendChild(img);
    });
  });

  bot.on('message', (m) => {
    if (selectedChan) {
      console.log('selected');
      if (m.channel.id == selectedChan.id) {
        document.getElementById('message-list').removeChild(document.getElementById('message-list').firstChild);

        let div = document.createElement('div');
        div.id = 'messageCont';
        div.classList.add(m.id);
        document.getElementById('message-list').appendChild(div);

        let img = document.createElement('img');
        img.id = 'messageImg';
        img.src = m.author.displayAvatarURL;
        div.appendChild(img);

        let name = document.createElement('p');
        let username;
        if (m.member.nickname) {
          username = document.createTextNode(m.member.nickname);
        } else {
          username = document.createTextNode(m.author.username);
        }
        name.appendChild(username);
        name.id = 'messageUsername';
        name.style.color = `#${m.member.roles.sort((r1, r2) => r1.position - r2.position).last().color.toString(16)}`;
        div.appendChild(name);

        let text = document.createElement('p');
        let content = document.createTextNode(m.content);
        text.appendChild(content);
        text.id = 'messageText';
        div.appendChild(text);

        document.getElementById('message-list').scrollTop = document.getElementById('message-list').scrollHeight;
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
  let messages = document.getElementById("message-list");
  while (messages.firstChild) {
      messages.removeChild(messages.firstChild);
  }
  selectedChan = c;
  messageCreate();
  async function messageCreate() {
    await c.fetchMessages({limit: 50})
      .then(msg => msg.forEach(m => {
        let div = document.createElement('div');
        div.id = 'messageCont';
        div.classList.add(m.id);
        document.getElementById('message-list').appendChild(div);
        document.getElementById('message-list').insertBefore(div, document.getElementById('message-list').firstChild);

        let img = document.createElement('img');
        img.id = 'messageImg';
        img.src = m.author.displayAvatarURL;
        div.appendChild(img);

        let name = document.createElement('p');
        let username;
        if (m.member.nickname) {
          username = document.createTextNode(m.member.nickname);
        } else {
          username = document.createTextNode(m.author.username);
        }
        name.appendChild(username);
        name.id = 'messageUsername';
        name.style.color = `#${m.member.roles.sort((r1, r2) => r1.position - r2.position).last().color.toString(16)}`;
        div.appendChild(name);

        let text = document.createElement('p');
        let content = document.createTextNode(m.content);
        text.appendChild(content);
        text.id = 'messageText';
        div.appendChild(text);
      })
    );
    messages.scrollTop = messages.scrollHeight;
  }
}
