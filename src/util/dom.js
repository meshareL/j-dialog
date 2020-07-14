'use strict';
import Vue from 'vue';

const disableables = [HTMLButtonElement, HTMLInputElement, HTMLTextAreaElement, HTMLSelectElement];

/**
 * 获取滚动条宽度
 *
 * @return {number} 滚动条宽度
 */
function scrollbarWidth() {
    return window.innerWidth - document.body.clientWidth;
}

/**
 * 禁用窗口滚动
 */
function disableScroll() {
    const width = scrollbarWidth();
    if (width) document.body.style.paddingRight = width + 'px';

    document.body.style.overflowY = 'hidden';
}

/**
 * 开启窗口滚动
 */
function enableScroll() {
    document.body.style.paddingRight = '';
    document.body.style.overflowY = '';
}

/**
 * 检查给定元素是否可聚焦
 *
 * @param {HTMLElement} el HTMLElement
 * @return {boolean} 如果给定元素可聚焦返回 {@code true}, 否则返回 {@code false}
 */
function focusable(el) {
    /* tabIndex 小于0键盘无法聚焦到该元素 */
    if (el.tabIndex < 0 || el.hidden || !disableables.some(type => el instanceof type)) {
        return false;
    }

    /** @type {HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} */
    const element = el;
    return !(element.disabled || element.type === 'hidden');
}

/**
 * 聚焦到给定元素中第一个具有 {@code autofocus} 属性的元素
 *
 * @param {?Element} el Element
 * @return {boolean} 如果具有可聚焦元素返回 {@code true} 同时聚焦到该元素, 否则返回 {@code false}
 */
function autofocus(el) {
    if (!(el instanceof Element)) return false;

    const element = Array.from(el.querySelectorAll('[autofocus]')).filter(focusable)[0];
    if (!element) return false;

    Vue.nextTick(() => element.focus());
    return true;
}

/**
 * 限制 Tab 按键行为
 *
 * @param {KeyboardEvent} event KeyboardEvent
 */
function restrictTabBehavior(event) {
    if (event.key !== 'Tab') return;

    const container = event.currentTarget;
    if (!(container instanceof HTMLElement)) return;

    !event.defaultPrevented && event.preventDefault();

    const elements = Array.from(container.querySelectorAll('*')).filter(focusable);
    if (!elements.length) return;

    const movement = event.shiftKey ? -1 : 1;
    // const root = container.getRootNode() as Document | ShadowRoot;
    const focused = container.contains(document.activeElement) ? document.activeElement : null;
    let index = movement === -1 ? -1 : 0;

    if (focused instanceof HTMLElement && elements.includes(focused)) {
        index = elements.indexOf(focused) + movement;
    }

    if (index < 0) {
        index = elements.length - 1;
    } else {
        index = index % elements.length;
    }

    elements[index].focus();
}

export {
    disableScroll,
    enableScroll,
    scrollbarWidth,
    autofocus,
    focusable,
    restrictTabBehavior
};
