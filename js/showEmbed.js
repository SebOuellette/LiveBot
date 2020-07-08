const { RichEmbed } = require("discord.js");

/*
This is the embed type chooser
First it gets the order the embed is supposed to be in and then it reads the values
Values:
0 - Is this important to make an embed, if not then it's most likely an image or a video
1 - What class is supposed to be used on here if any
*/


let fileTypes = {
    'image': ['png', 'jpeg', 'jpg', 'webp'],
    'video': ['mp4', 'webm', 'mov', 'gif', 'gifv'],
    'audio': ['mp3', 'wav', 'flac', 'ogg']
}

let embedTypes = {
    'rich': {
        'color': [true],
        'thumbnail': [true],
        'author': [true],
        'provider': [true],
        'title': [true],
        'description': [true],
        'fields': [true],
        'image': [true],
        'footer': [true],
        'url': [true],
        'video': [true]
    },
    'image': {
        'author': [false],
        'color': [false],
        'description': [false],
        'fields': [false],
        'footer': [false],
        'image': [false],
        'provider': [false],
        'thumbnail': [false],
        'timestamp': [false],
        'title': [false]
    },
    'video': {
        'provider': [false],
        'author': [false],
        'title': [false],
        'description': [false],
        'thumbnail': [false],
        'video': [false]
    },
    'gifv': {
        'provider': [false],
        'author': [false],
        'title': [false],
        'description': [false],
        'thumbnail': [false],
        'video': [false]
    },
    'article': {
        'color': [true],
        'provider': [true],
        'author': [true],
        'title': [true],
        'description': [true],
        'thumbnail': [true],
    },
    'link': {
        'color': [true],
        'thumbnail': [true],
        'author': [false],
        'provider': [true],
        'title': [true],
        'description': [true],
        'fields': [true],
        'image': [false],
        'footer': [true],
        'url': [false],
        'video': [true]
    }
}

let showEmbed = (embed, element, msg) => {
    let type = embed.type;
    if(['rich', 'link'].includes(type)){
        showRichEmbed(embed, msg, element, type);
    } else if (['article'].includes(type)){
        showArticleEmbed(embed, msg, element);
    } else if (['image'].includes(type)){
        showImageEmbed(embed, msg, element);
    } else if (['gifv', 'video'].includes(type)){
        showVideoEmbed(embed, msg, element);
    } else {
        showRichEmbed(embed, msg, element);
    }
}

