import React from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import { withStyles } from '@mui/styles';

import GenericApp from '@iobroker/adapter-react-v5/GenericApp';
import i18n from '@iobroker/adapter-react-v5/i18n';
import Loader from '@iobroker/adapter-react-v5/Components/Loader';

import Thermostat from './Thermostat';
import Actual from './Actual';
import Switches from './Switches';
import Static from './Static';

const styles = theme => ({
    app: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        height: '100%',
        width: '100%',
        overflow: 'auto',
    },
});

class App extends GenericApp {
    constructor(props) {
        const extendedProps = { ...props };
        super(props, extendedProps);

        (async () => {
            this.translations = {
                en: require('@iobroker/adapter-react-v5/i18n/en.json'),
                de: require('@iobroker/adapter-react-v5/i18n/de.json'),
                ru: require('@iobroker/adapter-react-v5/i18n/ru.json'),
                pt: require('@iobroker/adapter-react-v5/i18n/pt.json'),
                nl: require('@iobroker/adapter-react-v5/i18n/nl.json'),
                fr: require('@iobroker/adapter-react-v5/i18n/fr.json'),
                it: require('@iobroker/adapter-react-v5/i18n/it.json'),
                es: require('@iobroker/adapter-react-v5/i18n/es.json'),
                pl: require('@iobroker/adapter-react-v5/i18n/pl.json'),
                'zh-cn': require('@iobroker/adapter-react-v5/i18n/zh-cn.json'),
            };

            const translations = {
                en: require('./i18n/en.json'),
                de: require('./i18n/de.json'),
                ru: require('./i18n/ru.json'),
                pt: require('./i18n/pt.json'),
                nl: require('./i18n/nl.json'),
                fr: require('./i18n/fr.json'),
                it: require('./i18n/it.json'),
                es: require('./i18n/es.json'),
                pl: require('./i18n/pl.json'),
                'zh-cn': require('./i18n/zh-cn.json'),
            };
            // merge together
            Object.keys(translations).forEach(lang => this.translations[lang] = Object.assign(this.translations[lang], translations[lang]));

            console.log(this.translations);
            // init translations
            i18n.setTranslations(this.translations);
        })();
        i18n.setLanguage((navigator.language || navigator.userLanguage || 'en').substring(0, 2).toLowerCase());
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
                    <div>
                        <Static
                            socket={this.socket}
                            style={{
                                width: 400,
                                height: 200,
                            }}
                            data={{
                                name: 'Static information',
                                count: 2,
                                oid1: 'javascript.0.number1',
                                oid2: 'javascript.0.numberWithStates',
                            }}
                        />
                    </div>
                    <div>
                        <Switches
                            socket={this.socket}
                            style={{
                                width: 400,
                                height: 200,
                            }}
                            data={{
                                name: 'Switches',
                                count: 2,
                                type: 'buttons',
                                allSwitch: true,
                                oid1: 'javascript.0.boolean',
                                oid2: 'javascript.0.test',
                            }}
                        />
                    </div>
                    <div>
Thermostat:
                        <Thermostat
                            socket={this.socket}
                            style={{
                                width: 600,
                                height: 600,
                            }}
                            data={{
                                name: '11',
                                'oid-mode': 'javascript.0.mode',
                                'oid-power': 'javascript.0.power',
                                'oid-temp': 'javascript.0.temperatureSet',
                                'oid-temp-state': 'javascript.0.temperatureActual',
                            }}
                        />
                    </div>
                    <div>
Actual:
                        <Actual
                            socket={this.socket}
                            style={{
                                width: 600,
                                height: 600,
                            }}
                            data={{
                                name: '11',
                                'oid-temperature': 'javascript.0.temperatureActual',
                                'oid-humidity': 'javascript.0.humidityActual',
                            }}
                        />
                    </div>
                </div>
            </ThemeProvider>
        </StyledEngineProvider>;
    }
}

export default withStyles(styles)(App);
