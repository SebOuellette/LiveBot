function command(text) {
    let div = document.createElement('div');
    div.id = 'messageCont';
    div.classList.add('barryCommand');
    div.style.backgroundColor = 'rgba(50,50,50,0.4)';
    document.getElementById('message-list').appendChild(div);
  
    let img = document.createElement('img');
    img.id = 'messageImg';
    img.src = './resources/images/Barry.png';
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