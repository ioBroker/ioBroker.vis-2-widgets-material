import React from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import { I18n, Loader, GenericApp, type GenericAppProps } from '@iobroker/adapter-react-v5';

import langEn from '@iobroker/adapter-react-v5/i18n/en.json';
import langDe from '@iobroker/adapter-react-v5/i18n/de.json';
import langRu from '@iobroker/adapter-react-v5/i18n/ru.json';
import langPt from '@iobroker/adapter-react-v5/i18n/pt.json';
import langNl from '@iobroker/adapter-react-v5/i18n/nl.json';
import langFr from '@iobroker/adapter-react-v5/i18n/fr.json';
import langIt from '@iobroker/adapter-react-v5/i18n/it.json';
import langEs from '@iobroker/adapter-react-v5/i18n/es.json';
import langPl from '@iobroker/adapter-react-v5/i18n/pl.json';
import langUk from '@iobroker/adapter-react-v5/i18n/uk.json';
import langZh from '@iobroker/adapter-react-v5/i18n/zh-cn.json';

export default class WidgetDemoApp extends GenericApp {
    constructor(props: GenericAppProps) {
        const extendedProps = {
            ...props,
            socket: {
                port: '8082',
            },
        };
        super(props, extendedProps);

        const translations = {
            en: langEn,
            de: langDe,
            ru: langRu,
            pt: langPt,
            nl: langNl,
            fr: langFr,
            it: langIt,
            es: langEs,
            pl: langPl,
            uk: langUk,
            'zh-cn': langZh,
        };

        // init translations
        I18n.setTranslations(translations);
        I18n.setLanguage((navigator.language || 'en').substring(0, 2).toLowerCase() as ioBroker.Languages);
    }

    renderWidget(): React.JSX.Element {
        return <div>Please implement renderWidget method in your class</div>;
    }

    render(): React.JSX.Element {
        if (!this.state.loaded) {
            return (
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={this.state.theme}>
                        <Loader themeType={this.state.themeType} />
                    </ThemeProvider>
                </StyledEngineProvider>
            );
        }

        const style = {
            backgroundColor: this.state.themeType === 'dark' ? '#303030' : '#f0f0f0',
            color: this.state.themeType === 'dark' ? '#f0f0f0' : '#303030',
            height: '100%',
            width: '100%',
            overflow: 'auto',
        };

        return (
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                    <div style={style}>{this.renderWidget()}</div>
                </ThemeProvider>
            </StyledEngineProvider>
        );
    }
}
