'use strict';

let currentForumChannel = null;
let currentForumThread = null;

// ── Entry point called from channelSelect ─────────────────────────────────────

async function showForumPosts(channel) {
    currentForumChannel = channel;
    currentForumThread = null;
    selectedChan = null;

    // Leave voice if active
    if (typeof currentVoiceChannel !== 'undefined' && currentVoiceChannel) leaveVoice(true);

    document.getElementById('forumBackBar')?.remove();

    const messages = document.getElementById('message-list');
    const sendBar = document.getElementById('sendmsg');

    sendBar.style.display = 'none';

    // Use message-list as the panel container
    messages.style.overflow = 'hidden';
    messages.style.padding = '0';
    while (messages.firstChild) messages.removeChild(messages.firstChild);

    buildForumHeader(messages, channel);

    const postsArea = document.createElement('div');
    postsArea.id = 'forumPostsArea';
    const loading = document.createElement('p');
    loading.className = 'forumLoading';
    loading.textContent = 'Loading posts…';
    postsArea.appendChild(loading);
    messages.appendChild(postsArea);

    // Fetch threads
    let threads = [];
    try {
        const active = await channel.threads.fetchActive();
        threads = [...active.threads.values()];
    } catch (e) { console.error('Active threads:', e); }

    try {
        const archived = await channel.threads.fetchArchived({ limit: 25 });
        threads = threads.concat([...archived.threads.values()]);
    } catch (e) { console.warn('Archived threads:', e.message); }

    // Sort newest-activity first
    threads.sort((a, b) => {
        const aT = a.lastMessage?.createdTimestamp ?? a.createdTimestamp ?? 0;
        const bT = b.lastMessage?.createdTimestamp ?? b.createdTimestamp ?? 0;
        return bT - aT;
    });

    postsArea.innerHTML = '';

    if (threads.length === 0) {
        postsArea.innerHTML = '<p class="forumEmpty">No posts yet in this forum.</p>';
        return;
    }

    const tagMap = {};
    (channel.availableTags || []).forEach((t) => { tagMap[t.id] = t; });

    threads.forEach((thread) => postsArea.appendChild(buildPostCard(thread, tagMap)));
}

function buildForumHeader(container, channel) {
    const header = document.createElement('div');
    header.className = 'forumPanelHeader';
    header.innerHTML = `
        <img class="forumHeaderIcon" src="resources/icons/GuildForumChannel.svg" alt="forum">
        <div class="forumHeaderText">
            <h3 class="forumChannelTitle">${esc(channel.name)}</h3>
            ${channel.topic ? `<p class="forumChannelTopic">${esc(channel.topic)}</p>` : ''}
        </div>
    `;
    container.appendChild(header);
}

function buildPostCard(thread, tagMap) {
    const card = document.createElement('div');
    card.className = 'forumPostCard' + (thread.archived ? ' forumPostArchived' : '');

    // Avatar
    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'forumPostAvatarWrap';
    const avatar = document.createElement('img');
    avatar.className = 'forumPostAvatar';
    const owner = thread.guild?.members?.cache?.get(thread.ownerId);
    avatar.src = owner?.displayAvatarURL({ size: 64 }) || 'resources/images/default.png';
    avatar.alt = owner?.displayName || 'Unknown';
    avatarWrap.appendChild(avatar);

    // Content
    const content = document.createElement('div');
    content.className = 'forumPostContent';

    // Title + badges
    const titleRow = document.createElement('div');
    titleRow.className = 'forumPostTitleRow';
    const title = document.createElement('h4');
    title.className = 'forumPostTitle';
    title.textContent = thread.name;
    titleRow.appendChild(title);
    if (thread.archived) titleRow.appendChild(makeBadge('Archived', 'forumArchivedBadge'));
    if (thread.locked) titleRow.appendChild(makeBadge('🔒 Locked', 'forumLockedBadge'));
    content.appendChild(titleRow);

    // Tags
    const appliedTags = thread.appliedTags || [];
    if (appliedTags.length) {
        const tagsRow = document.createElement('div');
        tagsRow.className = 'forumTagsRow';
        appliedTags.forEach((id) => {
            const tag = tagMap[id];
            if (!tag) return;
            const el = document.createElement('span');
            el.className = 'forumTag';
            let label = '';
            if (tag.emoji?.name) label += tag.emoji.name + ' ';
            else if (tag.emojiName) label += tag.emojiName + ' ';
            label += tag.name;
            el.textContent = label;
            tagsRow.appendChild(el);
        });
        content.appendChild(tagsRow);
    }

    // Meta
    const meta = document.createElement('div');
    meta.className = 'forumPostMeta';
    const authorName = owner?.displayName || 'Unknown';
    const created = thread.createdAt
        ? thread.createdAt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '';
    const replies = Math.max(0, (thread.messageCount || 1) - 1);
    meta.innerHTML = `
        <span class="forumMetaAuthor">by ${esc(authorName)}</span>
        <span class="forumMetaDot">·</span>
        <span class="forumMetaDate">${esc(created)}</span>
        <span class="forumMetaDot">·</span>
        <span class="forumMetaReplies">💬 ${replies} ${replies === 1 ? 'reply' : 'replies'}</span>
    `;
    content.appendChild(meta);

    card.appendChild(avatarWrap);
    card.appendChild(content);
    card.addEventListener('click', () => openForumPost(thread));
    return card;
}

