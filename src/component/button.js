'use strict';
import {CreateElement} from 'vue';

/**
 * 对话框按钮组件
 *
 * 如果需要该组件可以关闭对话框, 需将 isDismisser prop 设置为 true
 *
 * 如果对话框内没有具有 autofocus 属性的元素, 则会聚焦对话框中该组件优先级最高的元素
 *
 * 该组件未应用任何样式, 并且不渲染任何内容
 */
const component = {
    name: 'JDialogButton',
    inject: {
        i_toggle: 'toggle',
        i_addButton: 'addInternalButton',
        i_removeButton: 'removeInternalButton'
    },
    props: {
        /**
         * 对话框打开后获取焦点的优先级, 数字越大优先级越高
         *
         * 该属性不会影响 Tab 按键的焦点顺序
         */
        priority: {required: false, type: Number, default: 0},
        /**
         * 该组件是否可以关闭对话框
         */
        isDismisser: {required: false, type: Boolean, default: false}
    },
    methods: {
        /**
         * 关闭对话框, 用户不应该主动调用该方法
         *
         * @private
         * @param {MouseEvent} event MouseEvent
         */
        $_dismiss(event) {
            !event.defaultPrevented && event.preventDefault();

            if (!this.i_toggle) return;

            this.i_toggle(false);
        }
    },
    beforeMount() {
        if (!this.i_addButton) return;

        this.i_addButton(this.priority, this);
    },
    beforeDestroy() {
        if (!this.i_removeButton) return;

        this.i_removeButton(this);
    },
    render(/** CreateElement */h) {
        let on;
        if (this.isDismisser) {
            let bound = this.$listeners.click;
            if (Array.isArray(bound)) {
                bound.push(this.$_dismiss);
            } else {
                bound = this.$_dismiss;
            }

            on = {...this.$listeners, click: bound};

        } else {
            on = this.$listeners;
        }

        return h('button', {attrs: { type: 'button' }, on}, this.$slots.default);
    }
};

export default component;
