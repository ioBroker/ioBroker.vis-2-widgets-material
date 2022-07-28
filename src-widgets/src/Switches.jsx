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
            visWidgetLabel: 'vis_2_widgets_material_switches_or_buttons',  // Label of widget
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'name',
                            label: 'vis_2_widgets_material_name',
                        },
                        {
                            name: 'count',
                            type: 'number',
                            default: 2,
                            label: 'vis_2_widgets_material_count',
                            onChange: (field, data, changeData) => {
                                changeData(data);
                            },
                            // component: MyField
                        },
                        {
                            name: 'type',
                            type: 'select',
                            label: 'vis_2_widgets_material_type',
                            options: [
                                {
                                    value: 'switches',
                                    label: 'vis_2_widgets_material_switches',
                                },
                                {
                                    value: 'buttons',
                                    label: 'vis_2_widgets_material_buttons',
                                },
                            ],
                            default: 'switches',
                        },
                        {
                            name: 'allSwitch',
                            type: 'checkbox',
                            default: true,
                            label: 'vis_2_widgets_material_show_all_switch',
                        },
                        {
                            label: 'vis_2_widgets_material_buttons_width',
                            name: 'buttonsWidth',
                            hidden: 'data.type !== "buttons"',
                            type: 'slider',
                            default: 120,
                            min: 40,
                            max: 300,
                        },
                        {
                            label: 'vis_2_widgets_material_buttons_height',
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
                    label: 'vis_2_widgets_material_group_switch',
                    indexFrom: 1,
                    indexTo: 'count',
                    fields: [
                        {
                            name: 'oid',
                            type: 'id',
                            label: 'vis_2_widgets_material_oid',
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
                            hidden: '!!data["oid" + index]',
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: 240,
                height: 120,
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_switches.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Switches.getWidgetInfo();
    }

    async propertiesUpdate() {
        const objects = {};

        // try to find icons for all OIDs
        for (let index = 1; index <= this.state.data.count; index++) {
            if (this.state.data[`oid${index}`] && this.state.data[`oid${index}`] !== 'nothing_selected') {
                // read object itself
                const object = await this.props.socket.getObject(this.state.data[`oid${index}`]);
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

                if (!this.state.data[`icon${index}`] && !object.common.icon && (object.type === 'state' || object.type === 'channel')) {
                    const idArray = this.state.data[`oid${index}`].split('.');

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

    async onPropertiesUpdated() {
        super.onPropertiesUpdated();
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
            if (this.state.data[`iconEnabled${index}`]) {
                icon = `./files/${this.state.data[`iconEnabled${index}`]}`;
            }
        } else if (this.state.data[`icon${index}`]) {
            icon = `./files/${this.state.data[`icon${index}`]}`;
        }

        icon = icon || this.state.objects[index].common.icon;

        if (icon) {
            icon = <img
                src={icon}
                alt=""
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
            this.state.data[`colorEnabled${index}`] || this.state.objects[index].common.color
            : this.state.data[`color${index}`] || this.state.objects[index].common.color;
    }

    changeSwitch = index => {
        if (this.state.data.type !== 'switches' && (this.state.objects[index].common.type === 'number' || this.state.objects[index].common.states)) {
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
            this.props.socket.setState(this.state.data[`oid${index}`], values[oid]);
        }
    };

    setOnOff(index, isOn) {
        const values = JSON.parse(JSON.stringify(this.state.values));
        const oid = `${this.state.objects[index]._id}.val`;
        values[oid] = isOn ? this.state.objects[index].common.max : this.state.objects[index].common.min;
        this.setState({ values });
        this.props.socket.setState(this.state.data[`oid${index}`], values[oid]);
    }

    controlSpecificState(index, value) {
        const values = JSON.parse(JSON.stringify(this.state.values));
        const oid = `${this.state.objects[index]._id}.val`;
        values[oid] = value;
        this.setState({ values });
        this.props.socket.setState(this.state.data[`oid${index}`], values[oid]);
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
                    {this.state.data[`title${index}`] || this.state.objects[index].common.name}
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
                                    {I18n.t('vis_2_widgets_material_OFF').replace('vis_2_widgets_material_', '')}
                                </Button>
                                <Button
                                    style={{ width: '50%' }}
                                    className={curValue === this.state.objects[index].common.max ? '' : this.props.classes.buttonInactive}
                                    color="primary"
                                    onClick={() => this.setOnOff(index, true)}
                                >
                                    <LightbulbIconOn />
                                    {I18n.t('vis_2_widgets_material_ON').replace('vis_2_widgets_material_', '')}
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
                                        this.props.socket.setState(this.state.data[`oid${index}`], values[oid]);
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

        const allSwitchValue = Object.keys(this.state.objects).every(index => this.isOn(index));
        const intermediate = this.state.data.type === 'switches' && !!Object.keys(this.state.objects).find(index => this.isOn(index) !== allSwitchValue);

        const icons = Object.keys(this.state.objects).map(index => this.getStateIcon(index));
        const anyIcon = icons.find(icon => icon);

        const content = <>
            {this.renderDimmerDialog()}
            {this.state.data.type === 'switches' ?
                Object.keys(this.state.objects).map((index, i) =>
                    // index from 1, i from 0
                    <div
                        className={this.props.classes.cardsHolder}
                        key={index}
                    >
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                            {anyIcon ? <span className={this.props.classes.iconSwitch}>
                                {icons[i]}
                            </span> : null}
                            <span style={{ color: this.getColor(index), paddingLeft: 16 }}>
                                {this.state.data[`title${index}`] || this.state.objects[index].common.name}
                            </span>
                        </span>

                        <Switch
                            checked={this.isOn(index)}
                            onChange={() => this.changeSwitch(index)}
                        />
                    </div>)
                :
                <div style={{ width: '100%' }}>
                    {Object.keys(this.state.objects).map((index, i) => {
                        // index from 1, i from 0

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
                                width: this.state.data.buttonsWidth || undefined,
                                height: this.state.data.buttonsHeight || undefined,
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
                                    {this.state.data[`title${index}`] || this.state.objects[index].common.name}
                                </div>
                                {value !== undefined && value !== null ?
                                    <div className={this.props.classes.value}>{value}</div> : null}
                            </Button>
                        </div>;
                    })}
                </div>}
        </>;

        const addToHeader = this.state.data.allSwitch && Object.keys(this.state.objects).length > 1 ? <Switch
            checked={allSwitchValue}
            className={intermediate ? this.props.classes.intermediate : ''}
            onChange={() => {
                const values = JSON.parse(JSON.stringify(this.state.values));
                Object.keys(values).forEach(key => {
                    values[key] = !allSwitchValue;
                    this.props.socket.setState(this.state.data[`oid${key}`], !allSwitchValue);
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