function makeBadge(text, className) {
    const badge = document.createElement('span');
    badge.className = `forumBadge ${className}`;
    badge.textContent = text;
    return badge;
}

// ── Open a forum post (thread) ────────────────────────────────────────────────

async function openForumPost(thread) {
    currentForumThread = thread;

    const messages = document.getElementById('message-list');
    const sendBar = document.getElementById('sendmsg');

    // Restore normal message-list scrolling
    messages.style.overflow = '';
    messages.style.padding = '';
    while (messages.firstChild) messages.removeChild(messages.firstChild);

    // Back bar: sticky inside the message-list so it stays at top while scrolling
    const backBar = document.createElement('div');
    backBar.id = 'forumBackBar';
    backBar.innerHTML = `
        <button class="forumBackBtn" onclick="backToForum()">← ${esc(currentForumChannel?.name || 'Forum')}</button>
        <span class="forumThreadTitle">${esc(thread.name)}</span>
        ${thread.locked ? '<span class="forumBadge forumLockedBadge" style="flex-shrink:0">🔒 Locked</span>' : ''}
    `;
    messages.appendChild(backBar);

    // Set selected channel so sendmsg() and newMsg events work
    selectedChan = thread;
    document.getElementById('msgbox').placeholder = `Reply to ${thread.name}`;
    sendBar.style.display = '';

    // Loading indicator
    const loadWrap = document.createElement('div');
    loadWrap.id = 'loading-container';
    loadWrap.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)';
    const dots = document.createElement('div');
    dots.className = 'dot-bricks';
    loadWrap.appendChild(dots);
    messages.appendChild(loadWrap);

    generatingMessages = true;
    let count = 0;
    const fetchSize = 100;

    try {
        const fetched = await thread.messages.fetch({ limit: fetchSize });
        const arr = fetched.toJSON().reverse();
        arr.forEach((m) => {
            count++;
            messages.appendChild(generateMsgHTML(m, arr[count - 2], count, fetchSize));
        });
    } catch (err) {
        console.error('Thread messages:', err);
    }

    // Footer
    const footer = document.createElement('div');
    footer.className = 'sorryNoLoad';
    const footText = document.createElement('p');
    footText.textContent = 'Sorry! No messages beyond this point can be displayed.';
    footer.appendChild(footText);
    messages.prepend(footer);

    messages.scrollTop = messages.scrollHeight;
    generatingMessages = false;
    document.getElementById('loading-container')?.remove();
}

// ── Back to post list ─────────────────────────────────────────────────────────

function backToForum() {
    currentForumThread = null;
    selectedChan = null;

    document.getElementById('sendmsg').style.display = 'none';
    document.getElementById('msgbox').placeholder = 'Message';

    if (currentForumChannel) showForumPosts(currentForumChannel);
}

function esc(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