let showRichEmbed = (embed, msg, element, type) => { 
    let embedCont = document.createElement("div");
    element.appendChild(embedCont);

    embedCont.classList.add("embed");

    if (embed.color) {
        let color = embed.color.toString(16);
        color = "0".repeat(6 - color.length) + color;

        embedCont.style.borderColor = `#${color}`;
        
    }

    // Large or small icon
    if (embed.thumbnail) {
        if (type == 'embed'){
            let largeIcon = document.createElement("img");
            largeIcon.classList.add("embedLargeIcon");
            largeIcon.src = embed.thumbnail.url;
            embedCont.appendChild(largeIcon);
        } else {
            let largeIcon = document.createElement("img");
            largeIcon.classList.add("embedSmallIcon");
            largeIcon.src = embed.thumbnail.url;
            embedCont.appendChild(largeIcon);
        }

    }

    // Embed author information
    if (embed.author) {
        let authorContainer = document.createElement("div");
        authorContainer.classList.add("embedAuthor");
        embedCont.appendChild(authorContainer);

        if (embed.author.iconURL) {
            let authorImage = document.createElement("img");
            authorImage.classList.add("embedAuthorImg");
            authorImage.src = embed.author.iconURL;
            authorContainer.appendChild(authorImage);
        }

        let authorName = document.createElement("p");
        authorName.classList.add("embedAuthorName");
        let authorTextTmp = document.createTextNode(embed.author.name);
        authorName.appendChild(authorTextTmp);
        authorContainer.appendChild(authorName);
    }

    if(embed.provider){
        let provider = document.createElement("p");
        provider.classList.add('embedContent');
        provider.classList.add("embedProvierName");
        provider.innerHTML = parseMessage(embed.provider.name, msg, true);
        embedCont.appendChild(provider);
    }

    // Title section
    if (embed.title) {
        if(!embed.url){
            let title = document.createElement("p");
            title.classList.add("embedTitle");
            title.innerHTML = parseMessage(embed.title, msg, true);
            embedCont.appendChild(title);
        } else {
            let title = document.createElement("a");
            title.classList.add("embedTitle");
            title.href = embed.url;
            title.innerHTML = parseMessage(embed.title, msg, true);
            embedCont.appendChild(title);
        }
    }

    if (embed.description) {
        let description = document.createElement("p");
        let text = parseMessage(embed.description, msg, true, true, true);
        description.classList.add("embedDescription");
        description.classList.add("embedContent");
        description.innerHTML = text
        embedCont.appendChild(description);
    }

    // Fields
    embed.fields.forEach((field) => {
        let fieldCont = document.createElement("div");
        fieldCont.classList.add("field");
        embedCont.appendChild(fieldCont);

        let fieldTitle = document.createElement("p");
        fieldTitle.classList.add("fieldName");
        fieldTitle.classList.add("embedContent");
        fieldTitle.innerHTML = parseMessage(field.name, msg, true);
        fieldCont.appendChild(fieldTitle);

        let fieldValue = document.createElement("p");
        let text = parseMessage(field.value, msg, true, true, true);
        fieldValue.classList.add("fieldText");
        fieldValue.classList.add("embedContent");
        fieldValue.innerHTML = text
        fieldCont.appendChild(fieldValue);

        if (field.inline) {
            fieldCont.style.display = "inline-block";
        }
    });

    //Image
    if (embed.image) {
        let img = document.createElement("img");
        img.classList.add("embedImage");
        img.src = embed.image.url;
        embedCont.appendChild(img);
    }

    // Footer
    if (embed.footer) {
        let footCont = document.createElement("div");
        footCont.classList.add("footer");
        embedCont.appendChild(footCont);

        let footText = document.createElement("p");
        footText.classList.add("footerText");
        footText.innerHTML = parseMessage(embed.footer.text,  msg, true);
        footCont.appendChild(footText);
    }
}

let showArticleEmbed = (embed, msg, element) => { 
    let embedCont = document.createElement("div");
    element.appendChild(embedCont);
    
    embedCont.classList.add("embed");

    if(embed.provider){
        let provider = document.createElement("p");
        provider.classList.add('embedContent');
        provider.classList.add("embedProvierName");
        provider.innerHTML = parseMessage(embed.provider.name, msg, true);
        embedCont.appendChild(provider);
    }

    // Title section
    if (embed.title) {
        let title = document.createElement("a");
        title.classList.add("embedTitle");
        title.href = embed.url;
        title.innerHTML = parseMessage(embed.title, msg, true);
        embedCont.appendChild(title);
    }

    if (embed.description) {
        let description = document.createElement("p");
        description.classList.add("embedDescription");
        description.classList.add("embedContent");
        description.innerHTML = parseMessage(embed.description, msg, true, true, true);
        embedCont.appendChild(description);
    }

    // Large Icon
    if (embed.thumbnail) {
        let largeIcon = document.createElement("img");
        largeIcon.classList.add("embedArticleLargeIcon");
        largeIcon.src = embed.thumbnail.url;
        embedCont.appendChild(largeIcon);
    }
}


let showImageEmbed = (embed, msg, element) => { 
    let img = document.createElement("img");

    let newWidth = embed.thumbnail.width < 400 ? embed.thumbnail.width : 400;
    let newHeight = Math.floor(newWidth / embed.thumbnail.width * embed.thumbnail.height);

    img.src = `${embed.thumbnail.proxyURL}?width=${newWidth}&height=${newHeight}`;
    img.classList.add("previewImage");

    element.appendChild(img);
}

let showVideoEmbed = (embed, msg, element) => { 
    let video = document.createElement("video");

    let newHeight = embed.video.height < 300 ? embed.video.height : 400;

    video.style.height = newHeight + 'px';
    video.style.width = 'auto';

    let url = embed.video.proxyURL ? embed.video.url : embed.video.url;
    video.src = url;
    video.classList.add("previewImage");
    
    video.onmouseenter = e => {
        video.setAttribute('controls', 'true');
    }

    video.onmouseleave = e => {
        video.removeAttribute('controls');
    }
    
    video.onclick = e => {
        video.paused ? video.play() : video.pause();
    }

    video.onended = e => {
        video.currentTime = 0;
    }

    element.appendChild(video);
}