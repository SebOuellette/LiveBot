let showEmbed = (embed, element) => {
    // Embed container
    let embedCont = document.createElement("div");
    embedCont.classList.add("embed");
    element.appendChild(embedCont);
    
    if (embed.color) {
        embedCont.style.borderColor = `#${embed.color.toString(16)}`;
    }

    // Large Icon
    if (embed.thumbnail) {
        let largeIcon = document.createElement("img");
        largeIcon.classList.add("embedLargeIcon");
        largeIcon.src = embed.thumbnail.url;
        embedCont.appendChild(largeIcon);
    }

    // Embed author information
    if (embed.author != null) {
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

    // Title section
    if (embed.title) {
        let title = document.createElement("p");
        title.classList.add("embedTitle");
        title.innerHTML = parseMessage(embed.title, true);
        embedCont.appendChild(title);
    }

    if (embed.description) {
        let description = document.createElement("p");
        description.classList.add("embedDescription");
        description.classList.add("embedContent");
        description.innerHTML = parseMessage(embed.description, true);
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
        fieldTitle.innerHTML = parseMessage(field.name, true);
        fieldCont.appendChild(fieldTitle);

        let fieldValue = document.createElement("p");
        fieldValue.classList.add("fieldText");
        fieldValue.classList.add("embedContent");
        fieldValue.innerHTML = parseMessage(field.value, true);
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
        footText.innerHTML = parseMessage(embed.footer.text, true);
        footCont.appendChild(footText);
    }
}