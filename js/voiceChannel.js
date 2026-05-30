'use strict';

const {
    joinVoiceChannel,
    VoiceConnectionStatus,
    entersState,
    EndBehaviorType,
    createAudioPlayer,
    createAudioResource,
    StreamType,
} = require('@discordjs/voice');

const { PassThrough } = require('stream');

let voiceConnection = null;
let voicePlayer = null;
let micAudioContext = null;
let speakerAudioContext = null;
let micStream = null;
let micProcessor = null;
let micPassThrough = null;
let isMuted = false;
let isDeafened = false;
let currentVoiceChannel = null;

// ── Entry point called from channelSelect ─────────────────────────────────────

async function joinVoice(channel) {
    if (currentVoiceChannel && currentVoiceChannel.id === channel.id) return;
    if (voiceConnection) leaveVoice(true);

    currentVoiceChannel = channel;

    // Clear any open forum back bar
    document.getElementById('forumBackBar')?.remove();

    // Hide send bar - no typing in VC
    document.getElementById('sendmsg').style.display = 'none';

    // Use message-list as container for the voice panel
    const messages = document.getElementById('message-list');
    messages.style.overflow = 'hidden';
    messages.style.padding = '0';
    while (messages.firstChild) messages.removeChild(messages.firstChild);

    buildVoicePanel(messages, channel);
    updateVoiceStatus('Connecting...');
    refreshVoiceMembers(channel);

    try {
        voiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfMute: isMuted,
            selfDeaf: isDeafened,
        });

        voiceConnection.on(VoiceConnectionStatus.Connecting, () => updateVoiceStatus('Connecting...'));
        voiceConnection.on(VoiceConnectionStatus.Ready, () => {
            updateVoiceStatus('Connected');
            if (!isMuted) startMicrophone();
            if (!isDeafened) startReceivingAudio();
        });
        voiceConnection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(voiceConnection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(voiceConnection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch {
                leaveVoice();
            }
        });
        voiceConnection.on(VoiceConnectionStatus.Destroyed, () => {
            cleanupAudio();
            currentVoiceChannel = null;
        });
        voiceConnection.on('error', (err) => {
            console.error('Voice error:', err);
            updateVoiceStatus('Error: ' + err.message);
        });

    } catch (err) {
        console.error('Failed to join voice:', err);
        updateVoiceStatus('Failed: ' + err.message);
    }
}

function leaveVoice(silent = false) {
    cleanupAudio();

    if (voiceConnection) {
        try { voiceConnection.destroy(); } catch {}
        voiceConnection = null;
    }

    currentVoiceChannel = null;

    if (!silent) {
        // Restore message-list to normal
        const messages = document.getElementById('message-list');
        messages.style.overflow = '';
        messages.style.padding = '';
        while (messages.firstChild) messages.removeChild(messages.firstChild);

        document.getElementById('sendmsg').style.display = '';
        document.getElementById('msgbox').placeholder = 'Message';
        selectedChan = null;
    }
}

// ── Microphone → Discord ──────────────────────────────────────────────────────

async function startMicrophone() {
    if (isMuted || !voiceConnection) return;
    stopMicrophone();

    try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        micAudioContext = new AudioContext({ sampleRate: 48000 });
        const source = micAudioContext.createMediaStreamSource(micStream);

        // 960 samples @ 48 kHz = 20 ms (standard Opus frame size)
        micProcessor = micAudioContext.createScriptProcessor(960, 1, 1);

        const silentGain = micAudioContext.createGain();
        silentGain.gain.value = 0;
        source.connect(micProcessor);
        micProcessor.connect(silentGain);
        silentGain.connect(micAudioContext.destination);

        micPassThrough = new PassThrough();

        micProcessor.onaudioprocess = (e) => {
            if (!voiceConnection || isMuted || !micPassThrough?.writable) return;
            const input = e.inputBuffer.getChannelData(0);
            // Mono Float32 → Stereo Int16 (S16LE, 48kHz, 2ch)
            const stereoInt16 = new Int16Array(input.length * 2);
            for (let i = 0; i < input.length; i++) {
                const v = Math.max(-0x8000, Math.min(0x7FFF, Math.round(input[i] * 0x7FFF)));
                stereoInt16[i * 2] = v;
                stereoInt16[i * 2 + 1] = v;
            }
            if (!micPassThrough.destroyed) micPassThrough.write(Buffer.from(stereoInt16.buffer));
        };

        if (!voicePlayer) {
            voicePlayer = createAudioPlayer();
            voicePlayer.on('error', (e) => console.error('Audio player:', e));
        }

        const resource = createAudioResource(micPassThrough, {
            inputType: StreamType.Raw,
            silencePaddingFrames: 5,
        });
        voicePlayer.play(resource);
        voiceConnection.subscribe(voicePlayer);

    } catch (err) {
        console.error('Microphone error:', err);
        updateVoiceStatus('Mic unavailable: ' + err.message);
    }
}

