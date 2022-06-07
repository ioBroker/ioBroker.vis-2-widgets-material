import React from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import withStyles from '@mui/styles/withStyles';

import GenericApp from '@iobroker/adapter-react-v5/GenericApp';
import I18n from '@iobroker/adapter-react-v5/i18n';
import Loader from '@iobroker/adapter-react-v5/Components/Loader';

import Thermostat from './Thermostat';

const styles = theme => ({
    app: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        height: '100%',
    },
});

class App extends GenericApp {
    constructor(props) {
        const extendedProps = { ...props };
        super(props, extendedProps);

        (async () => {
            this.translations = {
                'en': (await import('@iobroker/adapter-react-v5/i18n/en.json')).default,
                'de': (await import('@iobroker/adapter-react-v5/i18n/de.json')).default,
                'ru': (await import('@iobroker/adapter-react-v5/i18n/ru.json')).default,
                'pt': (await import('@iobroker/adapter-react-v5/i18n/pt.json')).default,
                'nl': (await import('@iobroker/adapter-react-v5/i18n/nl.json')).default,
                'fr': (await import('@iobroker/adapter-react-v5/i18n/fr.json')).default,
                'it': (await import('@iobroker/adapter-react-v5/i18n/it.json')).default,
                'es': (await import('@iobroker/adapter-react-v5/i18n/es.json')).default,
                'pl': (await import('@iobroker/adapter-react-v5/i18n/pl.json')).default,
                'zh-cn': (await import('@iobroker/adapter-react-v5/i18n/zh-cn.json')).default,
            };

            const translations = {
                'en': (await import('./i18n/en.json')).default,
                'de': (await import('./i18n/de.json')).default,
                'ru': (await import('./i18n/ru.json')).default,
                'pt': (await import('./i18n/pt.json')).default,
                'nl': (await import('./i18n/nl.json')).default,
                'fr': (await import('./i18n/fr.json')).default,
                'it': (await import('./i18n/it.json')).default,
                'es': (await import('./i18n/es.json')).default,
                'pl': (await import('./i18n/pl.json')).default,
                'zh-cn': (await import('./i18n/zh-cn.json')).default,
            };
            // merge together
            Object.keys(translations).forEach(lang => this.translations[lang] = Object.assign(this.translations[lang], translations[lang]));

            console.log(this.translations);
            // init translations
            I18n.setTranslations(this.translations);
        })();
        I18n.setLanguage((navigator.language || navigator.userLanguage || 'en').substring(0, 2).toLowerCase());
        
    }

    componentDidMount() {
        super.componentDidMount();
    }

    render() {
        if (!this.state.loaded) {
            return <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                    <Loader theme={this.state.themeType} />
                </ThemeProvider>
            </StyledEngineProvider>;
        }

        return <StyledEngineProvider injectFirst>
            <ThemeProvider theme={this.state.theme}>
                <div className={this.props.classes.app}>
                    <Thermostat socket={this.socket} />
                </div>
            </ThemeProvider>
        </StyledEngineProvider>;
    }
}

export default withStyles(styles)(App);