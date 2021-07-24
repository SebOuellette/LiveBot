// Copyright 2017 Sebastian Ouellette

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use strict";

let command = (text, del = NaN) => {
    let div = document.createElement('div');
    div.id = 'messageCont';
    div.classList.add('barryCommand');
    div.style.backgroundColor = 'rgba(50,50,50,0.4)';
    document.getElementById('message-list').appendChild(div);

    let img = document.createElement('img');
    img.classList.add('messageImg');
    img.classList.add('barryImg');
    img.src = './resources/images/Barry.png';
    div.appendChild(img);

    let inlineContainer = document.createElement('div');
    inlineContainer.classList.add('inlineMsgCont');
    div.appendChild(inlineContainer);

    let name = document.createElement('p');
    let username;

    username = document.createTextNode('Barry');
    name.appendChild(username);
    name.id = 'messageUsername';
    name.style.color = `#999999`;
    inlineContainer.appendChild(name);

    let text2 = document.createElement('p');

    console.log(text);
    if (text.split('\n').length > 1) {
        for (i = 0; i < text.split('\n').length; i++) {
            text2.innerHTML += parseMessage(text.split('\n')[i]);
            text2.classList.add('messageText');

            let contentBreak = document.createElement('br');
            text2.appendChild(contentBreak);
        }
    } else {
        text2.innerHTML = parseMessage(text);
        text2.classList.add('messageText');
    }
    inlineContainer.appendChild(text2);
    document.getElementById('message-list').scrollTop = document.getElementById(
        'message-list'
    ).scrollHeight;
    document.getElementById('msgbox').value = '';
    barry = true;
    if (del && del > 1)
        setTimeout(() => {
            document.getElementById('message-list').removeChild(div);
        }, del);
};
