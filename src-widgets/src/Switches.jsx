import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Slider,
    Switch,
    IconButton,
} from '@mui/material';

import {
    Lightbulb as LightbulbIconOn,
    LightbulbOutlined as LightbulbIconOff,
    Close as CloseIcon,
} from '@mui/icons-material';

import { Icon, Utils } from '@iobroker/adapter-react-v5';

import Generic from './Generic';

const styles = () => ({
    intermediate: {
        opacity: 0.2,
    },
    text: {
        textTransform: 'none',
    },
    button: {
        display: 'block',
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    buttonInactive: {
        opacity: 0.6,
    },
    iconButton: {
        width: '100%',
        height: 40,
        display: 'block',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    iconSwitch: {
        width: 40,
        height: 40,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardsHolder: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
    },
    allButtonsTitle:{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        width: '100%',
        alignItems: 'center',
    },
    buttonDiv: {
        display: 'inline-block',
        width: 120,
        height: 80,
        textAlign: 'center',
    },
    iconCustom: {
        maxWidth: 40,
        maxHeight: 40,
    },
});

class Switches extends Generic {
    constructor(props) {
        super(props);
        this.state.showDimmerDialog = null;
        // this.state.values = {};
        this.state.objects = {};
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Switches',
            visSet: 'vis-2-widgets-material',
            visName: 'Switches',
            visWidgetLabel: 'switches_or_buttons',  // Label of widget
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'widgetTitle',
                            label: 'name',
                        },
                        {
                            name: 'count',
                            type: 'number',
                            default: 2,
                            label: 'count',
                        },
                        {
                            name: 'type',
                            type: 'select',
                            label: 'type',
                            options: [
                                {
                                    value: 'switches',
                                    label: 'switches',
                                },
                                {
                                    value: 'buttons',
                                    label: 'buttons',
                                },
                            ],
                            default: 'switches',
                        },
                        {
                            name: 'allSwitch',
                            type: 'checkbox',
                            default: true,
                            label: 'show_all_switch',
                        },
                        {
                            label: 'buttons_width',
                            name: 'buttonsWidth',
                            hidden: 'data.type !== "buttons"',
                            type: 'slider',
                            default: 120,
                            min: 40,
                            max: 300,
                        },
                        {
                            label: 'buttons_height',
                            name: 'buttonsHeight',
                            hidden: 'data.type !== "buttons"',
                            type: 'slider',
                            default: 80,
                            min: 40,
                            max: 300,
                        },
                    ],
                },
                {
                    name: 'switch',
                    label: 'group_switch',
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
                        {
                            name: 'unit',
                            type: 'text',
                            noButton: true,
                            label: 'unit',
                            hidden: 'data.type !== "buttons"',
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 120,
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_switches.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Switches.getWidgetInfo();
    }

    async propertiesUpdate() {
        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData === actualRxData) {
            return;
        }

        this.lastRxData = actualRxData;
        const objects = {};

        // try to find icons for all OIDs
        for (let index = 1; index <= this.state.rxData.count; index++) {
            if (this.state.rxData[`oid${index}`] && this.state.rxData[`oid${index}`] !== 'nothing_selected') {
                // read object itself
                const object = await this.props.socket.getObject(this.state.rxData[`oid${index}`]);
                if (!object) {
                    objects[index] = { common: {} };
                    continue;
                }
                object.common = object.common || {};
                if (object.common.type === 'number') {
                    if (object.common.max === undefined) {
                        object.common.max = 100;
                    }
                    if (object.common.min === undefined) {
                        object.common.min = 0;
                    }
                }
                if (object.common.states && Array.isArray(object.common.states)) {
                    // convert to {'state1': 'state1', 'state2': 'state2', ...}
                    const states = {};
                    object.common.states.forEach(state => states[state] = state);
                    object.common.states = states;
                }

                if (!this.state.rxData[`icon${index}`] && !this.state.rxData[`iconSmall${index}`] && !object.common.icon && (object.type === 'state' || object.type === 'channel')) {
                    const idArray = this.state.rxData[`oid${index}`].split('.');

                    // read channel
                    const parentObject = await this.props.socket.getObject(idArray.slice(0, -1).join('.'));
                    if (!parentObject?.common?.icon && (object.type === 'state' || object.type === 'channel')) {
                        const grandParentObject = await this.props.socket.getObject(idArray.slice(0, -2).join('.'));
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
                objects[index] = { common: object.common, _id: object._id };
            }
        }

        if (JSON.stringify(objects) !== JSON.stringify(this.state.objects)) {
            this.setState({ objects });
        }
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.propertiesUpdate();
    }

    async onRxDataChanged() {
        await this.propertiesUpdate();
    }

    isOn(index, values) {
        values = values || this.state.values;
        if (this.state.objects[index].common.type === 'number') {
            return values[`${this.state.objects[index]._id}.val`] !== this.state.objects[index].common.min;
        }

        return !!values[`${this.state.objects[index]._id}.val`];
    }

    getStateIcon(index) {
        let icon = '';
        if (this.isOn(index)) {
            icon = this.state.rxData[`iconEnabled${index}`] || this.state.rxData[`iconEnabledSmall${index}`];
        }

        icon = icon || this.state.rxData[`icon${index}`] || this.state.rxData[`iconSmall${index}`];
        icon = icon || this.state.objects[index].common.icon;

        if (icon) {
            icon = <Icon
                src={icon}
                style={{ width: 40, height: 40 }}
                className={this.props.classes.iconCustom}
            />;
        } else if (this.isOn(index)) {
            icon = <LightbulbIconOn color="primary" />;
        } else {
            icon = <LightbulbIconOff />;
        }

        return icon;
    }

    getColor(index) {
        return this.isOn(index) ?
            this.state.rxData[`colorEnabled${index}`] || this.state.objects[index].common.color
            : this.state.rxData[`color${index}`] || this.state.objects[index].common.color;
    }

    changeSwitch = index => {
        if (this.state.rxData.type !== 'switches' && (this.state.objects[index].common.type === 'number' || this.state.objects[index].common.states)) {
            this.setState({ showDimmerDialog: index });
        } else {
            const values = JSON.parse(JSON.stringify(this.state.values));
            const oid = `${this.state.objects[index]._id}.val`;
            if (this.state.objects[index].common.type === 'number') {
                values[oid] = values[oid] === this.state.objects[index].common.max ? this.state.objects[index].common.min : this.state.objects[index].common.max;
            } else {
                values[oid] = !values[oid];
            }
            this.setState({ values });
            this.props.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
        }
    };

    setOnOff(index, isOn) {
        const values = JSON.parse(JSON.stringify(this.state.values));
        const oid = `${this.state.objects[index]._id}.val`;
        values[oid] = isOn ? this.state.objects[index].common.max : this.state.objects[index].common.min;
        this.setState({ values });
        this.props.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
    }

    controlSpecificState(index, value) {
        const values = JSON.parse(JSON.stringify(this.state.values));
        const oid = `${this.state.objects[index]._id}.val`;
        values[oid] = value;
        this.setState({ values });
        this.props.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
    }

    renderDimmerDialog() {
        const index = this.state.showDimmerDialog;
        if (index !== null) {
            const curValue = this.state.values[`${this.state.objects[index]._id}.val`];
            return <Dialog
                fullWidth
                maxWidth="sm"
                open={!0}
                onClose={() => this.setState({ showDimmerDialog: null })}
            >
                <DialogTitle>
                    {this.state.rxData[`title${index}`] || this.state.objects[index].common.name}
                    <IconButton style={{ float: 'right' }} onClick={() => this.setState({ showDimmerDialog: null })}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent>
                    {this.state.objects[index].common.states ?
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            {Object.keys(this.state.objects[index].common.states).map((state, i) =>
                                <Button
                                    key={`${state}_${i}`}
                                    className={curValue !== state ? this.props.classes.buttonInactive : ''}
                                    color={curValue === state ? 'primary' : 'grey'}
                                    onClick={() => this.controlSpecificState(index, state)}
                                >
                                    {this.state.objects[index].common.states[state]}
                                </Button>)}
                        </div>
                        :
                        <>
                            <div style={{ width: '100%', marginBottom: 20 }}>
                                <Button
                                    style={{ width: '50%' }}
                                    color="grey"
                                    className={curValue === this.state.objects[index].common.min ? '' : this.props.classes.buttonInactive}
                                    onClick={() => this.setOnOff(index, false)}
                                >
                                    <LightbulbIconOff />
                                    {Generic.t('OFF').replace('vis_2_widgets_material_', '')}
                                </Button>
                                <Button
                                    style={{ width: '50%' }}
                                    className={curValue === this.state.objects[index].common.max ? '' : this.props.classes.buttonInactive}
                                    color="primary"
                                    onClick={() => this.setOnOff(index, true)}
                                >
                                    <LightbulbIconOn />
                                    {Generic.t('ON').replace('vis_2_widgets_material_', '')}
                                </Button>
                            </div>
                            <div style={{ width: '100%' }}>
                                <Slider
                                    size="small"
                                    value={curValue}
                                    valueLabelDisplay="auto"
                                    min={this.state.objects[index].common.min}
                                    max={this.state.objects[index].common.max}
                                    onChange={(event, value) => {
                                        const values = JSON.parse(JSON.stringify(this.state.values));
                                        const oid = `${this.state.objects[index]._id}.val`;
                                        values[oid] = value;
                                        this.setState({ values });
                                        this.props.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
                                    }}
                                />
                            </div>
                        </>}
                </DialogContent>
            </Dialog>;
        }

        return null;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData !== actualRxData) {
            this.updateTimeout = this.updateTimeout || setTimeout(async () => {
                this.updateTimeout = null;
                await this.propertiesUpdate();
            }, 50);
        }

        const allSwitchValue = Object.keys(this.state.objects).every(index => this.isOn(index));
        const intermediate = this.state.rxData.type === 'switches' && !!Object.keys(this.state.objects).find(index => this.isOn(index) !== allSwitchValue);

        const icons = Object.keys(this.state.objects).map(index => this.getStateIcon(index));
        const anyIcon = icons.find(icon => icon);

        const content = <>
            {this.renderDimmerDialog()}
            {this.state.rxData.type === 'switches' ?
                Object.keys(this.state.objects).map((index, i) => {
                    if (!this.state.objects[index]) {
                        return null;
                    }
                    // index from 1, i from 0
                    return <div
                        className={this.props.classes.cardsHolder}
                        key={index}
                    >
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                            {anyIcon ? <span className={this.props.classes.iconSwitch}>
                                {icons[i]}
                            </span> : null}
                            <span style={{ color: this.getColor(index), paddingLeft: 16 }}>
                                {this.state.rxData[`title${index}`] || (this.state.objects[index]?.common?.name) || ''}
                            </span>
                        </span>
                        <Switch
                            checked={this.isOn(index)}
                            onChange={() => this.changeSwitch(index)}
                        />
                    </div>;
                })
                :
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    {Object.keys(this.state.objects).map((index, i) => {
                        // index from 1, i from 0
                        if (!this.state.objects[index]) {
                            return null;
                        }
                        let value;
                        if (this.state.objects[index].common.type === 'number' || this.state.objects[index].common.states) {
                            value = this.state.values[`${this.state.objects[index]._id}.val`];
                            if (this.state.objects[index].common.states && this.state.objects[index].common.states[value] !== undefined) {
                                value = this.state.objects[index].common.states[value];
                            } else {
                                value = this.formatValue(value);
                            }
                        }

                        return <div
                            key={index}
                            className={this.props.classes.buttonDiv}
                            style={{
                                width: this.state.rxData.buttonsWidth || undefined,
                                height: this.state.rxData.buttonsHeight || undefined,
                            }}
                        >
                            <Button
                                onClick={() => this.changeSwitch(index)}
                                color={!this.state.objects[index].common.states && this.isOn(index) ? 'primary' : 'grey'}
                                className={Utils.clsx(this.props.classes.button, !this.isOn(index) && this.props.classes.buttonInactive)}
                            >
                                {anyIcon ? <div className={this.props.classes.iconButton}>
                                    {icons[i]}
                                </div> : null}
                                <div className={this.props.classes.text}>
                                    {this.state.rxData[`title${index}`] || this.state.objects[index].common.name || ''}
                                </div>
                                {value !== undefined && value !== null ?
                                    <div className={this.props.classes.value}>
                                        {value}
                                        {this.state.rxData[`unit${index}`] || this.state.objects[index].common.unit || ''}
                                    </div> : null}
                            </Button>
                        </div>;
                    })}
                </div>}
        </>;

        const addToHeader = this.state.rxData.allSwitch && Object.keys(this.state.objects).length > 1 ? <Switch
            checked={allSwitchValue}
            className={intermediate ? this.props.classes.intermediate : ''}
            onChange={() => {
                const values = JSON.parse(JSON.stringify(this.state.values));
                Object.keys(values).forEach(key => {
                    values[key] = !allSwitchValue;
                    this.props.socket.setState(this.state.rxData[`oid${key}`], !allSwitchValue);
                });
                this.setState({ values });
            }}
        /> : null;

        return this.wrapContent(content, addToHeader);
    }
}

Switches.propTypes = {
    systemConfig: PropTypes.object,
    socket: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default withStyles(styles)(Switches);
