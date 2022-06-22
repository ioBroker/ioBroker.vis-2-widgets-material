import React from 'react';
import { i18n } from '@iobroker/adapter-react-v5';

import {
    Button,
    Card, CardContent, CardHeader, IconButton, Switch,
} from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import VisRxWidget from './visRxWidget';

class Switches extends (window.visRxWidget || VisRxWidget) {
    constructor(props) {
        super(props);
        this.state.states = {};
        this.state.objects = {};
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterialSwitchesReact',
            visSet: 'material-widgets',
            visName: 'Switches',
            visAttrs_: 'name;oid-mode;oid-temp;oid-temp-state;oid-power',
            visAttrs: [{
                name: 'common',
                fields: [
                    {
                        name: 'name',
                    },
                    {
                        name: 'count',
                        type: 'number',
                        default: 2,
                    },
                    {
                        name: 'type',
                        type: 'select',
                        options: ['switches', 'buttons'],
                        default: 'switches',
                    },
                    {
                        name: 'allSwitch',
                        type: 'checkbox',
                        default: true,
                    },
                ],
            }, {
                name: 'switch',
                indexFrom: 1,
                indexTo: 'count',
                fields: [
                    {
                        name: 'oid',
                        type: 'id',
                    },
                    {
                        name: 'icon',
                        type: 'image',
                    },
                    {
                        name: 'iconEnabled',
                        type: 'image',
                    },
                    {
                        name: 'color',
                        type: 'color',
                    },
                    {
                        name: 'colorEnabled',
                        type: 'color',
                    },
                ],
            },
            ],
            visPrev: 'widgets/material-widgets/img/prev_switch.png',
        };
    }

    getSubscribeState = (id, cb) => {
        this.props.socket.getState(id).then(result => cb(result));
        this.props.socket.subscribeState(id, (resultId, result) => cb(result));
    };

    async propertiesUpdate() {
        const states = {};
        const objects = {};
        for (let i = 1; i <= this.state.data.count; i++) {
            if (this.state.data[`oid${i}`]) {
                states[i] = (await this.props.socket.getState(this.state.data[`oid${i}`])).val;
                const object = await this.props.socket.getObject(this.state.data[`oid${i}`]);
                const idArray = this.state.data[`oid${i}`].split('.');
                if (!object?.common.icon) {
                    const parentObject = await this.props.socket.getObject(idArray.slice(0, -1).join('.'));
                    if (!parentObject?.common.icon) {
                        const grandParentObject = await this.props.socket.getObject(idArray.slice(0, -2).join('.'));
                        if (grandParentObject?.common.icon) {
                            object.common.icon = grandParentObject.common.icon;
                        }
                    } else {
                        object.common.icon = parentObject.common.icon;
                    }
                }
                objects[i] = object;
            }
        }
        this.setState({ states, objects });
    }

    componentDidMount() {
        super.componentDidMount();
        this.propertiesUpdate();
    }

    onPropertiesUpdated() {
        super.onPropertiesUpdated();
        this.propertiesUpdate();
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Switches.getWidgetInfo();
    }

    getIcon(key) {
        let icon = '';
        if (this.state.states[key]) {
            if (this.state.data[`iconEnabled${key}`]) {
                icon = `/files/${this.state.data[`iconEnabled${key}`]}`;
            }
        } else if (this.state.data[`icon${key}`]) {
            icon = `/files/${this.state.data[`icon${key}`]}`;
        }
        if (!icon) {
            icon = this.state.objects[key].common.icon;
        }

        if (icon) {
            icon = <img
                src={icon}
                alt=""
                style={{
                    maxWidth: 40,
                    maxHeight: 40,
                }}
            />;
        } else {
            icon = <LightbulbIcon color={this.state.states[key] ? 'primary' : undefined} />;
        }
        return icon;
    }

    getColor(key) {
        return this.state.states[key] ?
            this.state.data[`colorEnabled${key}`] || this.state.objects[key].common.color
            : this.state.data[`color${key}`] || this.state.objects[key].common.color;
    }

    changeSwitch = key => {
        const states = JSON.parse(JSON.stringify(this.state.states));
        states[key] = !states[key];
        this.setState({ states });
        this.props.socket.setState(this.state.data[`oid${key}`], states[key]);
    };

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const allSwitchValue = Object.keys(this.state.states).every(key => this.state.states[key]);

        return <div style={{ textAlign: 'center' }}>
            <Card
                style={{ width: this.state.style?.width, height: this.state.style?.height }}
            >
                <CardContent style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
                >
                    {this.state.data.type === 'switches' ?
                        <>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                alignItems: 'center',
                            }}
                            >
                                <h2>{this.state.data.name}</h2>
                                {this.state.data.allSwitch ? <Switch
                                    checked={allSwitchValue}
                                    onChange={e => {
                                        const states = JSON.parse(JSON.stringify(this.state.states));
                                        Object.keys(states).forEach(key => {
                                            states[key] = !allSwitchValue;
                                            this.props.socket.setState(this.state.data[`oid${key}`], !allSwitchValue);
                                        });
                                        this.setState({ states });
                                    }}
                                /> : null}
                            </div>
                            {Object.keys(this.state.objects).map(key => {
                                const icon = this.getIcon(key);

                                return <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                        alignItems: 'center',
                                    }}
                                    key={key}
                                >
                                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                        <span style={{
                                            width: 40,
                                            height: 40,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                        >
                                            {icon}
                                        </span>
                                        <span style={{
                                            color: this.getColor(key),
                                        }}
                                        >
                                            {this.state.objects[key].common.name}
                                        </span>
                                    </span>

                                    <Switch
                                        checked={this.state.states[key]}
                                        onChange={e => this.changeSwitch(key)}
                                    />
                                </div>;
                            })}
                        </>
                        :
                        <div style={{ width: '100%' }}>
                            <div>
                                <h2>{this.state.data.name}</h2>
                            </div>
                            {Object.keys(this.state.objects).map(key => {
                                const icon = this.getIcon(key);

                                return <div
                                    style={{
                                        display: 'inline-block',
                                        width: 80,
                                        height: 80,
                                        textAlign: 'center',
                                    }}
                                    key={key}
                                >
                                    <Button
                                        onClick={e => this.changeSwitch(key)}
                                        color={this.state.states[key] ? 'primary' : 'grey'}
                                        style={{ display: 'inline-block' }}
                                    >
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                        }}
                                        >
                                            {icon}
                                        </div>
                                        <span>
                                            {this.state.objects[key].common.name}
                                        </span>
                                    </Button>
                                </div>;
                            })}
                        </div>}
                </CardContent>
            </Card>
        </div>;
    }
}

export default Switches;
