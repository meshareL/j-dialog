# j-dialog
A dialog component for Vue

## 安装
```text
npm install @tomoeed/j-dialog --save
```

## 使用
### 安装插件
```javascript
import Vue from 'vue';
import JDialog from '@tomoeed/j-dialog';

Vue.use(JDialog, {names: {}, hooks: {}});
```

### 组件使用
对话框打开后元素聚焦规则:
1. 第一个拥有 `autofocus` 属性的元素
2. 对话框按钮组件 e.g j-dialog-button
3. 对话框自身

```vue
<template>
    <div>
        <button @click="visible = true" type="button">Open</button>

        <j-dialog :visible="visible"
                  :before-close="beforeClose"
                  title="Title"
                  title-id="dialog_title"
                  describe="'Describe'"
                  describe-id="dialog_describe"
                  @open="onOpen"
                  @opened="onOpened"
                  @closed="onClosed">
            <j-dialog-content>
                Content
            </j-dialog-content>

            <j-dialog-footer>
                <j-dialog-button :priority="1" :is-dismisser="true">Close</j-dialog-button>
            </j-dialog-footer>
        </j-dialog>
    </div>
</template>

<script>
    export default {
        name: 'YourComponent',
        data() {
            return { visible: false };
        },
        methods: {
            beforeClose() {
                // do something...
                return true; // or false
            },
            onOpen() { /* do something... */ },
            onOpened() { /* do something... */ },
            onClosed() { /* do something... */ }
        }
    };
</script>
```

## 插件可选的选项对象
- `names` 组件名称
```javascript
Vue.use(JDialog, {names: {
    dialog: 'j-dialog',
    content: 'j-dialog-content',
    footer: 'j-dialog-footer',
    button: 'j-dialog-button'
}});
```

- `hooks` 全局钩子
```javascript
Vue.use(JDialog, {hooks: {
    open: () => {},
    opened: () => {},
    closed: () => {}
}});
```

## 组件 Props
### j-dialog
Prop | Required | Type | Default | Description
--- | --- | --- | --- | ---
visible | false | Boolean | false | 对话框显示状态
modal | false | Boolean | true | 是否为模态对话框
keyboardDismiss | false | Boolean | true | Escape按键是否可以关闭对话框
backdropDismiss | false | Boolean | false | 点击遮罩层是否可以关闭对话框
lockScroll | false | Boolean | true | 对话框打开后是否禁止屏幕滚顶
beforeClose | false | Function | () => true | 对话框关闭前的回调函数, 会暂停对话框的关闭. 如果函数返回 `false`, 对话框将不会关闭
xClass | false | String\|Array\|Object | '' | 对话框`class`
xStyle | false | String\|Array\|Object | '' | 对话框`style`
draggable | false | Boolean | true | 对话框是否可拖动
resetPosition | false | Boolean | true | 对话框关闭后重置定位
title | false | String | '' | 对话框标题
titleId | false | String | undefined | 对话框标题`id`
describe | false | String | '' | 对话框描述
describeId | false | String | undefined | 对话框描述`id`
dismissable | false | Boolean | true | 是否显示关闭按钮

### j-dialog-content
Prop | Required | Type | Default | Description
--- | --- | --- | --- | ---
tag | false | String | `div` | 渲染标签

### j-dialog-footer
无

### j-dialog-button
Prop | Required | Type | Default | Description
--- | --- | --- | --- | ---
priority | false | Number | 0 | 对话框打开后聚焦优先级(对话框内没有具有`autofocus`属性的元素使生效)
isDismisser | false | Boolean | false | 该按钮是否可以关闭对话框

## 组件插槽
Name | Description
--- | ---
title | 对话框标题
describe | 对话框描述

## License
[Apache-2.0](https://github.com/meshareL/j-dialog/blob/master/LICENSE)
