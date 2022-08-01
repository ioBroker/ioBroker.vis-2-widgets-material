import React from 'react';
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

import { i18n as I18n, Utils } from '@iobroker/adapter-react-v5';

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

class SimpleState extends Generic {
    constructor(props) {
        super(props);
        this.state.showDimmerDialog = null;
        // this.state.values = {};
        this.state.object = { common: {} };
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2SimpleState',
            visSet: 'vis-2-widgets-material',
            visName: 'SimpleState',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'name',
                            label: 'vis_2_widgets_material_name',
                        },
                        {
                            name: 'values_count',
                            type: 'number',
                            default: 2,
                            label: 'vis_2_widgets_material_values_count',
                        },
                        {
                            name: 'oid',
                            type: 'id',
                            label: 'vis_2_widgets_material_oid',
                            onChange: async (field, data, changeData, socket) => {
                                const object = await socket.getObject(data.oid);
                                if (object && object.common.states) {
                                    if (Array.isArray(object.common.states)) {
                                        // convert to {'state1': 'state1', 'state2': 'state2', ...}
                                        const states = {};
                                        object.common.states.forEach(state => states[state] = state);
                                        object.common.states = states;
                                    }
                                    data.values_count = Object.keys(object.common.states).length;
                                    Object.keys(object.common.states).forEach((state, index) => {
                                        data[`value${index + 1}`] = object.common.states[state];
                                    });
                                    changeData(data);
                                }
                            },
                        },
                    ],
                },
                {
                    name: 'values',
                    indexFrom: 1,
                    indexTo: 'values_count',
                    fields: [
                        {
                            name: 'value',
                            type: 'text',
                            label: 'vis_2_widgets_material_value',
                        },
                        {
                            name: 'icon',
                            type: 'image',
                            label: 'vis_2_widgets_material_icon',
                        },
                        {
                            name: 'iconEnabled',
                            type: 'image',
                            label: 'vis_2_widgets_material_icon_active',
                        },
                        {
                            name: 'color',
                            type: 'color',
                            label: 'vis_2_widgets_material_color',
                        },
                        {
                            name: 'colorEnabled',
                            type: 'color',
                            label: 'vis_2_widgets_material_color_active',
                        },
                        {
                            name: 'title',
                            type: 'text',
                            label: 'vis_2_widgets_material_title',
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 120,
                position: 'relative',
            },
            visPrev: 'widgets/material-widgets/img/prev_switch.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return SimpleState.getWidgetInfo();
    }

    async propertiesUpdate() {
        if (this.state.rxData.oid && this.state.rxData.oid !== 'nothing_selected') {
            // read object itself
            let object = await this.props.socket.getObject(this.state.rxData.oid);
            if (!object) {
                object = { common: {} };
            } else {
                object = { common: object.common, _id: object._id };
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

            if (!object.common.icon && (object.type === 'state' || object.type === 'channel')) {
                const idArray = this.state.rxData.oid.split('.');

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

            if (JSON.stringify(this.state.object) !== JSON.stringify(object)) {
                this.setState({ object });
            }
        }
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.propertiesUpdate();
    }

    async onPropertiesUpdated() {
        super.onPropertiesUpdated();
        await this.propertiesUpdate();
    }

    getValueData() {
        const valueId = this.state.values[`${this.state.rxData.oid}.val`];
        const value = this.state.object.common?.states[valueId];
        for (let i = 1; i <= this.state.rxData.values_count; i++) {
            if (this.state.rxData[`value${i}`] === value) {
                return {
                    color: this.state.rxData[`color${i}`],
                    icon: this.state.rxData[`icon${i}`],
                };
            }
        }
    }

    isOn(values) {
        values = values || this.state.values;
        if (this.state.object.common.type === 'number') {
            return values[`${this.state.object._id}.val`] !== this.state.object.common.min;
        }
        return !!values[`${this.state.object._id}.val`];
    }

    getStateIcon(index) {
        let icon = '';
        if (this.isOn()) {
            if (this.state.rxData[`iconEnabled${index}`]) {
                icon = `./files/${this.state.rxData[`iconEnabled${index}`]}`;
            }
        } else if (this.state.rxData[`icon${index}`]) {
            icon = `./files/${this.state.rxData[`icon${index}`]}`;
        }

        icon = icon || this.state.object.common.icon;

        if (icon) {
            icon = <img
                src={icon}
                alt=""
                className={this.props.classes.iconCustom}
            />;
        } else if (this.isOn()) {
            icon = <LightbulbIconOn color="primary" />;
        } else {
            icon = <LightbulbIconOff />;
        }

        return icon;
    }

    getColor(index) {
        return this.isOn() ?
            this.state.rxData[`colorEnabled${index}`] || this.state.object.common.color
            : this.state.rxData[`color${index}`] || this.state.object.common.color;
    }

    changeSwitch = () => {
        if (this.state.object.common.type === 'number' || this.state.object.common.states) {
            this.setState({ showDimmerDialog: true });
        } else {
            const values = JSON.parse(JSON.stringify(this.state.values));
            const oid = `${this.state.object._id}.val`;
            if (this.state.object.common.type === 'number') {
                values[oid] = values[oid] === this.state.object.common.max ? this.state.object.common.min : this.state.object.common.max;
            } else {
                values[oid] = !values[oid];
            }
            this.setState({ values });
            this.props.socket.setState(this.state.rxData.oid, values[oid]);
        }
    };

    setOnOff(isOn) {
        const values = JSON.parse(JSON.stringify(this.state.values));
        const oid = `${this.state.object._id}.val`;
        values[oid] = isOn ? this.state.object.common.max : this.state.object.common.min;
        this.setState({ values });
        this.props.socket.setState(this.state.rxData.oid, values[oid]);
    }

    controlSpecificState(value) {
        const values = JSON.parse(JSON.stringify(this.state.values));
        const oid = `${this.state.object._id}.val`;
        values[oid] = value;
        this.setState({ values });
        this.props.socket.setState(this.state.rxData.oid, values[oid]);
    }

    renderDimmerDialog() {
        if (this.state.showDimmerDialog) {
            return <Dialog
                fullWidth
                maxWidth="sm"
                open={!0}
                onClose={() => this.setState({ showDimmerDialog: null })}
            >
                <DialogTitle>
                    {this.state.rxData.title || this.state.object.common.name}
                    <IconButton style={{ float: 'right' }} onClick={() => this.setState({ showDimmerDialog: null })}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent>
                    {this.state.object.common.states ?
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            {Object.keys(this.state.object.common.states).map((state, i) =>
                                <Button
                                    key={`${state}_${i}`}
                                    className={this.state.values[`${this.state.object._id}.val`] !== state ? this.props.classes.buttonInactive : ''}
                                    color={this.state.values[`${this.state.object._id}.val`] === state ? 'primary' : 'grey'}
                                    onClick={() => this.controlSpecificState(state)}
                                >
                                    {this.state.object.common.states[state]}
                                </Button>)}
                        </div>
                        :
                        <>
                            <div style={{ width: '100%', marginBottom: 20 }}>
                                <Button
                                    style={{ width: '50%' }}
                                    color="grey"
                                    className={this.state.values[`${this.state.object._id}.val`] === this.state.object.common.min ? '' : this.props.classes.buttonInactive}
                                    onClick={() => this.setOnOff(false)}
                                >
                                    <LightbulbIconOff />
                                    {I18n.t('vis_2_widgets_material_OFF').replace('vis_2_widgets_material_', '')}
                                </Button>
                                <Button
                                    style={{ width: '50%' }}
                                    className={this.state.values[`${this.state.object._id}.val`] === this.state.object.common.max ? '' : this.props.classes.buttonInactive}
                                    color="primary"
                                    onClick={() => this.setOnOff(true)}
                                >
                                    <LightbulbIconOn />
                                    {I18n.t('vis_2_widgets_material_ON').replace('vis_2_widgets_material_', '')}
                                </Button>
                            </div>
                            <div style={{ width: '100%' }}>
                                <Slider
                                    size="small"
                                    value={this.state.values[`${this.state.object._id}.val`]}
                                    valueLabelDisplay="auto"
                                    min={this.state.object.common.min}
                                    max={this.state.object.common.max}
                                    onChange={(event, value) => {
                                        const values = JSON.parse(JSON.stringify(this.state.values));
                                        const oid = `${this.state.object._id}.val`;
                                        values[oid] = value;
                                        this.setState({ values });
                                        this.props.socket.setState(this.state.rxData.oid, values[oid]);
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

        const icon = this.getStateIcon();

        let content = null;

        if (this.state.object._id) {
            let value;
            if (this.state.object.common.type === 'number' || this.state.object.common.states) {
                value = this.state.values[`${this.state.object._id}.val`];
                if (this.state.object.common.states && this.state.object.common.states[value] !== undefined) {
                    value = this.state.object.common.states[value];
                } else {
                    value = this.formatValue(value);
                }
            }

            content = <>
                {this.renderDimmerDialog()}
                <div style={{ width: '100%' }}>
                    <div
                        className={this.props.classes.buttonDiv}
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        <Button
                            onClick={() => this.changeSwitch()}
                            color={!this.state.object.common.states && this.isOn() ? 'primary' : 'grey'}
                            className={Utils.clsx(this.props.classes.button, !this.isOn() && this.props.classes.buttonInactive)}
                        >
                            {icon ? <div className={this.props.classes.iconButton}>
                                {icon}
                            </div> : null}
                            <div className={this.props.classes.text}>
                                {this.state.rxData.title || this.state.object.common.name}
                            </div>
                            {value !== undefined && value !== null ?
                                <div className={this.props.classes.value}>{value}</div> : null}
                        </Button>
                    </div>
                </div>
            </>;
        }

        return this.wrapContent(content);
    }
}

export default withStyles(styles)(SimpleState);