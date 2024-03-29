import {defineConfig} from 'vite'
import Handlebars from 'handlebars';

export default defineConfig({
    base: '',
    plugins: [
        {
            name: 'handlebars',

            transform(source, id) {
                if (id.endsWith('.hbs')) {
                    const precompiled = Handlebars.precompile(source);
                    return `
                        import Handlebars from 'handlebars/runtime.js';
                        const template = Handlebars.template(${precompiled});
                        export default (data, options) => template(data, options);
                    `
                }

                return null;
            },
        }
    ],
    test: {
        browser: {
            enabled: true,
            name: 'chrome',
        },
    }
})