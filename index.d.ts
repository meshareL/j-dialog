import {PluginFunction} from 'vue';

interface Option {
    names?: {
        dialog?: string;
        content?: string;
        footer?: string;
        button?: string;
    };
    hooks?: {
        open: Function[];
        opened: Function[];
        closed: Function[];
    }
}

declare const install: PluginFunction<Option>;
export default install;
