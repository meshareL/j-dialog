'use strict';
import {CreateElement, RenderContext, VNode} from 'vue';

/**
 * 对话框中页脚内容的容器组件
 *
 * 该组件在任何给定对话框中只能使用一次, 并且应作为对话框中最后一个组件出现
 */
const component = {
    name: 'JDialogFooter',
    inheritAttrs: false,
    functional: true,
    /**
     * Render
     *
     * @param {CreateElement} h CreateElement
     * @param {RenderContext<{}>} context RenderContext
     * @return {VNode} Vue 节点
     */
    render(h, {data, children}) {
        return h('footer', {...data, staticClass: data.staticClass ? `dialog-footer ${data.staticClass}` : 'dialog-footer'}, children);
    }
};

export default component;
