'use strict';
import Vue, {CreateElement, VNode, WatchOptionsWithHandler} from 'vue';
import Dialog from './dialog/dialog';
import {disableScroll, enableScroll} from '../util/dom';
import hooks from './global-hook';

/**
 * 渲染对话框遮罩层
 *
 * @param {CreateElement} h CreateElement
 * @param {boolean} visible 遮罩层显示状态
 * @param {Function|Function[]} clickCallback 点击回调函数
 * @return {VNode} Vue 节点
 */
function renderBackdrop(h, visible, clickCallback) {
    /**
     * 对话框遮罩层 mousedown 事件
     *
     * 禁止 mousedown 事件默认行为, 防止当前对象失去焦点
     *
     * @param {MouseEvent} event MouseEvent
     */
    function onmousedown(event) {
        !event.defaultPrevented && event.preventDefault();
    }

    return h('div', {
        staticClass: 'j-dialog-backdrop',
        directives: [{name: 'show', value: visible, expression: 'show'}],
        attrs: {role: 'none'},
        on: {click: clickCallback, mousedown: onmousedown}
    });
}

const component = {
    name: 'JDialogWrapper',
    inheritAttrs: false,
    provide() {
        return { toggle: this.toggle };
    },
    props: {
        /**
         * 对话框是否可见, 支持 .sync 修饰符
         */
        visible: {required: false, type: Boolean, default: false},
        /**
         * 是否为模态对话框, 该属性同时控制 {@code aria-modal} 的值
         *
         * @see https://www.w3.org/TR/wai-aria-1.2/#aria-modal aria-modal
         */
        modal: {required: false, type: Boolean, default: true},
        /**
         * 键盘 Escape 按键关闭对话框
         */
        keyboardDismiss: {required: false, type: Boolean, default: true},
        /**
         * 点击对话框遮罩层是否关闭对话框
         * modal选项为 {@code true} 时, 此选项才会生效
         */
        backdropDismiss: {required: false, type: Boolean, default: false},
        /**
         * 对话框开启时, 是否锁定屏幕滚动
         */
        lockScroll: {required: false, type: Boolean, default: true},
        /**
         * 对话框关闭前的回调函数, 会暂停对话框的关闭
         * 如果函数返回 {@code false}, 对话框将不会关闭
         *
         * 仅当用户点击遮罩层或 DismissButton 组件关闭对话框时生效
         */
        beforeClose: {required: false, type: Function, default: () => true},
        /**
         * 绑定对话框元素的 class
         * 该组件根元素不是对话框元素
         */
        xClass: {required: false, type: [String, Array, Object], default: ''},
        /**
         * 绑定对话框元素的 style
         * 该组件根元素不是对话框元素
         */
        xStyle: {required: false, type: [String, Array, Object], default: ''}
    },
    watch: {
        /**
         * 侦听 visible 变量
         *
         * @type {WatchOptionsWithHandler<boolean>}
         */
        visible: {
            immediate: true,
            handler(status) {
                if (status) {
                    this.$emit('open');
                    hooks.open.forEach(fun => fun(this.$refs.dialogRef));
                    if (this.lockScroll) disableScroll();
                    return;
                }

                this.$emit('closed');
                hooks.closed.forEach(fun => fun(this.$refs.dialogRef));
                if (this.lockScroll) enableScroll();
            }
        }
    },
    methods: {
        /**
         * 通知父组件更改对话框显示状态
         *
         * 如果 beforeClose 不是函数或函数执行后返回 true, 将会触发 update:visible 事件
         *
         * 如果 visible 属性绑定的变量位于 Vuex 的 Store 内, 那么 .sync 不会正常工作,
         * 此时需去除 .sync 修饰符, 同时监听 update:visible 事件, 在事件回调中手动更新 visible 的值
         *
         * @private
         * @example
         * <j-dialog @update:visible="$store.commit('updateVisible', $event)"></j-dialog>
         *
         * @param {boolean} [status] 对话框显示状态
         */
        toggle(status) {
            const bool = typeof status === 'boolean' ? status : !this.visible;
            if (typeof this.beforeClose === 'function') {
                if (!this.beforeClose()) return;

                // .sync
                this.$emit('update:visible', bool);
                return;
            }

            // .sync
            this.$emit('update:visible', bool);
        },
        /**
         * Escape 按键关闭按钮
         *
         * @param {KeyboardEvent} event KeyboardEvent
         */
        $_escapeDismiss(event) {
            if (event.key !== 'Escape') return;
            !event.defaultPrevented && event.preventDefault();

            this.toggle(false);
        },
        /**
         * 点击对话框遮罩层
         *
         * 如果 backdropDismiss 参数为 true, 则通知父组件关闭对话框
         *
         * 如果点击遮罩层前以获取焦点的对象包含在对话框元素中, 则重新使该对象获取焦点,
         * 否则调用对话框组件 {@code $_focuson} 方法获取焦点
         *
         * @param {MouseEvent} event MouseEvent
         */
        $_clickBackdrop(event) {
            !event.defaultPrevented && event.preventDefault();

            if (this.backdropDismiss) {
                this.toggle(false);
                return;
            }

            const dialog = this.$refs.dialogRef;
            const activated = document.activeElement;

            if (activated instanceof HTMLElement && dialog instanceof Vue) {
                if (dialog.$el.contains(activated)) {
                    return activated.focus();
                } else {
                    if (!dialog.$_focuson) return;
                    return dialog.$_focuson();
                }
            }

            if (!(dialog instanceof Vue) || !dialog.$_focuson) return;
            dialog.$_focuson();
        },
        $_afterEnter() {
            this.$emit('opened');
            hooks.opened.forEach(fun => fun(this.$refs.dialogRef));
        }
    },
    /**
     * 渲染函数<br>
     *
     * 如果 {@code modal} 属性不为 {@code true} 则不会渲染遮罩层, 将只渲染一个对话框组件
     *
     * @private
     * @param {CreateElement} h CreateElement
     * @return {VNode} Vue 节点
     */
    render(h) {
        const keydowns = [];
        if (this.keyboardDismiss) {
            keydowns.push(this.$_escapeDismiss);
        }

        const node = h('transition', {
            props: {name: 'j-dialog-transition', mode: 'out-in'},
            on: {afterEnter: this.$_afterEnter}
        }, [
            h(Dialog, {
                ref: 'dialogRef',
                class: this.xClass,
                style: this.xStyle,
                attrs: {...this.$attrs},
                nativeOn: {keydown: keydowns},
                props: {visible: this.visible, ariaModal: this.modal},
                scopedSlots: this.$scopedSlots,
                directives: [{name: 'show', value: this.visible, expression: 'show'}]
            })
        ]);

        if (!this.modal) {
            return node;
        }

        return h('div', {
            staticClass: 'j-dialog-wrapper',
            on: {keydown: keydowns}
        }, [
            node,
            renderBackdrop(h, this.visible, this.$_clickBackdrop)
        ]);
    }
};

export default component;
