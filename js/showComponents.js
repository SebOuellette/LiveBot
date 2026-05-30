'use strict';

// Renders all Discord message components including legacy action rows (buttons/selects)
// and Components V2 types (containers, sections, media galleries, text displays, etc.)

function renderComponents(components, container, msg) {
    for (const component of components) {
        renderComponent(component, container, msg);
    }
}

function renderComponent(component, container, msg) {
    switch (component.type) {
        case Discord.ComponentType.ActionRow:
            renderActionRow(component, container, msg);
            break;
        case Discord.ComponentType.Button:
            renderButton(component, container);
            break;
        case Discord.ComponentType.StringSelect:
        case Discord.ComponentType.UserSelect:
        case Discord.ComponentType.RoleSelect:
        case Discord.ComponentType.MentionableSelect:
        case Discord.ComponentType.ChannelSelect:
            renderSelect(component, container);
            break;
        case Discord.ComponentType.Section:
            renderSection(component, container, msg);
            break;
        case Discord.ComponentType.TextDisplay:
            renderTextDisplay(component, container, msg);
            break;
        case Discord.ComponentType.Thumbnail:
            renderThumbnail(component, container);
            break;
        case Discord.ComponentType.MediaGallery:
            renderMediaGallery(component, container);
            break;
        case Discord.ComponentType.File:
            renderFile(component, container);
            break;
        case Discord.ComponentType.Separator:
            renderSeparator(component, container);
            break;
        case Discord.ComponentType.Container:
            renderContainer(component, container, msg);
            break;
        default:
            break;
    }
}

function renderActionRow(row, container, msg) {
    const el = document.createElement('div');
    el.classList.add('componentActionRow');
    for (const child of row.components) {
        renderComponent(child, el, msg);
    }
    container.appendChild(el);
}

function renderButton(component, container) {
    const btn = document.createElement('button');
    btn.classList.add('componentButton');

    const styleMap = {
        [Discord.ButtonStyle.Primary]:   'btnPrimary',
        [Discord.ButtonStyle.Secondary]: 'btnSecondary',
        [Discord.ButtonStyle.Success]:   'btnSuccess',
        [Discord.ButtonStyle.Danger]:    'btnDanger',
        [Discord.ButtonStyle.Link]:      'btnLink',
        [Discord.ButtonStyle.Premium]:   'btnPremium',
    };

    const styleClass = styleMap[component.style];
    if (styleClass) btn.classList.add(styleClass);
    if (component.disabled) btn.classList.add('btnDisabled');

    if (component.emoji) {
        const emojiSpan = document.createElement('span');
        emojiSpan.classList.add('btnEmoji');
        if (component.emoji.id) {
            const ext = component.emoji.animated ? 'gif' : 'png';
            const emojiImg = document.createElement('img');
            emojiImg.src = `https://cdn.discordapp.com/emojis/${component.emoji.id}.${ext}?size=20`;
            emojiImg.classList.add('btnEmojiImg');
            emojiSpan.appendChild(emojiImg);
        } else if (component.emoji.name) {
            emojiSpan.textContent = component.emoji.name;
        }
        btn.appendChild(emojiSpan);
    }

    if (component.label) {
        const labelEl = document.createElement('span');
        labelEl.textContent = component.label;
        btn.appendChild(labelEl);
    }

    if (component.style === Discord.ButtonStyle.Link && component.url) {
        const linkIcon = document.createElement('span');
        linkIcon.classList.add('btnLinkIcon');
        linkIcon.textContent = '↗';
        btn.appendChild(linkIcon);
        btn.onclick = () => {
            require('electron').shell.openExternal(component.url);
        };
    } else if (component.style === Discord.ButtonStyle.Premium) {
        btn.title = 'Premium feature';
    } else if (component.customId) {
        btn.title = `Button ID: ${component.customId}`;
    }

    if (component.disabled) btn.disabled = true;

    container.appendChild(btn);
}

function renderSelect(component, container) {
    const wrap = document.createElement('div');
    wrap.classList.add('componentSelect');
    if (component.disabled) wrap.classList.add('selectDisabled');

    const placeholder = document.createElement('span');
    placeholder.classList.add('selectPlaceholder');
    placeholder.textContent = component.placeholder || 'Make a selection...';

    const arrow = document.createElement('span');
    arrow.classList.add('selectArrow');
    arrow.textContent = '▼';

    wrap.appendChild(placeholder);
    wrap.appendChild(arrow);
    container.appendChild(wrap);
}

