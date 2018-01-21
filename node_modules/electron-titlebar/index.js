/*
 *  This file is part of electron-titlebar.
 *
 *  Copyright (c) 2016 Menci <huanghaorui301@gmail.com>
 *
 *  electron-titlebar is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  electron-titlebar is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with electron-titlebar. If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

function installTitlebar() {
    if (window.electron_titlebar_installed === true) return;

    let titlebar = document.getElementById('electron-titlebar');
    if (!titlebar) return;

    window.electron_titlebar_installed = true;

    if (titlebar.classList.contains('drag')) {
        let drag = document.createElement('div');
        drag.style.position = 'absolute';
        drag.style.width = '100%';
        drag.style.height = '100%';
        drag.style.top = '0';
        drag.style.left = '0';
        drag.className = 'drag';
        titlebar.appendChild(drag);
    }

    let container = document.createElement('div');
    container.style.position = 'relative';
    titlebar.parentNode.replaceChild(container, titlebar);
    container.appendChild(titlebar);

    let content = document.createElement('div');
    content.style.width = '100%';
    content.style.height = '100%';
    content.style.position = 'absolute';

    while (titlebar.firstChild) content.appendChild(titlebar.firstChild);
    titlebar.appendChild(content);

    const platform = titlebar.getAttribute('platform') || process.platform;
    document.body.parentNode.setAttribute('electron-titlebar-platform', platform);

    const w = require('electron').remote.getCurrentWindow();
    if (!w.isResizable() || !w.isMaximizable()) titlebar.classList.add('no-maximize');
    if (!w.isMinimizable()) titlebar.classList.add('no-minimize');

    const path = require('path'),
          url = require('url');
    const basedir = path.resolve(path.dirname(require.resolve('./index')), 'titlebar');

    if (platform !== 'darwin') {
        function createButton(type) {
            function createImage(type, display) {
                if (typeof display !== 'string') display = '';
                let img = document.createElement('img');
                img.style.display = display;
                img.className = 'button-img-' + type;

                let src;
                if (platform === 'linux') src = path.resolve(basedir, type + '.svg');
                else if (platform === 'win32') src = path.resolve(basedir, 'caption-buttons.svg#' + type);

                img.setAttribute('src', url.resolve('file://', src));
                return img;
            }
            let div = document.createElement('div');
            div.className = 'button button-' + type;

            if (type === 'maximize') {
                div.appendChild(createImage('maximize'));
                div.appendChild(createImage('restore', 'none'));
            } else div.appendChild(createImage(type));

            return div;
        }

        for (let x of ['close', 'minimize', 'maximize']) titlebar.appendChild(createButton(x));

        // register events
        for (let elem of document.querySelectorAll('#electron-titlebar > .button, #electron-titlebar > .button img')) {
            elem.addEventListener('dragstart', (e) => { e.preventDefault(); })
        }

        function showOrHide(elem, show) {
            if (show === true) elem.style.display = '';
            else elem.style.display = 'none';
        }

        let buttomImgMaximize = document.querySelector('#electron-titlebar > .button .button-img-maximize'),
            buttomImgRestore = document.querySelector('#electron-titlebar > .button .button-img-restore');

        w.on('maximize', () => {
            showOrHide(buttomImgMaximize, false);
            showOrHide(buttomImgRestore, true);
        });

        w.on('unmaximize', () => {
            showOrHide(buttomImgMaximize, true);
            showOrHide(buttomImgRestore, false);
        });

        // workaround for the .button is still :hover after maximize window
        for (let elem of document.querySelectorAll('#electron-titlebar > .button')) {
            elem.addEventListener('mouseover', () => {
                elem.classList.add('hover');
            });
            elem.addEventListener('mouseout', () => {
                elem.classList.remove('hover');
            });
        }

        let buttonClose = document.querySelector('#electron-titlebar > .button-close');
        if (buttonClose) buttonClose.addEventListener('click', () => {
            w.close();
        });

        let butonMinimize = document.querySelector('#electron-titlebar > .button-minimize');
        if (butonMinimize) butonMinimize.addEventListener('click', () => {
            w.minimize();
        });

        let butonMaximize = document.querySelector('#electron-titlebar > .button-maximize');
        if (butonMaximize) butonMaximize.addEventListener('click', () => {
            if (!w.isMaximized()) w.maximize();
            else w.unmaximize();
        });
    }

    let link = document.createElement('link');
    link.href = path.resolve(basedir, 'titlebar.css');
    link.rel = 'stylesheet';
    document.head.appendChild(link);
};

if (document.readyState === 'complete' || document.readyState === 'interactive') installTitlebar();
else document.addEventListener('DOMContentLoaded', installTitlebar);
