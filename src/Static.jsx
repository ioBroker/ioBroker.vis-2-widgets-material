import React from 'react';

import {
    Card, CardContent, Switch,
} from '@mui/material';

import LightbulbIcon from '@mui/icons-material/Lightbulb';

import VisRxWidget from './visRxWidget';

class Static extends (window.visRxWidget || VisRxWidget) {
    constructor(props) {
        super(props);
        this.state.objects = {};
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterialStatic',
            visSet: 'material-widgets',
            visName: 'Static',
            visAttrs: [
                {
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
                },
                {
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
            visPrev: 'widgets/vis-widget-thermostat/img/prev_static.png',
        };
    }

    async propertiesUpdate() {
        const objects = {};

        // try to find icons for all OIDs
        for (let i = 1; i <= this.state.data.count; i++) {
            if (this.state.data[`oid${i}`]) {
                // read object itself
                const object = await this.props.socket.getObject(this.state.data[`oid${i}`]);
                if (!object) {
                    continue;
                }
                object.common = object.common || {};
                if (!object.common?.icon && (object.type === 'state' || object.type === 'channel')) {
                    const idArray = this.state.data[`oid${i}`].split('.');

                    // read channel
                    const parentObject = await this.props.socket.getObject(idArray.slice(0, -1).join('.'));
                    if (!parentObject?.common?.icon && (object.type === 'state' || object.type === 'channel')) {
                        const grandParentObject = await this.props.socket.getObject(idArray.slice(0, -2).join('.'));
                        if (grandParentObject?.common?.icon) {
                            object.common.icon = grandParentObject.common.icon;
                        }
                    } else {
                        object.common.icon = parentObject.common.icon;
                    }
                }
                objects[i] = object;
            }
        }

        this.setState({ objects });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Static.getWidgetInfo();
    }

    componentDidMount() {
        super.componentDidMount();
        this.propertiesUpdate()
            .then(() => {});
    }

    onPropertiesUpdated() {
        super.onPropertiesUpdated();
        this.propertiesUpdate()
            .then(() => {});
    }

    getStateIcon(key) {
        let icon = '';
        const isEnabled = this.state.objects[key].common.type === 'boolean' && this.state.values[`${this.state.data[`oid${key}`]}.val`];
        if (isEnabled) {
            if (this.state.data[`iconEnabled${key}`]) {
                icon = `files/${this.state.data[`iconEnabled${key}`]}`;
            }
        } else if (this.state.data[`icon${key}`]) {
            icon = `files/${this.state.data[`icon${key}`]}`;
        }

        if (!icon) {
            icon = this.state.objects[key].common.icon;
        }

        if (icon) {
            icon = <img
                src={icon}
                alt={isEnabled ? 'activ' : 'inactiv'}
                style={{
                    maxWidth: 40,
                    maxHeight: 40,
                }}
            />;
        } else {
            // icon = <LightbulbIcon color={isEnabled ? 'primary' : undefined} />;
        }

        return icon;
    }

    getColor(key) {
        const isEnabled = this.state.objects[key].common.type === 'boolean' && this.state.values[`${this.state.data[`oid${key}`]}.val`];
        return isEnabled ?
            this.state.data[`colorEnabled${key}`] || this.state.objects[key].common.color
            :
            this.state.data[`color${key}`] || this.state.objects[key].common.color;
    }

    getValue(key) {
        const object = this.state.objects[key];
        const state = this.state.values[`${this.state.data[`oid${key}`]}.val`];
        if (object?.common?.states) {
            if (object.common.states[state?.toString()] !== undefined) {
                return object.common.states[state.toString()];
            }

            return state.toString();
        }
        if (object?.common?.type === 'boolean') {
            return <Switch checked={state} />;
        }
        if (object?.common?.type === 'number') {
            return `${state}${object.common.unit || ''}`;
        }
        return state?.toString();
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const icons = Object.keys(this.state.objects).map(key => this.getStateIcon(key));
        const anyIcon = icons.find(icon => icon);

        return <Card style={{ width: '100%', height: '100%', margin: 4 }}>
            <CardContent
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {this.state.data.name ? <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    alignItems: 'center',
                }}
                >
                    <div style={{ fontSize: 24, paddingTop: 0, paddingBottom: 4 }}>{this.state.data.name}</div>
                </div> : null}
                {Object.keys(this.state.objects).map((key, i) => {
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
                            {anyIcon ? <span style={{
                                width: 40,
                                height: 40,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            >
                                {icons[i]}
                            </span> : null}
                            <span style={{ color: this.getColor(key), paddingLeft: 16 }}>
                                {this.state.objects[key].common.name}
                            </span>
                        </span>

                        {this.getValue(key)}
                    </div>;
                })}
            </CardContent>
        </Card>;
    }
}

export default Static;