function renderSection(component, container, msg) {
    const section = document.createElement('div');
    section.classList.add('componentSection');

    const textArea = document.createElement('div');
    textArea.classList.add('sectionTextArea');

    if (component.components) {
        for (const child of component.components) {
            renderComponent(child, textArea, msg);
        }
    }

    section.appendChild(textArea);

    if (component.accessory) {
        const accessoryEl = document.createElement('div');
        accessoryEl.classList.add('sectionAccessory');
        renderComponent(component.accessory, accessoryEl, msg);
        section.appendChild(accessoryEl);
    }

    container.appendChild(section);
}

function renderTextDisplay(component, container, msg) {
    const el = document.createElement('p');
    el.classList.add('componentTextDisplay');
    const content = component.content || '';
    el.innerHTML = parseMessage(content, msg, true, true, true);
    container.appendChild(el);
}

function renderThumbnail(component, container) {
    const wrap = document.createElement('div');
    wrap.classList.add('componentThumbnail');

    const url = component.media?.url || component.url;
    if (url) {
        const img = document.createElement('img');
        img.src = url;
        img.classList.add('thumbnailImage');
        if (component.description) img.alt = component.description;
        if (component.spoiler) img.classList.add('mediaSpoiler');
        wrap.appendChild(img);

        if (component.description) {
            const caption = document.createElement('p');
            caption.classList.add('mediaCaption');
            caption.textContent = component.description;
            wrap.appendChild(caption);
        }
    }

    container.appendChild(wrap);
}

function renderMediaGallery(component, container) {
    const gallery = document.createElement('div');
    gallery.classList.add('componentMediaGallery');

    const items = component.items || [];
    gallery.classList.add(`galleryCount${Math.min(items.length, 4)}`);

    for (const item of items) {
        const itemWrap = document.createElement('div');
        itemWrap.classList.add('galleryItem');

        const url = item.media?.url || item.url;
        if (url) {
            const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);
            if (isVideo) {
                const video = document.createElement('video');
                video.src = url;
                video.classList.add('galleryMedia');
                if (item.spoiler) video.classList.add('mediaSpoiler');
                video.onmouseenter = () => video.setAttribute('controls', 'true');
                video.onmouseleave = () => video.removeAttribute('controls');
                video.onclick = () => video.paused ? video.play() : video.pause();
                itemWrap.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = url;
                img.classList.add('galleryMedia');
                if (item.spoiler) img.classList.add('mediaSpoiler');
                if (item.description) img.alt = item.description;
                itemWrap.appendChild(img);
            }

            if (item.description) {
                const caption = document.createElement('p');
                caption.classList.add('mediaCaption');
                caption.textContent = item.description;
                itemWrap.appendChild(caption);
            }
        }

        gallery.appendChild(itemWrap);
    }

    container.appendChild(gallery);
}

function renderFile(component, container) {
    const fileWrap = document.createElement('div');
    fileWrap.classList.add('componentFile');

    const url = component.file?.url || component.url;
    const filename = component.file?.filename || component.filename || (url ? url.split('/').pop().split('?')[0] : 'File');

    const icon = document.createElement('span');
    icon.classList.add('fileIcon');
    icon.textContent = '📎';
    fileWrap.appendChild(icon);

    const info = document.createElement('div');
    info.classList.add('fileInfo');

    if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.textContent = filename;
        link.classList.add('fileLink');
        link.onclick = (e) => {
            e.preventDefault();
            require('electron').shell.openExternal(url);
        };
        info.appendChild(link);
    } else {
        const name = document.createElement('span');
        name.textContent = filename;
        info.appendChild(name);
    }

    fileWrap.appendChild(info);
    container.appendChild(fileWrap);
}

function renderSeparator(component, container) {
    const sep = document.createElement('div');
    sep.classList.add('componentSeparator');
    if (component.divider) sep.classList.add('separatorWithLine');
    if (component.spacing === 2) sep.classList.add('separatorLarge');
    container.appendChild(sep);
}

function renderContainer(component, container, msg) {
    const el = document.createElement('div');
    el.classList.add('componentContainer');

    const accentColor = component.accentColor ?? component.color;
    if (accentColor != null) {
        const hex = accentColor.toString(16).padStart(6, '0');
        el.style.borderLeftColor = `#${hex}`;
        el.classList.add('componentContainerAccent');
    }

    if (component.spoiler) el.classList.add('containerSpoiler');

    if (component.components) {
        for (const child of component.components) {
            renderComponent(child, el, msg);
        }
    }

    container.appendChild(el);
}