function stopMicrophone() {
    if (micProcessor) { micProcessor.onaudioprocess = null; micProcessor.disconnect(); micProcessor = null; }
    if (micAudioContext) { micAudioContext.close().catch(() => {}); micAudioContext = null; }
    if (micStream) { micStream.getTracks().forEach((t) => t.stop()); micStream = null; }
    if (micPassThrough) { micPassThrough.destroy(); micPassThrough = null; }
    if (voicePlayer) voicePlayer.stop();
}

// ── Discord → Speakers ────────────────────────────────────────────────────────

function startReceivingAudio() {
    if (!voiceConnection || isDeafened) return;
    try {
        const prism = require('prism-media');
        voiceConnection.receiver.speaking.on('start', (userId) => {
            if (isDeafened || !voiceConnection) return;
            updateMemberSpeaking(userId, true);

            const audioStream = voiceConnection.receiver.subscribe(userId, {
                end: { behavior: EndBehaviorType.AfterSilence, duration: 200 },
            });
            const decoder = new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 });
            const pcmStream = audioStream.pipe(decoder);

            playPCMToSpeakers(pcmStream);
            audioStream.on('end', () => updateMemberSpeaking(userId, false));
            audioStream.on('error', (e) => console.error('Receive stream:', e));
        });
    } catch (err) {
        console.warn('Audio receive unavailable:', err.message);
    }
}

function playPCMToSpeakers(pcmStream) {
    if (!speakerAudioContext) speakerAudioContext = new AudioContext({ sampleRate: 48000 });
    const ctx = speakerAudioContext;
    let playTime = ctx.currentTime + 0.08;

    pcmStream.on('data', (chunk) => {
        if (isDeafened) return;
        const samplesPerCh = Math.floor(chunk.length / 4);
        if (samplesPerCh === 0) return;

        const buf = ctx.createBuffer(2, samplesPerCh, 48000);
        const int16 = new Int16Array(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength));
        const L = buf.getChannelData(0);
        const R = buf.getChannelData(1);
        for (let i = 0; i < samplesPerCh; i++) {
            L[i] = int16[i * 2] / 32768;
            R[i] = int16[i * 2 + 1] / 32768;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        const now = ctx.currentTime;
        if (playTime < now) playTime = now + 0.08;
        src.start(playTime);
        playTime += buf.duration;
    });
}

// ── Controls ──────────────────────────────────────────────────────────────────

function toggleMute() {
    isMuted = !isMuted;
    const btn = document.getElementById('voiceMuteBtn');
    if (!btn) return;

    if (isMuted) {
        stopMicrophone();
        btn.classList.add('vcBtnActive');
        btn.querySelector('.vcBtnIcon').textContent = '🔇';
        btn.querySelector('.vcBtnLabel').textContent = 'Unmute';
    } else {
        btn.classList.remove('vcBtnActive');
        btn.querySelector('.vcBtnIcon').textContent = '🎤';
        btn.querySelector('.vcBtnLabel').textContent = 'Mute';
        if (voiceConnection?.state.status === VoiceConnectionStatus.Ready) startMicrophone();
    }
}

function toggleDeafen() {
    isDeafened = !isDeafened;
    if (isDeafened) isMuted = true;
    else isMuted = false;

    const deafBtn = document.getElementById('voiceDeafenBtn');
    const muteBtn = document.getElementById('voiceMuteBtn');

    if (isDeafened) {
        stopMicrophone();
        if (speakerAudioContext) { speakerAudioContext.close().catch(() => {}); speakerAudioContext = null; }
        deafBtn?.classList.add('vcBtnActive');
        muteBtn?.classList.add('vcBtnActive');
        if (deafBtn) { deafBtn.querySelector('.vcBtnIcon').textContent = '🔕'; deafBtn.querySelector('.vcBtnLabel').textContent = 'Undeafen'; }
        if (muteBtn) { muteBtn.querySelector('.vcBtnIcon').textContent = '🔇'; muteBtn.querySelector('.vcBtnLabel').textContent = 'Unmute'; }
    } else {
        deafBtn?.classList.remove('vcBtnActive');
        muteBtn?.classList.remove('vcBtnActive');
        if (deafBtn) { deafBtn.querySelector('.vcBtnIcon').textContent = '🔕'; deafBtn.querySelector('.vcBtnLabel').textContent = 'Deafen'; }
        if (muteBtn) { muteBtn.querySelector('.vcBtnIcon').textContent = '🎤'; muteBtn.querySelector('.vcBtnLabel').textContent = 'Mute'; }
        if (voiceConnection?.state.status === VoiceConnectionStatus.Ready) {
            startMicrophone();
            startReceivingAudio();
        }
    }
}

function cleanupAudio() {
    stopMicrophone();
    if (speakerAudioContext) { speakerAudioContext.close().catch(() => {}); speakerAudioContext = null; }
    if (voicePlayer) { voicePlayer.stop(); voicePlayer = null; }
    isMuted = false;
    isDeafened = false;
}

// ── Voice Panel DOM ───────────────────────────────────────────────────────────

