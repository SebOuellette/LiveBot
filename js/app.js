global.Discord = require('discord.js');

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
      img.id = 'guild-icon';

      document.getElementById('guild-list').appendChild(img);

      g.channels.forEach(c => {
        if (c.type != 'dm' && c.type != 'group' && c.type != 'text' && c.type != 'voice') {
          let div = document.createElement('div');
          div.id = 'category';
          document.getElementById('channel-list').appendChild(div);

          let text = document.createElement('p');
          let content = document.createTextNode('succ');
          text.appendChild(content);
          text.id = c.name.toUpperCase();
          div.appendChild(text);
        }
        let div = document.createElement('div');
        div.id = 'category';
        document.getElementById('channel-list').appendChild(div);

        let text = document.createElement('h4');
        let content = document.createTextNode(c.name);
        text.appendChild(content);
        text.id = c.name.toUpperCase();
        div.appendChild(text);
      });
    });
  });
}
