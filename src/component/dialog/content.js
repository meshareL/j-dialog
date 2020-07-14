'use strict';
import {CreateElement, RenderContext, VNode} from 'vue';

/**
 * 对话框中内容的容器组件
 *
 * 该组件在任何给定对话框中只能使用一次
 */
const component = {
    name: 'JDialogContent',
    inheritAttrs: false,
    functional: true,
    props: {
        /**
         * 渲染标签
         */
        tag: {required: false, type: String, default: 'div'}
    },
    /**
     * Render
     *
     * @param {CreateElement} h CreateElement
     * @param {RenderContext<{tag: string}>} context RenderContext
     * @return {VNode} Vue 节点
     */
    render(h, context) {
        const original = context.data.staticClass;
        const staticClass = original ? `dialog-content ${context.data.staticClass}` : 'dialog-content';
        return h(context.props.tag, {...context.data, staticClass}, context.children);
    }
};

export default component;
