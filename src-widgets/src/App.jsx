import React from 'react';
import { withStyles } from '@mui/styles';

import WidgetDemoApp from '@iobroker/vis-2-widgets-react-dev/widgetDemoApp';
import { I18n } from '@iobroker/adapter-react-v5';

import { Checkbox } from '@mui/material';
import Thermostat from './Thermostat';
import Actual from './Actual';
import Switches from './Switches';
// import Static from './Static';
import SimpleState from './SimpleState';
import Clock from './Clock';
import ViewInWidget from './ViewInWidget';
import translations from './translations';
import Camera from './Camera';
import Map from './Map';
import Player from './Player';
import Security from './Security';
import Html from './Html';
import Blinds from './Blinds';
import ThemeSwitcher from './ThemeSwitcher';
import Wizard from './Wizard';

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

        this.state.disabled = JSON.parse(window.localStorage.getItem('disabled')) || {};

        // init translations
        I18n.extendTranslations(translations);

        this.socket.registerConnectionHandler(this.onConnectionChanged);
    }

    onConnectionChanged = isConnected => {
        if (isConnected) {
            this.socket.getSystemConfig()
                .then(systemConfig => this.setState({ systemConfig }));
        }
    };

    renderWidget() {
        const widgets = {
            wizard: Wizard.getWidgetInfo().customPalette(
                this.socket,
                {
                    test: {
                        widgets: {},
                    },
                },
                project => {
                    console.log(project);
                },
                'test',
            ),
            camera: <Camera
                key="Camera"
                socket={this.socket}
                style={{
                    width: 400,
                    height: 180,
                }}
                systemConfig={this.state.systemConfig}
                data={{
                    name: 'Camera',
                    url: 'https://loremflickr.com/320/240',
                    refreshInterval: 1000,
                    showRefreshTime: true,
                }}
            />,
            map: <Map
                key="Map"
                socket={this.socket}
                style={{
                    width: 400,
                    height: 420,
                }}
                systemConfig={this.state.systemConfig}
                data={{
                    name: 'Map',
                    markersCount: 1,
                    position1: 'javascript.0.marker1',
                    useHistory1: true,
                    theme: 'darkmatter',
                }}
            />,
            player: <Player
                key="Player"
                socket={this.socket}
                style={{
                    width: 400,
                    height: 420,
                }}
                systemConfig={this.state.systemConfig}
                data={{
                    name: 'Player',
                    cover: 'sonos.0.root.192_168_1_102.current_cover',
                    volume: 'sonos.0.root.192_168_1_102.volume',
                    muted: 'sonos.0.root.192_168_1_102.muted',
                    duration: 'sonos.0.root.192_168_1_102.current_duration',
                    elapsed: 'sonos.0.root.192_168_1_102.current_elapsed',
                    title: 'sonos.0.root.192_168_1_102.current_title',
                    artist: 'sonos.0.root.192_168_1_102.current_artist',
                    repeat: 'sonos.0.root.192_168_1_102.repeat',
                    shuffle: 'sonos.0.root.192_168_1_102.shuffle',
                    state: 'sonos.0.root.192_168_1_102.state',
                }}
            />,
            security: <Security
                key="Security"
                socket={this.socket}
                style={{
                    width: 400,
                    height: 180,
                }}
                systemConfig={this.state.systemConfig}
                data={{
                    name: 'Security',
                    buttonsCount: 2,
                    oid1: 'javascript.0.locked1',
                    name1: 'button1',
                    color1: 'blue',
                    oid2: 'javascript.0.locked2',
                    name2: 'button2',
                    color2: 'red',
                    pincode2: '1234',
                    timerSeconds2: 2,
                    pincodeReturnButton2: 'backspace',
                }}
            />,
            Html: <Html
                key="Html"
                socket={this.socket}
                style={{
                    width: 400,
                    height: 180,
                }}
                systemConfig={this.state.systemConfig}
                data={{
                    name: 'HTML',
                    html: '<div>Hallo<b',
                }}
            />,
            clock: <Clock
                key="Clock"
                socket={this.socket}
                themeType={this.state.themeType}
                style={{
                    width: 160,
                    height: 420,
                }}
                systemConfig={this.state.systemConfig}
                data={{
                    type: 'digital',
                    withSeconds: true,
                    showNumbers: true,
                    blinkDelimiter: true,
                    hoursFormat: '12',
                }}
            />,
            themeSwitcher: <ThemeSwitcher
                key="ThemeSwitcher"
                themeType={this.state.themeType}
                themeName={this.state.themeName}
                style={{
                    width: 48,
                    height: 48,
                }}
                data={{
                    type: 'variable',
                    themeName: 'light',
                }}
            />,
            // static: <Static
            //     key="Static"
            //     socket={this.socket}
            //     themeType={this.state.themeType}
            //     style={{
            //         width: 400,
            //         height: 160,
            //     }}
            //     systemConfig={this.state.systemConfig}
            //     data={{
            //         name: 'Static information',
            //         count: 2,
            //         oid1: 'javascript.0.thermostat.actual',
            //         oid2: 'javascript.0.numberWithStates',
            //         title1: 'Number',
            //         title2: 'States',
            //     }}
            // />,
            simplestate: <SimpleState
                key="SimpleState"
                socket={this.socket}
                style={{
                    width: 400,
                    height: 180,
                }}
                systemConfig={this.state.systemConfig}
                data={{
                    name: 'SimpleState',
                    values_count: 5,
                    oid: 'javascript.0.temperatureSet',
                    value1: 'COOL',
                    color1: 'blue',
                    value2: 'DRY',
                    color2: 'red',
                }}
            />,
            switches: <Switches
                key="Switches"
                socket={this.socket}
                themeType={this.state.themeType}
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
                    // oid4: 'javascript.0.test',
                    // oid5: 'javascript.0.numberWithStates',
                    title2: 'Dimmer',
                }}
            />,
            thermostat: <Thermostat
                key="Thermostat"
                socket={this.socket}
                themeType={this.state.themeType}
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
            />,
            actual: <Actual
                key="Actual"
                socket={this.socket}
                themeType={this.state.themeType}
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
            />,
            viewinwidget: <ViewInWidget
                key="ViewInWidget"
                socket={this.socket}
                themeType={this.state.themeType}
                style={{
                    width: 400,
                    height: 200,
                }}
                systemConfig={this.state.systemConfig}
                data={{
                    name: 'Actual temperature',
                }}
            />,
            blinds: <Blinds
                key="Blinds"
                socket={this.socket}
                themeType={this.state.themeType}
                style={{
                    width: 400,
                    height: 200,
                }}
                systemConfig={this.state.systemConfig}
                data={{
                    name: 'Blinds',
                }}
            />,
        };

        return <div className={this.props.classes.app}>
            <div>
                {Object.keys(widgets).map(key => <div key={key} style={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                        checked={!this.state.disabled[key]}
                        onChange={e => {
                            const disabled = JSON.parse(JSON.stringify(this.state.disabled));
                            disabled[key] = !e.target.checked;
                            window.localStorage.setItem('disabled', JSON.stringify(disabled));
                            this.setState({ disabled });
                        }}
                    />
                    {key}
                </div>)}
            </div>
            {Object.keys(widgets).map(key => (this.state.disabled[key] ? null : widgets[key]))}
        </div>;
    }
}

export default withStyles(styles)(App);
