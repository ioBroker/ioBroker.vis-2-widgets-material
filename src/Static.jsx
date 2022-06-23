import React from 'react';

import {
    Card, CardContent, Switch,
} from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import VisRxWidget from './visRxWidget';

class Static extends (window.visRxWidget || VisRxWidget) {
    constructor(props) {
        super(props);
        this.state.states = {};
        this.state.objects = {};
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterialStatic',
            visSet: 'material-widgets',
            visName: 'Static',
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
                const object = await this.props.socket.getObject(this.state.data[`oid${i}`]);
                if (!object) {
                    continue;
                }
                states[i] = (await this.props.socket.getState(this.state.data[`oid${i}`]))?.val;
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
        return Static.getWidgetInfo();
    }

    getIcon(key) {
        let icon = '';
        const isEnabled = this.state.objects[key].common.type === 'boolean' && this.state.states[key];
        if (isEnabled) {
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
            icon = <LightbulbIcon color={isEnabled ? 'primary' : undefined} />;
        }
        return icon;
    }

    getColor(key) {
        const isEnabled = this.state.objects[key].common.type === 'boolean' && this.state.states[key];
        return isEnabled ?
            this.state.data[`colorEnabled${key}`] || this.state.objects[key].common.color
            : this.state.data[`color${key}`] || this.state.objects[key].common.color;
    }

    getValue(key) {
        const object = this.state.objects[key];
        const state = this.state.states[key];
        if (object.common.states) {
            return object.common.states[state?.toString()];
        }
        if (object.common.type === 'boolean') {
            return <Switch checked={state} />;
        }
        if (object.common.type === 'number') {
            return `${state}${object.common.unit || ''}`;
        }
        return state?.toString();
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

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

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        alignItems: 'center',
                    }}
                    >
                        <h2>{this.state.data.name}</h2>
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

                            {this.getValue(key)}
                        </div>;
                    })}
                </CardContent>
            </Card>
        </div>;
    }
}

export default Static;
