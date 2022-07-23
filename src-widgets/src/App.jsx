import React from 'react';
import { withStyles } from '@mui/styles';

import WidgetDemoApp from '@iobroker/vis-widgets-react-dev/widgetDemoApp';
import { i18n as I18n } from '@iobroker/adapter-react-v5';

import Thermostat from './Thermostat';
import Actual from './Actual';
import Switches from './Switches';
import Static from './Static';

const styles = theme => ({
    app: {
        backgroundColor: theme?.palette?.background.default,
        color: theme?.palette?.text.primary,
        height: '100%',
        width: '100%',
        overflow: 'auto',
        display: 'flex',
    },
});

class App extends WidgetDemoApp {
    constructor(props) {
        super(props);

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
        // init translations
        I18n.extendTranslations(translations);

        this.socket.registerConnectionHandler(this.onConnectionChanged)
    }

    onConnectionChanged = isConnected => {
        if (isConnected) {
            this.socket.getSystemConfig()
                .then(systemConfig => this.setState({ systemConfig }));
        }
    };

    renderWidget() {
        return <div className={this.props.classes.app}>
            <Static
                socket={this.socket}
                style={{
                    width: 400,
                    height: 160,
                }}
                systemConfig={this.state.systemConfig}
                data={{
                    name: 'Static information',
                    count: 2,
                    oid1: 'javascript.0.thermostat.actual',
                    oid2: 'javascript.0.numberWithStates',
                    title1: 'Number',
                    title2: 'States',
                }}
            />
            <Switches
                socket={this.socket}
                style={{
                    width: 400,
                    height: 180,
                }}
                systemConfig={this.state.systemConfig}
                data={{
                    name: 'Switches',
                    count: 5,
                    type: 'buttons',
                    allSwitch: true,
                    buttonsWidth: 110,
                    buttonsHeight: 80,
                    oid1: 'javascript.0.boolean',
                    oid2: 'javascript.0.test',
                    oid3: 'javascript.0.boolean',
//                    oid4: 'javascript.0.test',
 //                   oid5: 'javascript.0.numberWithStates',
                    title2: 'Dimmer',
                }}
            />
            <Thermostat
                socket={this.socket}
                style={{
                    width: 600,
                    height: 650,
                }}
                systemConfig={this.state.systemConfig}
                data={{
                    name: 'Thermostat',
                    'oid-mode': 'javascript.0.thermostat.mode',
                    'oid-power': 'javascript.0.thermostat.power',
                    'oid-temp-set': 'javascript.0.thermostat.setPoint',
                    'oid-temp-actual': 'javascript.0.thermostat.actual',
                }}
            />
            <Actual
                socket={this.socket}
                style={{
                    width: 400,
                    height: 200,
                }}
                systemConfig={this.state.systemConfig}
                data={{
                    name: 'Actual temperature',
                    timeInterval: 6,
                    'oid-temperature': 'system.adapter.admin.0.memHeapTotal',
                    'oid-humidity': 'system.adapter.admin.0.memHeapUsed',
                }}
            />
        </div>;
    }
}

export default withStyles(styles)(App);