function buildVoicePanel(container, channel) {
    container.id = 'message-list'; // keep the id

    // Header
    const header = document.createElement('div');
    header.className = 'vcPanelHeader';
    header.innerHTML = `
        <img class="vcHeaderIcon" src="resources/icons/GuildVoiceChannel.svg" alt="vc">
        <span class="vcChannelName">${esc(channel.name)}</span>
        <span id="voiceStatus" class="voiceStatusBadge">● Connecting</span>
    `;
    container.appendChild(header);

    // Members section
    const membersSection = document.createElement('div');
    membersSection.className = 'vcMembersSection';

    const label = document.createElement('p');
    label.className = 'vcSectionLabel';
    label.textContent = 'In Voice';
    membersSection.appendChild(label);

    const grid = document.createElement('div');
    grid.id = 'voiceMembersGrid';
    grid.className = 'vcMembersGrid';
    membersSection.appendChild(grid);

    container.appendChild(membersSection);

    // Spacer
    const spacer = document.createElement('div');
    spacer.style.flex = '1';
    container.appendChild(spacer);

    // Controls
    const controls = document.createElement('div');
    controls.className = 'vcControls';
    controls.innerHTML = `
        <button class="vcCtrlBtn" id="voiceMuteBtn" onclick="toggleMute()">
            <span class="vcBtnIcon">🎤</span>
            <span class="vcBtnLabel">Mute</span>
        </button>
        <button class="vcCtrlBtn" id="voiceDeafenBtn" onclick="toggleDeafen()">
            <span class="vcBtnIcon">🔕</span>
            <span class="vcBtnLabel">Deafen</span>
        </button>
        <button class="vcCtrlBtn vcLeaveBtn" onclick="leaveVoice()">
            <span class="vcBtnIcon">📞</span>
            <span class="vcBtnLabel">Disconnect</span>
        </button>
    `;
    container.appendChild(controls);
}

// ── Member cards ──────────────────────────────────────────────────────────────

function refreshVoiceMembers(channel) {
    const grid = document.getElementById('voiceMembersGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const voiceStates = channel.guild.voiceStates?.cache?.filter(
        (vs) => vs.channelId === channel.id
    );

    if (!voiceStates || voiceStates.size === 0) {
        const empty = document.createElement('p');
        empty.className = 'vcEmptyText';
        empty.textContent = 'No one else is here yet.';
        grid.appendChild(empty);
        return;
    }

    voiceStates.forEach((vs) => {
        if (!vs.member) return;
        grid.appendChild(buildMemberCard(vs.member, vs));
    });
}

function buildMemberCard(member, vs) {
    const card = document.createElement('div');
    card.className = 'vcMemberCard';
    card.id = `vcMember_${member.id}`;

    const avatar = document.createElement('img');
    avatar.className = 'vcMemberAvatar';
    avatar.src = member.displayAvatarURL({ size: 64 });
    avatar.alt = member.displayName;
    card.appendChild(avatar);

    const info = document.createElement('div');
    info.className = 'vcMemberInfo';

    const name = document.createElement('span');
    name.className = 'vcMemberName';
    name.textContent = member.displayName;
    name.style.color = member.roles?.color?.hexColor || '#dcddde';
    info.appendChild(name);

    const icons = document.createElement('div');
    icons.className = 'vcMemberIcons';
    if (vs.mute || vs.selfMute) icons.appendChild(makeIcon('🔇', 'Muted'));
    if (vs.deaf || vs.selfDeaf) icons.appendChild(makeIcon('🔕', 'Deafened'));
    if (vs.streaming) icons.appendChild(makeIcon('🖥️', 'Streaming'));
    if (vs.selfVideo) icons.appendChild(makeIcon('📷', 'Camera on'));
    info.appendChild(icons);

    card.appendChild(info);
    return card;
}

function makeIcon(emoji, title) {
    const span = document.createElement('span');
    span.className = 'vcStateIcon';
    span.title = title;
    span.textContent = emoji;
    return span;
}

function updateMemberSpeaking(userId, isSpeaking) {
    const card = document.getElementById(`vcMember_${userId}`);
    if (!card) return;
    card.classList.toggle('vcSpeaking', isSpeaking);
}

function updateVoiceStatus(status) {
    const el = document.getElementById('voiceStatus');
    if (!el) return;
    const connected = status === 'Connected';
    el.textContent = (connected ? '● ' : '○ ') + status;
    el.className = 'voiceStatusBadge' + (connected ? ' vcConnected' : '');
}

// ── Called from load.js voiceStateUpdate event ────────────────────────────────

function updateVoicePanel(oldState, newState) {
    if (!currentVoiceChannel) return;
    const affected =
        oldState.channelId === currentVoiceChannel.id ||
        newState.channelId === currentVoiceChannel.id;
    if (affected) {
        refreshVoiceMembers(currentVoiceChannel);
        if (newState.member) updateMemberSpeaking(newState.member.id, false);
    }
}

function esc(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
