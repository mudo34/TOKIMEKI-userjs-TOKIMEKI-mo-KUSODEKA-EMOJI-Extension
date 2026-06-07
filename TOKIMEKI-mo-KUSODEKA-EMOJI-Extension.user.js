// ==UserScript==
// @name         TOKIMEKI mo KUSODEKA EMOJI Extension
// @namespace    https://tokimeki.blue/
// @version      0.1.1
// @description  TOKIMEKIで絵文字投稿の文字サイズをクソデカくする
// @author       mudo34
// @match        https://tokimeki.blue/*
// @icon         https://www.google.com/s2/favicons?domain=tokimeki.blue
// @grant        none
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    // 絵文字サイズ(数字のみ/単位em/等倍=1)
    const EMOJI_SIZE = 2.5;
    
    // TWEMOJIを使用する true / 使用しない false
    const ENABLE_TWEMOJI = true;

    const EMOJI_CLASS = 'kusodeka-emoji';
    const EMOJI_STYLE = 'for-kusodeka-emoji-style';
    const TWEMOJI_CLASS = 'twemoji-enabled';

    const TARGET_SELECTOR = [
         '.timeline__text span[data-timeline-text]'
        ,'.timeline__user'
        ,'.timeline-repost-message__text'
        ,'.deck-heading__title'
        ,'.notifications-item__name'
        ,'.notifications-item__content'
    ].join(',');

    function loadTwemoji() {
        return new Promise((resolve) => {
            if (window.twemoji) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@twemoji/api@latest/dist/twemoji.min.js';
            script.onload = resolve;
            document.head.append(script);
        });
    }

    function addStyle() {
        if (document.getElementById(EMOJI_STYLE)) {
            return;
        }

        const style = document.createElement('style');
        style.id = EMOJI_STYLE;
        style.textContent = `
            .timeline__text .${EMOJI_CLASS} {
                font-size: ${EMOJI_SIZE}em;
                line-height: 1.2;
            }

            .${TWEMOJI_CLASS} img.emoji {
                height: 1em;
                width: 1em;
                margin: 0 .15em 0 0;
                vertical-align: -.1em;
            }
        `;

        (document.head || document.documentElement).append(style);
    }
    addStyle();

    // 絵文字判定準備
    const segmenter = new Intl.Segmenter(undefined, {
        granularity: 'grapheme'
    });

    const emojiRE = /^\p{RGI_Emoji}$/v;

    function isEmojiOnly(text) {
        const trimmed = text.trim();

        if (trimmed === '') {
            return false;
        }

        for (const { segment } of segmenter.segment(trimmed)) {
            if (!emojiRE.test(segment)) {
                return false;
            }
        }

        return true;
    }

    function process(el) {

        if (ENABLE_TWEMOJI) {
            el.classList.add(TWEMOJI_CLASS);
        }

        if (isEmojiOnly(el.textContent)) {
            el.classList.add(EMOJI_CLASS);
        } else {
            el.classList.remove(EMOJI_CLASS);
        }

        if (
            ENABLE_TWEMOJI &&
            window.twemoji &&
            !el.querySelector(`img.emoji`)
        ) {
            twemoji.parse(el, {
                folder: 'svg',
                ext: '.svg'
            });
        }
    }

    function scan(root = document) {
        root.querySelectorAll(TARGET_SELECTOR).forEach(process);
    }

    async function init() {
        if (ENABLE_TWEMOJI) {
            await loadTwemoji();
        }

        scan();

        // 要素監視
        const observer = new MutationObserver((records) => {
            for (const record of records) {
                for (const node of record.addedNodes) {
                    if (!(node instanceof HTMLElement)) {
                        continue;
                    }

                    if (node.matches?.(TARGET_SELECTOR)) {
                        process(node);
                    }

                    scan(node);
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    init();
})();
