import React from 'react';
import PropTypes from 'prop-types';

import { Dialog, DialogContent, DialogTitle, IconButton, Switch } from '@mui/material';

import { Close as IconClose } from '@mui/icons-material';

import { Icon } from '@iobroker/adapter-react-v5';

import Generic from './Generic';
import ObjectChart from './ObjectChart';

const styles = () => ({
    newValueLight: {
        animation: '$newValueAnimationLight 2s ease-in-out',
    },
    '@keyframes newValueAnimationLight': {
        '0%': {
            color: '#00bd00',
        },
        '80%': {
            color: '#008000',
        },
        '100%': {
            color: '#000',
        },
    },
    newValueDark: {
        animation: '$newValueAnimationDark 2s ease-in-out',
    },
    '@keyframes newValueAnimationDark': {
        '0%': {
            color: '#008000',
        },
        '80%': {
            color: '#00bd00',
        },
        '100%': {
            color: '#ffffff',
        },
    },
});

class Static extends Generic {
    constructor(props) {
        super(props);
        this.state.objects = {};
        this.state.showDialog = null;
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Static',
            visSet: 'vis-2-widgets-material',
            visName: 'Static information',
            visWidgetLabel: 'static_info', // Label of widget
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'noCard',
                            label: 'without_card',
                            type: 'checkbox',
                        },
                        {
                            name: 'widgetTitle',
                            label: 'name',
                            hidden: '!!data.noCard',
                        },
                        {
                            name: 'count',
                            type: 'number',
                            default: 2,
                            label: 'count',
                        },
                    ],
                },
                {
                    name: 'item',
                    label: 'group_item',
                    indexFrom: 1,
                    indexTo: 'count',
                    fields: [
                        {
                            name: 'oid',
                            type: 'id',
                            label: 'oid',
                        },
                        {
                            name: 'icon',
                            type: 'image',
                            label: 'icon',
                            hidden: '!!data.iconSmall',
                        },
                        {
                            name: 'iconSmall',
                            type: 'icon64',
                            label: 'small_icon',
                            hidden: '!!data.icon',
                        },
                        {
                            name: 'iconEnabled',
                            type: 'image',
                            label: 'icon_active',
                            hidden: '!!data.iconEnabledSmall',
                        },
                        {
                            name: 'iconEnabledSmall',
                            type: 'icon64',
                            label: 'small_icon_active',
                            hidden: '!!data.iconEnabled',
                        },
                        {
                            name: 'color',
                            type: 'color',
                            label: 'color',
                        },
                        {
                            name: 'colorEnabled',
                            type: 'color',
                            label: 'color_active',
                        },
                        {
                            name: 'title',
                            type: 'text',
                            label: 'title',
                            noButton: true,
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 120,
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_static.png',
        };
    }

    async propertiesUpdate() {
        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData === actualRxData) {
            return;
        }

        this.lastRxData = actualRxData;

        const objects = {};

        const defaultHistory = this.props.context.systemConfig?.common?.defaultHistory;

        // try to find icons for all OIDs
        for (let i = 1; i <= this.state.rxData.count; i++) {
            if (this.state.rxData[`oid${i}`]) {
                // read object itself
                const object = await this.props.context.socket.getObject(this.state.rxData[`oid${i}`]);
                if (!object) {
                    objects[i] = { common: {} };
                    continue;
                }
                object.common = object.common || {};
                object.isChart = !!(defaultHistory && object.common.custom && object.common.custom[defaultHistory]);
                if (
                    !this.state.rxData[`icon${i}`] &&
                    !this.state.rxData[`iconSmall${i}`] &&
                    !object.common.icon &&
                    (object.type === 'state' || object.type === 'channel')
                ) {
                    const idArray = this.state.rxData[`oid${i}`].split('.');

                    // read channel
                    const parentObject = await this.props.context.socket.getObject(idArray.slice(0, -1).join('.'));
                    if (!parentObject?.common?.icon && (object.type === 'state' || object.type === 'channel')) {
                        const grandParentObject = await this.props.context.socket.getObject(
                            idArray.slice(0, -2).join('.'),
                        );
                        if (grandParentObject?.common?.icon) {
                            object.common.icon = grandParentObject.common.icon;
                            if (grandParentObject.type === 'instance' || grandParentObject.type === 'adapter') {
                                object.common.icon = `../${grandParentObject.common.name}.admin/${object.common.icon}`;
                            }
                        }
                    } else {
                        object.common.icon = parentObject.common.icon;
                        if (parentObject.type === 'instance' || parentObject.type === 'adapter') {
                            object.common.icon = `../${parentObject.common.name}.admin/${object.common.icon}`;
                        }
                    }
                }
                objects[i] = { common: object.common, _id: object._id, isChart: object.isChart };
            }
        }

        if (JSON.stringify(objects) !== JSON.stringify(this.state.objects)) {
            this.setState({ objects });
        }
    }

    getWidgetInfo() {
        return Static.getWidgetInfo();
    }

    componentDidMount() {
        super.componentDidMount();
        this.propertiesUpdate().then(() => {});
    }

    async onRxDataChanged() {
        await this.propertiesUpdate();
    }

    getStateIcon(key) {
        let icon = '';
        const isEnabled =
            this.state.objects[key].common.type === 'boolean' &&
            this.state.values[`${this.state.rxData[`oid${key}`]}.val`];
        if (isEnabled) {
            icon = this.state.rxData[`iconEnabled${key}`] || this.state.rxData[`iconEnabledSmall${key}`];
        }
        icon = icon || this.state.rxData[`icon${key}`] || this.state.rxData[`iconSmall${key}`];

        if (!icon) {
            icon = this.state.objects[key].common.icon;
        }

        if (icon) {
            icon = (
                <Icon
                    src={icon}
                    style={{
                        width: 24,
                        height: 24,
                    }}
                />
            );
        }

        return icon;
    }

    getColor(key) {
        const isEnabled =
            this.state.objects[key].common.type === 'boolean' &&
            this.state.values[`${this.state.rxData[`oid${key}`]}.val`];
        return isEnabled
            ? this.state.rxData[`colorEnabled${key}`] ||
                  this.state.rxData[`color${key}`] ||
                  this.state.objects[key].common.color
            : this.state.rxData[`color${key}`] || this.state.objects[key].common.color;
    }

    getValue(key, styleUpdateVal) {
        const object = this.state.objects[key];
        const state = this.state.values[`${this.state.rxData[`oid${key}`]}.val`];
        if (state === undefined) {
            return '';
        }
        if (object?.common?.states) {
            if (object.common.states[state?.toString()] !== undefined) {
                return object.common.states[state.toString()];
            }

            return state.toString();
        }

        const onClick = object.isChart
            ? e => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.setState({ showDialog: key });
              }
            : undefined;

        if (object?.common?.type === 'boolean') {
            return (
                <Switch
                    checked={state}
                    onClick={onClick}
                    style={{ cursor: onClick ? 'pointer' : 'default' }}
                />
            );
        }
        let val;

        if (object?.common?.type === 'number') {
            val = `${state}${object.common.unit || ''}`;
        } else {
            val = this.formatValue(state);
        }
        return (
            <span
                key={`${val}valText`}
                onClick={onClick}
                style={{ ...styleUpdateVal, cursor: onClick ? 'pointer' : 'default' }}
            >
                {val}
            </span>
        );
    }

    renderDialog(): React.ReactNode {
        if (this.state.showDialog === null) {
            return null;
        }

        const index = this.state.showDialog;

        return (
            <Dialog
                sx={{ '& .MuiDialog-paper': { height: '100%' } }}
                maxWidth="lg"
                fullWidth
                open={!0}
                onClose={() => this.setState({ showDialog: null })}
            >
                <DialogTitle>
                    {this.state.rxData.widgetTitle}
                    <IconButton
                        style={{ float: 'right' }}
                        onClick={() => this.setState({ showDialog: null })}
                    >
                        <IconClose />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <ObjectChart
                        t={word => Generic.t(word)}
                        lang={Generic.getLanguage()}
                        socket={this.props.context.socket}
                        obj={this.state.objects[index]}
                        chartTitle={
                            this.state.rxData[`title${index}`] ||
                            Generic.getText(this.state.objects[index].common?.name)
                        }
                        title=""
                        themeType={this.props.context.themeType}
                        defaultHistory={this.props.context.systemConfig?.common?.defaultHistory || 'history.0'}
                        noToolbar={false}
                        systemConfig={this.props.context.systemConfig}
                        dateFormat={this.props.context.systemConfig.common.dateFormat}
                    />
                </DialogContent>
            </Dialog>
        );
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData !== actualRxData) {
            this.updateTimeout =
                this.updateTimeout ||
                setTimeout(async () => {
                    this.updateTimeout = null;
                    await this.propertiesUpdate();
                }, 50);
        }

        const icons = Object.keys(this.state.objects).map(key => this.getStateIcon(key));
        const anyIcon = icons.find(icon => icon);
        const styleUpdateVal = this.props.context.themeType === 'dark' ? styles.newValueDark : styles.newValueLight;

        const content = (
            <>
                {this.renderDialog()}
                {Object.keys(this.state.objects).map((key, i) => (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            alignItems: 'center',
                        }}
                        key={key}
                    >
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                            {anyIcon ? (
                                <span
                                    style={{
                                        width: 24,
                                        height: 24,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {icons[i]}
                                </span>
                            ) : null}
                            <span style={{ color: this.getColor(key), paddingLeft: 16 }}>
                                {this.state.rxData[`title${key}`] ||
                                    Generic.getText(this.state.objects[key].common.name)}
                            </span>
                        </span>

                        {this.getValue(key, styleUpdateVal)}
                    </div>
                ))}
            </>
        );

        return this.wrapContent(content);
    }
}

Static.propTypes = {
    context: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default Static;
