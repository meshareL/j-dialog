'use strict';
import {CreateElement, VNode, VNodeData, VNodeChildren} from 'vue';
import Button from '../button';

/**
 * 渲染节点
 *
 * @param {CreateElement} createElement 创建节点函数
 * @param {string} tag HTML 标签
 * @param {VNodeData} [nodeData] 节点属性
 * @param {Function} [slot] 范围插槽
 * @param {VNodeChildren} [fallback] 回退渲染内容
 * @return {?VNode} Vue 节点
 */
function renderNode(createElement, tag, nodeData,  slot, fallback) {
    if (slot) {
        return createElement(tag, nodeData, slot({}));
    } else if (fallback) {
        return createElement(tag, nodeData, fallback);
    }

    return null;
}

/**
 * 渲染关闭图标
 *
 * @param {CreateElement} createElement CreateElement
 * @return {VNode} Vue 节点
 */
function renderIcon(createElement) {
    const data = {
        attrs: {
            width: 16,
            height: 16,
            viewBox: '0 0 16 16',
            fill: 'currentColor',
        }
    };
    return createElement('svg', data, [
        createElement('path', {attrs: {'fill-rule': 'evenodd', d: 'M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z'}})
    ]);
}

const component = {
    name: 'JDialogHeader',
    inheritAttrs: false,
    props: {
        /**
         * 是否显示关闭对话框按钮
         * 如果需要自定义按钮样式, 可以传入 {@code false}, 手动创建 {@code j-dialog-button} 组件
         */
        dismissable: {required: false, type: Boolean, default: true},
        /**
         * 对话框标题
         * 组件会优先使用 {@code title} 属性渲染
         * 如果 {@code title} 属性未传入值, 将使用 Vue 默认插槽
         */
        title: {required: false, type: String, default: ''},
        /**
         * 使用这个属性来描述对话框的内容
         * title 属性存在时, 此属性才能生效
         */
        describe: {required: false, type: String, default: ''},
        /**
         * 对话框标题 id, 通过 aria-labelledby 引用, 用以提高元素可访问性
         *
         * @see https://www.w3.org/TR/wai-aria-practices-1.2/#dialog_roles_states_props aria-labelledby
         */
        titleId: {required: false, type: String, default: undefined},
        /**
         * 对话框描述对象 id, 通过 aria-describedby 引用, 用以提高元素访问性
         *
         * @see https://www.w3.org/TR/wai-aria-practices-1.2/#dialog_roles_states_props aria-describedby
         */
        describeId: {required: false, type: String, default: undefined}
    },
    render(/** CreateElement */h) {
        const children = [];

        const titleNode = renderNode(h, 'h4', {staticClass: 'title', attrs: {id: this.titleId}}, this.$scopedSlots.title, this.title);
        const describeNode = renderNode(h, 'p', {staticClass: 'describe', attrs: {id: this.describeId}}, this.$scopedSlots.describe, this.describe)

        if (titleNode && describeNode) {
            children.push(h('div', {staticClass: 'titlebar'}, [titleNode, describeNode]));
        } else {
            children.push(titleNode, describeNode);
        }

        if (this.dismissable) {
            children.push(h(Button, {props: {isDismisser: true}, staticClass: 'closer', attrs: {'aria-label': 'Close'}}, [renderIcon(h)]))
        }

        return h('header', {staticClass: 'dialog-header'}, children);
    }
};

export default component;
