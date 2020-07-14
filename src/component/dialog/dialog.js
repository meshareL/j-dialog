'use strict';
import Vue, {CreateElement} from 'vue';
import {focusable, autofocus, restrictTabBehavior} from '../../util/dom';
import Header from './header';

const matrixReg = /^matrix\((?:[-\d.]+,\s*){4}([-\d.]+),\s*([-\d.]+)\)$/,
      matrix3dReg = /^matrix3d\((?:[-\d.]+,\s*){12}([-\d.]+),\s*([-\d.]+)(?:,\s*[-\d.]+){2}\)/;

const component = {
    name: 'JDialog',
    inheritAttrs: false,
    provide() {
        return {
            addInternalButton: this.addInternalButton,
            removeInternalButton: this.removeInternalButton
        };
    },
    props: {
        /**
         * 对话框是否可见, 支持 .sync 修饰符
         */
        visible: {required: false, type: Boolean, default: false},
        /**
         * 对话框 {@code aria-modal} 属性
         *
         * @see https://www.w3.org/TR/wai-aria-1.2/#aria-modal aria-modal
         */
        ariaModal: {required: false, type: Boolean, default: false},
        /**
         * 对话框是否可拖动
         */
        draggable: {required: false, type: Boolean, default: true},
        /**
         * 对话框关闭后是否重置元素定位
         */
        resetPosition: {required: false, type: Boolean, default: true},
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
    data() {
        return {
            /** 对话框拖拽中 */
            dragging: false,
            /** 对话框拖动定位 */
            position: {x: undefined, y: undefined},
            /**
             * 所有按钮组件
             * @type {{priority: number, vm: Vue}[]}
             */
            internalButtons: [],
            /**
             * 对话框打开前已聚焦的元素
             * @type {?HTMLElement}
             */
            beforeOpenFocused: null
        };
    },
    computed: {
        /**
         * 元素变形 css
         *
         * @return {{transform?: string}} css
         */
        dragged() {
            if (typeof this.position.x === 'number' && typeof this.position.y === 'number') {
                // 使用 translate3d 强制浏览器开启 gpu 加速
                return {transform: `translate3d(${this.position.x}px, ${this.position.y}px, 1px)`};
            }

            return {};
        },
        /**
         * 优先聚焦的按钮组件
         *
         * @return {?Vue} 按钮组件
         */
        priorityFocusButton() {
            if (!this.internalButtons || !this.internalButtons.length) return null;

            let index = 0;
            this.internalButtons
                .filter(({vm: {$el}}) => $el instanceof HTMLElement)
                .filter(({vm: {$el}}) => focusable($el))
                .reduce((prev, {priority: cur}, i) => cur > prev ? (index = i, cur) : prev, Number.MIN_SAFE_INTEGER);

            return this.internalButtons[index].vm;
        }
    },
    watch: {
        visible: {
            immediate: true,
            handler(status) {
                if (status) {
                    this.$_disposeFocus(status);
                    this.$_focuson();
                    return;
                }

                this.$_disposeFocus(status);
                if (this.resetPosition) {
                    this.$nextTick(() => {
                        this.position.x = undefined;
                        this.position.y = undefined;
                    });
                }
            }
        }
    },
    methods: {
        /**
         * 处理对话框打开前与关闭后元素的焦点
         *
         * 对话框打开前保存当前已聚焦的元素
         * 对话框关闭后聚焦到保存的元素
         *
         * @param {boolean} status 对话框显示状态
         */
        $_disposeFocus(status) {
            if (status) {
                const activated = document.activeElement;
                if (!(activated instanceof HTMLElement)) return;

                this.beforeOpenFocused = activated;
                return;
            }

            if (!(this.beforeOpenFocused instanceof HTMLElement)) return;
            this.beforeOpenFocused.focus();
        },
        /**
         * 使第一个匹配到的元素获取焦点
         * 1. 第一个拥有 [autofocus] 属性的元素
         * 2. 对话框按钮 e.g Button 组件
         * 3. 对话框本身
         *
         * @private
         */
        $_focuson() {
            if (autofocus(this.$el)) return;

            /** @type {?HTMLElement} */
            let element;
            if (this.priorityFocusButton) {
                element = /** @type {HTMLElement} */this.priorityFocusButton.$el;
            }

            if (!element && this.$el instanceof HTMLElement) {
                element = this.$el;
            }

            if (!element) return;
            this.$nextTick(() => element.focus());
        },
        /**
         * 鼠标按下后将监听 document 元素 mousemove 事件
         *
         * @private
         * @param {MouseEvent} event MouseEvent
         * @see https://juejin.im/post/5d87523551882517a0319ae5 css-transform 实现拖拽功能
         */
        $_onmousedown(event) {
            const el = this.$el;
            if (!(el instanceof HTMLElement)) return;

            const trailing = getComputedStyle(el);
            // translate3d(0, 0, 1px)
            const transform = trailing.transform === 'none' ? 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1)' : trailing.transform;
            const matrix = transform.match(matrixReg) || transform.match(matrix3dReg);
            if (!matrix) return;

            const minX = -el.offsetLeft;
            const minY = -el.offsetTop;
            const maxX = document.body.clientWidth - el.offsetLeft - el.clientWidth;
            const maxY = document.body.clientHeight - el.offsetTop - el.clientHeight;

            !event.defaultPrevented && event.preventDefault();

            // 算出鼠标相对元素的位置
            const distX = event.clientX - Number.parseInt(matrix[1], 10);
            const distY = event.clientY - Number.parseInt(matrix[2], 10);

            this.position.x = Number.parseInt(matrix[1], 10);
            this.position.y = Number.parseInt(matrix[2], 10);

            const that = this;
            /**
             * 监听鼠标移动, 更新元素位置
             *
             * @param {MouseEvent} e MouseEvent
             */
            function onmousemove(e) {
                that.dragging = true;
                that.position.x = Math.min(Math.max(minX, e.clientX - distX), maxX);
                that.position.y = Math.min(Math.max(minY, e.clientY - distY), maxY);
            }

            /**
             * 鼠标放开后, 取消监听 mousemove 事件,
             * 同时删除 observed 中的相关资源
             */
            function onmouseup() {
                that.dragging = false;
                document.removeEventListener('mousemove', onmousemove);
            }

            document.addEventListener('mousemove', onmousemove, {passive: true});
            document.addEventListener('mouseup', onmouseup, {once: true, passive: true});
        },

        /**
         * 添加对话框按钮
         *
         * @param {number} priority 优先级
         * @param {Vue} vm Vue实例
         */
        addInternalButton(priority, vm) {
            if (this.internalButtons.some(({vm: $vm}) => $vm === vm)) return;

            this.internalButtons.push({priority, vm});
        },
        /**
         * 删除对话框按钮
         *
         * @param {Vue} vm Vue实例
         */
        removeInternalButton(vm) {
            const index = this.internalButtons.findIndex(({vm: $vm}) => $vm === vm);
            if (index === -1) return;

            this.internalButtons.splice(index, 1);
        }
    },
    render(/** CreateElement */h) {
        const data = {
            staticClass: 'j-dialog rudiment',
            class: {'dragging': this.dragging},
            style: {...this.dragged},
            on: {keydown: restrictTabBehavior},
            attrs: {
                role: 'dialog',
                tabindex: '-1',
                'aria-modal': this.ariaModal ? 'true' : 'false',
                'aria-labelledby': this.titleId,
                'aria-describedby': this.describeId
            }
        };

        const headerEL = h(Header, {
            class: {'draggable': this.draggable},
            attrs: {...this.$attrs},
            props: {titleId: this.titleId, describeId: this.describeId},
            nativeOn: {mousedown: this.draggable ? this.$_onmousedown : []},
            scopedSlots: {title: this.$scopedSlots.title, describe: this.$scopedSlots.describe}
        });

        const slot = this.$scopedSlots.default;
        // 使用范围插槽可以获取当前组件显示状态
        return h('div', data, [headerEL, slot ? slot({visible: this.visible}) : this.$slots.default]);
    }
};

export default component;
