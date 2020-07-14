'use strict';
import {assert} from 'chai';
import Vue from 'vue';
import {shallowMount, mount, createLocalVue} from '@vue/test-utils';
import {Button, Wrapper} from '../src/component';
import Dialog from '../src/component/dialog/dialog';
import Header from '../src/component/dialog/header';
import install from '../src';

describe('Vue j-dialog component', () => {
    describe('install plugin', () => {
        // todo opened event
        it('global hook', async () => {
            const emitted = [];
            const hooks = {
                open: () => emitted.push('open'),
                opened: () => emitted.push('opened'),
                closed: () => emitted.push('closed')
            };

            const localVue = createLocalVue();
            localVue.use(install, {hooks});

            const element = mount({
                data() {
                    return { visible: true };
                },
                template: `<j-dialog :visible="visible"></j-dialog>`
            }, {localVue, stubs: {transition: false}});

            element.setData({visible: false});
            await Vue.nextTick();

            assert.isTrue(element.exists());
            assert.deepEqual(emitted, ['open', 'closed']);
        });
    });

    describe('modal and non-modal dialog', () => {
        it('modal dialog', () => {
            const element = mount(Wrapper, {propsData: {modal: true}});

            assert.isTrue(element.exists());
            assert.isTrue(element.find('.j-dialog-backdrop').exists());
            assert.equal(element.find(Dialog).attributes('aria-modal'), 'true')
        });

        it('non modal dialog', () => {
            const element = mount(Wrapper, {propsData: {modal: false}});

            assert.isTrue(element.exists());
            assert.isFalse(element.find('.j-dialog-backdrop').exists());
            assert.equal(element.find(Dialog).attributes('aria-modal'), 'false');
        });
    });

    describe('enable or disable the Escape shortcut to close the dialog', () => {
        it('enable escape shortcut', async () => {
            const element = shallowMount(Wrapper, {propsData: {visible: true, keyboardDismiss: true}});

            assert.isTrue(element.exists());

            const el = element.findComponent(Dialog);
            assert.isTrue(el.exists());

            await el.trigger('keydown', {key: 'Escape', code: 'Escape'});
            assert.isNotEmpty(element.emitted('update:visible'));
        });

        it('disable escape shortcut', async () => {
            const element = shallowMount(Wrapper, {propsData: {visible: true, keyboardDismiss: false}});

            assert.isTrue(element.exists());

            const el = element.findComponent(Dialog);
            assert.isTrue(el.exists());

            await el.trigger('keydown', {key: 'Escape', code: 'Escape'});
            assert.isNotOk(element.emitted('update:visible'));
        });
    });

    describe('enable or disable the backdrop close dialog', () => {
        it('enable backdrop close dialog', async () => {
            const element = shallowMount(Wrapper, {propsData: {visible: true, backdropDismiss: true}});
            assert.isTrue(element.exists());

            const el = element.find('.j-dialog-backdrop');
            await el.trigger('click');

            assert.isNotEmpty(element.emitted('update:visible'));
        });

        it('disable backdrop close dialog', async () => {
            const element = shallowMount(Wrapper, {propsData: {visible: true, backdropDismiss: false}});
            assert.isTrue(element.exists());

            const el = element.find('.j-dialog-backdrop');
            await el.trigger('click');

            assert.isNotOk(element.emitted('update:visible'));
        });
    });

    // todo
    describe('enable or disable screen scroll after the dialog opens', () => {
        beforeEach(() => document.body.style.overflowY = '');
        afterEach(() => document.body.style.overflowY = '');

        it('allow the scroll', () => {
            const root = mount(Wrapper, {propsData: {visible: true, lockScroll: false}});

            assert.isTrue(root.exists());
            assert.notEqual(document.body.style.overflowY, 'hidden');
        });

        it('forbidden scroll', () => {
            const root = mount(Wrapper, {propsData: {visible: true, lockScroll: true}});

            assert.isTrue(root.exists());
            assert.equal(document.body.style.overflowY, 'hidden');
        });
    });

    describe('beforeClose function', () => {
        let isEmitted = false;
        /** @type {Wrapper<Vue>} */
        let root;

        function returnTrue() {
            isEmitted = true;
            return true;
        }

        function returnFalse() {
            isEmitted = true;
            return false;
        }

        beforeEach(() => root = mount(Wrapper, {propsData: {visible: true, backdropDismiss: true, keyboardDismiss: true}}));
        afterEach(() => isEmitted = false);

        describe('dismiss button trigger', () => {
            it('return true', async () => {
                root.setProps({beforeClose: returnTrue});
                assert.isTrue(root.exists());

                const btn = root.findComponent(Button);
                await btn.trigger('click');

                assert.isTrue(isEmitted);
                assert.isNotEmpty(root.emitted('update:visible'));
            });

            it('return false', async () => {
                root.setProps({beforeClose: returnFalse});
                assert.isTrue(root.exists());

                const btn = root.findComponent(Button);
                await btn.trigger('click');

                assert.isTrue(isEmitted);
                assert.isNotOk(root.emitted('update:visible'));
            });
        });

        describe('backdrop trigger', () => {
            it('return true', async () => {
                root.setProps({beforeClose: returnTrue});
                assert.isTrue(root.exists());

                const backdrop = root.find('.j-dialog-backdrop');
                await backdrop.trigger('click');

                assert.isTrue(isEmitted);
                assert.isNotEmpty(root.emitted('update:visible'));
            });

            it('return false', async () => {
                root.setProps({beforeClose: returnFalse});
                assert.isTrue(root.exists());

                const backdrop = root.find('.j-dialog-backdrop');
                await backdrop.trigger('click');

                assert.isTrue(isEmitted);
                assert.isNotOk(root.emitted('update:visible'));
            });
        });

        describe('escape shortcut', () => {
            it('return true', async () => {
                root.setProps({beforeClose: returnTrue});
                assert.isTrue(root.exists());

                const element = root.findComponent(Dialog);
                await element.trigger('keydown', {key: 'Escape', code: 'Escape'});

                assert.isTrue(isEmitted);
                assert.isNotEmpty(root.emitted('update:visible'));
            });

            it('return false', async () => {
                root.setProps({beforeClose: returnFalse});
                assert.isTrue(root.exists());

                const element = root.findComponent(Dialog);
                await element.trigger('keydown', {key: 'Escape', code: 'Escape'});

                assert.isTrue(isEmitted);
                assert.isNotOk(root.emitted('update:visible'));
            });
        });
    });

    describe('dialog header', () => {
        function assertTitleOrDescribe(isTitle, root, id, content) {
            assert.isTrue(root.exists());

            const dialogEl = root.findComponent(Dialog);
            assert.isTrue(dialogEl.exists());
            assert.equal(dialogEl.attributes(isTitle ? 'aria-labelledby' : 'aria-describedby'), id);

            const el = root.find(isTitle ? '.title' : '.describe');
            assert.isTrue(el.exists());
            assert.equal(el.attributes('id'), id);
            assert.include(el.html(), content);
        }

        describe('close button', () => {
            it('render', () => {
                const root = mount(Wrapper, {propsData: {visible: true, dismissable: true}});
                assert.isTrue(root.exists());

                assert.isTrue(root.findComponent(Button).exists());
            });

            it('not render', () => {
                const root = mount(Wrapper, {propsData: {visible: true, dismissable: false}});
                assert.isTrue(root.exists());

                assert.isFalse(root.findComponent(Button).exists());
            });
        });

        describe('title', () => {
            it('via prop', () => {
                assertTitleOrDescribe(
                    true,
                    mount(Wrapper, {propsData: {visible: true, title: 'Title', titleId: 'dialog_title'}}),
                    'dialog_title',
                    'Title'
                );
            });

            it('via scoped slot', () => {
                assertTitleOrDescribe(
                    true,
                    mount(Wrapper, {
                        propsData: {visible: true, titleId: 'dialog_title', title: Math.random().toString(16).substring(2)},
                        scopedSlots: {
                            title: '<template><p>title scoped slot</p></template>'
                        }
                    }),
                    'dialog_title',
                    '<p>title scoped slot</p>'
                );
            });
        });

        describe('describe', () => {
            it('via prop', () => {
                assertTitleOrDescribe(
                    false,
                    mount(Wrapper, {propsData: {visible: true, describeId: 'dialog_describe', describe: 'Describe'}}),
                    'dialog_describe',
                    'Describe'
                );
            });

            it('via scoped slot', () => {
                assertTitleOrDescribe(
                    false,
                    mount(Wrapper, {
                        propsData: {visible: true, describeId: 'dialog_describe', describe: Math.random().toString(16).substring(2)},
                        scopedSlots: {
                            describe: '<template><p>describe scoped slot</p></template>'
                        }
                    }),
                    'dialog_describe',
                    '<p>describe scoped slot</p>'
                );
            });
        });
    });

    describe('dismiss button', () => {
        it('close dialog', async () => {
            const root = mount(Wrapper, {
                propsData: {visible: true},
                scopedSlots: {
                    default() {return this.$createElement(Button, {props: {isDismisser: true}, attrs: {id: 'dismiss-button-1'}}, 'Close')}
                }
            });
            assert.isTrue(root.exists());

            const btn = root.find('#dismiss-button-1');
            assert.isTrue(btn.exists());
            assert.equal(btn.text(), 'Close');

            await btn.trigger('click');
            assert.isNotEmpty(root.emitted('update:visible'));
        });
    });

    describe('focus management', () => {
        beforeEach(() => {
            const container = document.createElement('div');
            container.id = 'ut_id';
            document.body.append(container);
        });

        afterEach(() => document.body.innerHTML = '');

        it('first focus on the element with autofocus attribute', async () => {
            const root = mount(Dialog, {
                attachTo: '#ut_id',
                propsData: {visible: true},
                slots: {
                    default: '<input name="name" autofocus type="text">' +
                             '<input name="email" autofocus type="email">'
                }
            });

            assert.isTrue(root.exists());

            root.vm.$_focuson();
            await Vue.nextTick();

            assert.equal(document.activeElement, root.find('input[name="name"]').element);
            root.destroy();
        });

        it('if there is no element with autofocus attribute, focus on the Button component', async () => {
            const root = mount(Dialog, {attachTo: '#ut_id', propsData: {visible: true}});
            assert.isTrue(root.exists());

            root.vm.$_focuson();
            await Vue.nextTick();

            const btn = root.findComponent(Button);
            assert.isTrue(btn.exists());
            assert.equal(document.activeElement, btn.element);
            root.destroy();
        });

        it('if there is no element with autofocus attribute, focus on the Button component with higher priority', async () => {
            const root = mount(Dialog, {
                attachTo: '#ut_id',
                propsData: {visible: true, dismissable: true},
                scopedSlots: {
                    default() {
                        return this.$createElement('div', [
                            this.$createElement(Button, {props: {priority: 1, isDismisser: false}}, 'Open'),
                            this.$createElement(Button, {props: {priority: 2, isDismisser: true}, attrs: {id: 'close_button'}}, 'Close')
                        ])
                    }
                }
            });
            assert.isTrue(root.exists());

            const buttons = root.findAllComponents(Button);
            assert.equal(buttons.length, 3);

            root.vm.$_focuson();
            await Vue.nextTick();

            const focused = root.find('#close_button');
            assert.isTrue(focused.exists());
            assert.equal(document.activeElement, focused.element);
            root.destroy();
        });

        it('if there is no element with autofocus attribute and there is no Button component, the focus dialog itself', async () => {
            const root = mount(Dialog, {attachTo: '#ut_id', propsData: {visible: true, dismissable: false}});
            assert.isTrue(root.exists());

            root.vm.$_focuson();
            await Vue.nextTick();

            assert.equal(document.activeElement, root.element);
            root.destroy();
        });

        it('when a dialog closes, focus returns to the element that invoked the dialog', async () => {
            const root = mount(Dialog, {attachTo: '#ut_id', propsData: {visible: false}});
            assert.isTrue(root.exists());

            const invoker = document.createElement('button');
            invoker.textContent = 'Open';
            invoker.type = 'button';
            invoker.onclick = event => {
                event.preventDefault();
                invoker.focus();
                root.setProps({visible: true});
            };
            document.body.append(invoker);
            invoker.click();

            root.setProps({visible: false});

            assert.equal(document.activeElement, invoker);
            root.destroy();
        });

        describe('tab', () => {
            it('moves focus to the next tabbable element inside the dialog', async () => {
                const root = mount(Dialog, {
                    attachTo: '#ut_id',
                    propsData: {visible: true},
                    slots: {
                        default: '<input name="name" autofocus type="text">' +
                                 '<input name="password" type="password">'
                    }
                });
                assert.isTrue(root.exists());

                root.vm.$_focuson();
                await Vue.nextTick();

                await root.trigger('keydown', {key: 'Tab', shiftKey: false});
                assert.equal(document.activeElement, root.find('input[name="password"]').element);
                root.destroy();
            });

            it('if focus is on the last tabbable element inside the dialog, moves focus to the first tabbable element inside the dialog', async () => {
                const root = mount(Dialog, {
                    attachTo: '#ut_id',
                    propsData: {visible: true, dismissable: false},
                    slots: {
                        default: '<input name="name" type="text">' +
                                 '<input name="password" autofocus type="password">'
                    }
                });
                assert.isTrue(root.exists());

                root.vm.$_focuson();
                await Vue.nextTick();

                await root.trigger('keydown', {key: 'Tab', shiftKey: false});
                assert.equal(document.activeElement, root.find('input[name="name"]').element);
                root.destroy();
            });
        });

        describe('shift + tab', () => {
            it('moves focus to the previous tabbable element inside the dialog', async () => {
                const root = mount(Dialog, {
                    attachTo: '#ut_id',
                    propsData: {visible: true, dismissable: false},
                    slots: {
                        default: '<input name="name" type="text">' +
                                 '<input name="password" autofocus type="password">'
                    }
                });
                assert.isTrue(root.exists());

                root.vm.$_focuson();
                await Vue.nextTick();

                await root.trigger('keydown', {key: 'Tab', shiftKey: true});
                assert.equal(document.activeElement, root.find('input[name="name"]').element);
                root.destroy();
            });

            it('if focus is on the first tabbable element inside the dialog, moves focus to the last tabbable element inside the dialog', async () => {
                const root = mount(Dialog, {
                    attachTo: '#ut_id',
                    propsData: {visible: true, dismissable: false},
                    slots: {
                        default: '<input name="name" autofocus type="text">' +
                                 '<input name="password" type="password">'
                    }
                });
                assert.isTrue(root.exists());

                root.vm.$_focuson();
                await Vue.nextTick();

                await root.trigger('keydown', {key: 'Tab', shiftKey: true});
                assert.equal(document.activeElement, root.find('input[name="password"]').element);
                root.destroy();
            });
        });
    });

    describe('event', () => {
        it('open dialog', async () => {
            const root = mount(Wrapper, {propsData: {visible: true}, stubs: {transition: false}});
            assert.isTrue(root.exists());

            await Vue.nextTick();
            // todo: opened event
            assert.hasAllKeys(root.emitted(), ['open']);
        });

        it('close dialog', async () => {
            const root = mount(Wrapper, {propsData: {visible: false}});
            assert.isTrue(root.exists());

            await Vue.nextTick();
            assert.hasAllKeys(root.emitted(), ['closed']);
        });
    });

    describe('dialog drag', () => {
        /** @type {Wrapper<Vue>} */
        let root;

        async function getCoord(/** Wrapper<Vue> */ wrapper) {
            await Vue.nextTick();
            const translate = wrapper.element.style.transform;
            return translate
                .slice(translate.indexOf('(') + 1, translate.lastIndexOf(')'))
                .split(/,\s+/)
                .map(pos => Number.parseInt(pos, 10));
        }

        before(() => {
            const element = document.createElement('style');
            element.id = 'j-dialog-style';
            element.innerHTML = `body {
                width: 100vw;
                height: 100vh;
            }
            .rudiment {
                position: fixed;
                z-index: 100;
                top: 15vh;
                left: 50%;
                transform: translate3d(-50%, 0px, 1px);
            }`;
            document.head.append(element);
        });

        after(() => {
            const element = document.getElementById('j-dialog-style');
            element && element.remove();
        });

        beforeEach(() => {
            const div = document.createElement('div');
            div.id = 'draggable_id';
            document.body.append(div);

            root = mount(Dialog, {
                attachTo: '#draggable_id',
                propsData: {visible: true, draggable: true}
            });
            assert.isTrue(root.exists());
        });

        afterEach(() => {
            document.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, cancelable: true}));
            root.destroy();
            document.body.innerHTML = '';
        });

        it('dialog drag', async () => {
            const header = root.findComponent(Header);
            assert.isTrue(header.exists());

            const dialogX = root.element.offsetLeft;
            const dialogY = root.element.offsetTop;

            await header.trigger('mousedown', {clientX: dialogX + 5, clientY: dialogY + 5});

            const origin = await getCoord(root);
            assert.exists(origin[0]);
            assert.exists(origin[1]);

            document.dispatchEvent(new MouseEvent('mousemove', {clientX: dialogX - 10, clientY: dialogY - 10, bubbles: true, cancelable: true}));
            const leftMoved = await getCoord(root);
            assert.notEqual(leftMoved[0], origin[0]);
            assert.notEqual(leftMoved[1], origin[1]);

            document.dispatchEvent(new MouseEvent('mousemove', {clientX: dialogX + 10, clientY: dialogY + 10, bubbles: true, cancelable: true}));
            const rightMoved = await getCoord(root);
            assert.notEqual(rightMoved[0], origin[0]);
            assert.notEqual(rightMoved[1], origin[1]);
        });

        it('maximum drag distance', async () => {
            const header = root.findComponent(Header);
            assert.isTrue(header.exists());

            const dialogX = root.element.offsetLeft;
            const dialogY = root.element.offsetTop;

            await header.trigger('mousedown', {clientX: dialogX + 5, clientY: dialogY + 5});
            document.dispatchEvent(new MouseEvent('mousemove', {clientX: -100, clientY: -100, bubbles: true, cancelable: true}));
            const coord1 = await getCoord(root);
            document.dispatchEvent(new MouseEvent('mousemove', {clientX: -200, clientY: -200, bubbles: true, cancelable: true}));
            const coord2 = await getCoord(root);

            assert.equal(coord2[0], coord1[0]);
            assert.equal(coord2[1], coord1[1]);
        });
    });
});
