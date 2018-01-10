global.Discord = require('discord.js');
let selected;
let oldimg;

function load() {
  let bot = new Discord.Client();
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
      img.onclick = function(){guildSelect(g, this)};

      document.getElementById('guild-list').appendChild(img);
    });
  });
}

function guildSelect(g, img) {
  console.log(img.classList.value.split(' ')[1]);
  try {
    oldimg.classList.remove('selectedGuild');
  } catch (err){}
  img.classList.add('selectedGuild');
  oldimg = img;

  let channelList = document.getElementById("channel-list");
  while (channelList.firstChild) {
      channelList.removeChild(channelList.firstChild);
  }

  let textPlaced = false;
  let voicePlaced = false;

  g.channels.sort((c1, c2) => c1.position - c2.position).forEach(c => {

    g.channels.forEach(c1 => {
      if (c1.type === 'text' && c1.parent === null && textPlaced == false) {
       let div = document.createElement('div');
       div.id = 'channel';
       document.getElementById('channel-list').appendChild(div);

       let text = document.createElement('h5');
       let content = document.createTextNode(`# ${c1.name}`);
       text.appendChild(content);
       if (!c1.permissionsFor(g.me).has("VIEW_CHANNEL")) {
         text.style.textDecoration = 'line-through';
         text.classList.add('blockedText');
       } else {
         text.classList.add('viewableText');
       }
       text.id = 'channelText';
       div.appendChild(text);
     } else if (c1.type === 'voice' && c1.parent === null && voicePlaced == false) {
       let div = document.createElement('div');
       div.id = 'voice';
       document.getElementById('channel-list').appendChild(div);

       let text = document.createElement('h5');
       let content = document.createTextNode(`🔊 ${c1.name}`);
       text.appendChild(content);
       if (!c1.permissionsFor(g.me).has("VIEW_CHANNEL")) {
         text.style.textDecoration = 'line-through';
         text.classList.add('blockedVoice');
       } else {
         text.classList.add('viewableVoice');
       }
       text.id = 'channelVoice';
       div.appendChild(text);
     }
   });
   textPlaced = true;
   voicePlaced = true;
    if (c.type === null) {

      let div = document.createElement('div');
      div.id = 'category';
      document.getElementById('channel-list').appendChild(div);

      let text = document.createElement('h5');
      let content = document.createTextNode(`⌄ ${c.name.toLowerCase()}`);
      text.appendChild(content);
      text.id = 'categoryText';
      div.appendChild(text);

      g.channels.filter(c1 => c1.parent == c && c1.type === 'text').sort((c1, c2) => c1.position - c2.position).forEach(c1 => {
        let div1 = document.createElement('div');
        div1.id = 'channel';
        div.appendChild(div1);

        let text1 = document.createElement('h5');
        let content1 = document.createTextNode(`# ${c1.name}`);
        text1.appendChild(content1);
        if (!c1.permissionsFor(g.me).has("VIEW_CHANNEL")) {
          text1.style.textDecoration = 'line-through';
          text1.classList.add('blockedText');
        } else {
          text1.classList.add('viewableText');
        }
        text1.id = 'channelText';
        div1.appendChild(text1);
      });

      g.channels.filter(c1 => c1.parent == c && c1.type === 'voice').sort((c1, c2) => c1.position - c2.position).forEach(c1 => {
        let div1 = document.createElement('div');
        div1.id = 'voice';
        div.appendChild(div1);

        let text1 = document.createElement('h5');
        let content1 = document.createTextNode(`🔊 ${c1.name}`);
        text1.appendChild(content1);
        if (!c1.permissionsFor(g.me).has("VIEW_CHANNEL")) {
          text1.style.textDecoration = 'line-through';
          text1.classList.add('blockedVoice');
        } else {
          text1.classList.add('viewableVoice');
        }
        text1.id = 'channelVoice';
        div1.appendChild(text1);
      });
    }
  });

}
