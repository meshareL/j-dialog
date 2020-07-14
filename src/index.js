'use strict';
// https://www.w3.org/TR/wai-aria-practices-1.2/#dialog_modal
import {VueConstructor} from 'vue';
import {Wrapper, Content, Footer, Button, hooks as globalHooks} from './component';

function toArray(obj) {
    if (!obj) return [];
    return Array.isArray(obj) ? obj : [obj];
}

/**
 * Vue plugin install function
 *
 * @param {VueConstructor} constructor Vue 构造器
 * @param {PluginOption} option 插件选项
 */
function install(constructor, option) {
    option = option || {};

    const names = option.names || {};
    constructor.component(names.dialog || 'j-dialog', Wrapper);
    constructor.component(names.content || 'j-dialog-content', Content);
    constructor.component(names.footer || 'j-dialog-footer', Footer);
    constructor.component(names.button || 'j-dialog-button', Button);

    const hooks = option.hooks || {};
    globalHooks.open = toArray(hooks.open);
    globalHooks.opened = toArray(hooks.opened);
    globalHooks.closed = toArray(hooks.closed);
}

export default install;

/**
 * @typedef {Object} PluginOption
 * @property {Names} [names] 组件名称
 * @property {{open: EventCallback[], opened: EventCallback[], closed: EventCallback[]}} [hooks] 全局钩子函数
 */

/**
 * @typedef {Object} Names
 * @property {string} [dialog='j-dialog'] 对话框
 * @property {string} [content='j-dialog-content'] 对话框内容
 * @property {string} [footer='j-dialog-footer'] 页尾
 * @property {string} [button='j-dialog-button'] 关闭对话框按钮
 */

/**
 * @callback EventCallback
 * @param {Vue} dialogRef 对话框实例
 */