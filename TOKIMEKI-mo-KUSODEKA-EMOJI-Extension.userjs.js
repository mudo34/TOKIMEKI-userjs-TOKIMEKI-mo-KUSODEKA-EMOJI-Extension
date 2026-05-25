// ==UserScript==
// @name         TOKIMEKI mo KUSODEKA EMOJI Extension
// @namespace    https://tokimeki.blue/
// @version      0.1.0
// @description  TOKIMEKIで絵文字投稿の文字サイズをクソデカくする
// @author       mudo34
// @match        https://tokimeki.blue/*
// @icon         https://www.google.com/s2/favicons?domain=tokimeki.blue
// @grant        none
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    // 絵文字サイズ(数字のみ/単位em)
    const EMOJI_SIZE = 2.5;

    const EMOJI_CLASS = 'kusodeka-emoji';
    const EMOJI_STYLE = 'for-kusodeka-emoji-style';
    const TARGET_SELECTOR = [
        '.timeline__text span[data-timeline-text]'
        ].join(',');

    function addStyle() {
        if (document.getElementById(EMOJI_STYLE))  return;
        const style = document.createElement('style');
        style.id = EMOJI_STYLE;
        style.textContent = `
            .${EMOJI_CLASS} {
            font-size: ${EMOJI_SIZE}em;
            line-height: 1.2;
            letter-spacing: -.4em;
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

    function process(el) {
        if (el.dataset.emojiChecked === '1') return;
        el.dataset.emojiChecked = '1';
        if (isEmojiOnly(el.textContent)) {
            el.classList.add(EMOJI_CLASS);
        }
    }

    function isEmojiOnly(text) {
        const trimmed = text.trim();
        if (trimmed === '') return false;
        for (const { segment } of segmenter.segment(trimmed)) {
            if (!emojiRE.test(segment)) return false;
        }
        return true;
    }

    function scan(root = document) {
        root.querySelectorAll(TARGET_SELECTOR).forEach(process);
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
})();
