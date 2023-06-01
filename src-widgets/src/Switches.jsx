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
    Select,
    MenuItem,
    TextField,
    InputAdornment, InputLabel, FormControl,
} from '@mui/material';

import {
    Lightbulb as LightbulbIconOn,
    LightbulbOutlined as LightbulbIconOff,
    Close as CloseIcon,
    RoomService, Check,
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
        gap: 16,
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
    controlElement: {
        maxWidth: '50%',
    },
    selectLabel: {
        top: 12,
        left: -13,
    },
});

class Switches extends Generic {
    constructor(props) {
        super(props);
        this.state.showDimmerDialog = null;
        this.state.inputValue = '';
        this.state.showSetButton = [];
        this.state.inputValues = [];
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
                                    value: 'lines',
                                    label: 'lines',
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
                            name: 'type',
                            type: 'select',
                            label: 'type',
                            options: [
                                {
                                    value: 'auto',
                                    label: 'auto',
                                },
                                {
                                    value: 'switch',
                                    label: 'switch',
                                },
                                {
                                    value: 'button',
                                    label: 'button',
                                },
                                {
                                    value: 'info',
                                    label: 'info',
                                },
                                {
                                    value: 'input',
                                    label: 'input',
                                },
                                {
                                    value: 'slider',
                                    label: 'slider',
                                },
                                {
                                    value: 'select',
                                    label: 'select',
                                },
                            ],
                            hidden: '!data["oid" + index]',
                            default: 'auto',
                        },
                        {
                            name: 'icon',
                            type: 'image',
                            label: 'icon',
                            hidden: '!!data["iconSmall" + index]',
                        },
                        {
                            name: 'iconSmall',
                            type: 'icon64',
                            label: 'small_icon',
                            hidden: '!!data["icon" + index]',
                        },
                        {
                            name: 'iconEnabled',
                            type: 'image',
                            label: 'icon_active',
                            hidden: '!data["oid" + index] || !!data["iconEnabledSmall" + index]',
                        },
                        {
                            name: 'iconEnabledSmall',
                            type: 'icon64',
                            label: 'small_icon_active',
                            hidden: '!data["oid" + index] || !!data["iconEnabled" + index]',
                        },
                        {
                            name: 'color',
                            type: 'color',
                            label: 'color',
                            hidden: '!data["oid" + index]',
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
                let widgetType = this.state.rxData[`type${index}`];

                if (widgetType === 'auto') {
                    // not writable => info
                    if (object.common.write === false) {
                        widgetType = 'info';
                    } else
                    // with states => select
                    if (object.common.states && object.common.write !== false) {
                        widgetType = 'select';
                    } else
                    // number writable max => slider
                    if (object.common.type === 'number' && object.common.max !== undefined) {
                        widgetType = 'slider';
                    } else
                    // boolean writable => switch
                    if (object.common.type === 'boolean' && object.common.write !== false) {
                        widgetType = 'switch';
                    } else
                    // boolean not readable => button
                    if (object.common.type === 'boolean' && object.common.read === false) {
                        widgetType = 'button';
                    } else {
                        widgetType = 'input';
                    }
                }

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

                object.common.unit = object.common.unit || this.state.rxData[`unit${index}`];

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

                objects[index] = {
                    common: object.common,
                    _id: object._id,
                    widgetType,
                };
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
        if (!this.state.objects[index] || this.state.objects[index].widgetType === 'button') {
            return false;
        }

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
        if (
            this.state.objects[index].widgetType === 'slider' ||
            this.state.objects[index].widgetType === 'input' ||
            this.state.objects[index].widgetType === 'select'
        ) {
            this.setState({ showDimmerDialog: index, inputValue: this.state.values[`${this.state.objects[index]._id}.val`] });
        } else if (this.state.objects[index].widgetType === 'button') {
            this.props.socket.setState(this.state.rxData[`oid${index}`], true);
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

    buttonPressed(index) {
        this.props.socket.setState(this.state.rxData[`oid${index}`], true);
    }

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
            let control;
            if (this.state.objects[index].widgetType === 'select') {
                let buttons;
                if (this.state.objects[index].common.states) {
                    buttons = Object.keys(this.state.objects[index].common.states)
                        .map((state, i) =>
                            <Button
                                variant="contained"
                                key={`${state}_${i}`}
                                className={curValue !== state ? this.props.classes.buttonInactive : ''}
                                color={curValue === state ? 'primary' : 'grey'}
                                onClick={() => this.controlSpecificState(index, state)}
                            >
                                {this.state.objects[index].common.states[state]}
                            </Button>);
                } else if (this.state.objects[index].common.type === 'number') {
                    buttons = [];
                    const min = this.state.objects[index].common.min === undefined ? 0 : this.state.objects[index].common.min;
                    const max = this.state.objects[index].common.max === undefined ? 100 : this.state.objects[index].common.max;
                    const step = this.state.objects[index].common.step === undefined ? ((max - min) / 10) : this.state.objects[index].common.step;
                    buttons = [];
                    for (let i = min; i <= max; i += step) {
                        buttons.push(<Button
                            variant="contained"
                            key={i}
                            className={curValue !== i ? this.props.classes.buttonInactive : ''}
                            color={curValue === i ? 'primary' : 'grey'}
                            onClick={() => this.controlSpecificState(index, i)}
                        >
                            {i + (this.state.objects[index].common.unit || '')}
                        </Button>);
                    }
                }
                control = <div style={{ width: '100%', textAlign: 'center' }}>
                    {buttons}
                </div>;
            } else if (this.state.objects[index].widgetType === 'slider') {
                control = <>
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
                </>;
            } else {
                control = <div style={{ display: 'flex', gap: 16 }}>
                    <TextField
                        fullWidth
                        variant="standard"
                        // label={this.state.rxData[`title${index}`] || (this.state.objects[index]?.common?.name) || ''}
                        value={this.state.inputValue === undefined || this.state.inputValue === null ? '' : this.state.inputValue}
                        InputProps={{
                            endAdornment: this.state.objects[index].common.unit ?
                                <InputAdornment position="end">{this.state.objects[index].common.unit}</InputAdornment>
                                :
                                undefined,
                        }}
                        onKeyUp={event => {
                            if (event.keyCode === 13) {
                                const values = JSON.parse(JSON.stringify(this.state.values));
                                const oid = `${this.state.objects[index]._id}.val`;
                                values[oid] = this.state.inputValue;
                                this.setState({ values, showDimmerDialog: null });
                                if (this.state.objects[index].common.type === 'number') {
                                    this.props.socket.setState(this.state.rxData[`oid${index}`], parseFloat(values[oid]));
                                } else if (this.state.objects[index].common.type === 'boolean') {
                                    this.props.socket.setState(
                                        this.state.rxData[`oid${index}`],
                                        values[oid] === 'true' ||
                                        values[oid] === true ||
                                        values[oid] === 1 ||
                                        values[oid] === '1' ||
                                        values[oid] === 'on' ||
                                        values[oid] === 'ON' ||
                                        values[oid] === 'On' ||
                                        values[oid] === 'ein' ||
                                        values[oid] === 'EIN' ||
                                        values[oid] === 'Ein' ||
                                        values[oid] === 'an' ||
                                        values[oid] === 'AN' ||
                                        values[oid] === 'An',
                                    );
                                } else {
                                    this.props.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
                                }
                            }
                        }}
                        onChange={event => this.setState({ inputValue: event.target.value })}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        title={Generic.t('Set')}
                        onClick={() => {
                            const values = JSON.parse(JSON.stringify(this.state.values));
                            const oid = `${this.state.objects[index]._id}.val`;
                            values[oid] = this.state.inputValue;
                            this.setState({ values, showDimmerDialog: null });
                            if (this.state.objects[index].common.type === 'number') {
                                this.props.socket.setState(this.state.rxData[`oid${index}`], parseFloat(values[oid]));
                            } else if (this.state.objects[index].common.type === 'boolean') {
                                this.props.socket.setState(
                                    this.state.rxData[`oid${index}`],
                                    values[oid] === 'true' ||
                                    values[oid] === true ||
                                    values[oid] === 1 ||
                                    values[oid] === '1' ||
                                    values[oid] === 'on' ||
                                    values[oid] === 'ON' ||
                                    values[oid] === 'On' ||
                                    values[oid] === 'ein' ||
                                    values[oid] === 'EIN' ||
                                    values[oid] === 'Ein' ||
                                    values[oid] === 'an' ||
                                    values[oid] === 'AN' ||
                                    values[oid] === 'An',
                                );
                            } else {
                                this.props.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
                            }
                        }}
                    >
                        <Check />
                    </Button>
                </div>;
            }

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
                    {control}
                </DialogContent>
            </Dialog>;
        }

        return null;
    }

    renderLine(index) {
        if (this.state.objects[index].widgetType === 'button') {
            return <Button onClick={() => this.buttonPressed(index)}>
                <RoomService />
            </Button>;
        }
        if (this.state.objects[index].widgetType === 'switch') {
            return <Switch
                checked={this.isOn(index)}
                onChange={() => this.changeSwitch(index)}
            />;
        }
        let value = this.state.values[`${this.state.objects[index]._id}.val`];

        if (this.state.objects[index].widgetType === 'slider') {
            const min = this.state.objects[index].common.min === undefined ? 0 : this.state.objects[index].common.min;
            const max = this.state.objects[index].common.max === undefined ? 100 : this.state.objects[index].common.max;
            return [
                <Slider
                    key="slider"
                    className={this.props.classes.controlElement}
                    size="small"
                    valueLabelDisplay="auto"
                    value={value === undefined || value === null ? min : value}
                    onChange={(event, newValue) => {
                        const values = JSON.parse(JSON.stringify(this.state.values));
                        const oid = `${this.state.objects[index]._id}.val`;
                        values[oid] = newValue;
                        this.setState({ values });
                        this.props.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
                    }}
                    min={min}
                    max={max}
                />,
                <div style={{ width: 45 }}>
                    {value + (this.state.objects[index].common.unit ? ` ${this.state.objects[index].common.unit}` : '')}
                </div>,
            ];
        }
        if (this.state.objects[index].widgetType === 'input') {
            return [
                <TextField
                    key="input"
                    fullWidth
                    onFocus={() => {
                        const showSetButton = [...this.state.showSetButton];
                        showSetButton[index] = true;
                        const inputValues = [];
                        inputValues[index] = value === null || value === undefined ? '' : value;
                        this.setState({ showSetButton, inputValues });
                    }}
                    onKeyUp={e => {
                        if (e.keyCode === 13) {
                            const values = JSON.parse(JSON.stringify(this.state.values));
                            const oid = `${this.state.objects[index]._id}.val`;
                            values[oid] = this.state.inputValues[index];
                            this.setState({ values });
                            if (this.state.objects[index].common.type === 'number') {
                                this.props.socket.setState(this.state.rxData[`oid${index}`], parseFloat(values[oid]));
                            } else if (this.state.objects[index].common.type === 'boolean') {
                                this.props.socket.setState(
                                    this.state.rxData[`oid${index}`],
                                    values[oid] === 'true' ||
                                    values[oid] === true ||
                                    values[oid] === 1 ||
                                    values[oid] === '1' ||
                                    values[oid] === 'on' ||
                                    values[oid] === 'ON' ||
                                    values[oid] === 'On' ||
                                    values[oid] === 'ein' ||
                                    values[oid] === 'EIN' ||
                                    values[oid] === 'Ein' ||
                                    values[oid] === 'an' ||
                                    values[oid] === 'AN' ||
                                    values[oid] === 'An',
                                );
                            } else {
                                this.props.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
                            }
                        }
                    }}
                    onBlur={() => {
                        setTimeout(() => {
                            const showSetButton = [...this.state.showSetButton];
                            showSetButton[index] = false;
                            this.setState({ showSetButton });
                        }, 100);
                    }}
                    variant="standard"
                    label={this.state.rxData[`title${index}`] || (this.state.objects[index]?.common?.name) || ''}
                    value={!this.state.showSetButton[index] ? (value === null || value === undefined ? '' : value) : this.state.inputValues[index]}
                    InputProps={{
                        endAdornment: this.state.objects[index].common.unit ?
                            <InputAdornment position="end">{this.state.objects[index].common.unit}</InputAdornment>
                            :
                            undefined,
                    }}
                    onChange={event => {
                        const inputValues = [];
                        inputValues[index] = event.target.value;
                        this.setState({ inputValues });
                    }}
                />,
                this.state.showSetButton[index] ? <Button
                    key="button"
                    variant="contained"
                    onClick={() => {
                        const values = JSON.parse(JSON.stringify(this.state.values));
                        const oid = `${this.state.objects[index]._id}.val`;
                        values[oid] = this.state.inputValues[index];
                        const showSetButton = [...this.state.showSetButton];
                        showSetButton[index] = false;
                        this.setState({ values, showSetButton });
                        if (this.state.objects[index].common.type === 'number') {
                            this.props.socket.setState(this.state.rxData[`oid${index}`], parseFloat(values[oid]));
                        } else if (this.state.objects[index].common.type === 'boolean') {
                            this.props.socket.setState(
                                this.state.rxData[`oid${index}`],
                                values[oid] === 'true' ||
                                values[oid] === true ||
                                values[oid] === 1 ||
                                values[oid] === '1' ||
                                values[oid] === 'on' ||
                                values[oid] === 'ON' ||
                                values[oid] === 'On' ||
                                values[oid] === 'ein' ||
                                values[oid] === 'EIN' ||
                                values[oid] === 'Ein' ||
                                values[oid] === 'an' ||
                                values[oid] === 'AN' ||
                                values[oid] === 'An',
                            );
                        } else {
                            this.props.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
                        }
                    }}
                >
                    <Check />
                </Button> : null,
            ];
        }
        if (this.state.objects[index].widgetType === 'select') {
            let states;
            if (this.state.objects[index].common.states) {
                states = Object.keys(this.state.objects[index].common.states).map(state => ({ label: state, value: this.state.objects[index].common.states[state] }));
            } else if (this.state.objects[index].common.type === 'boolean') {
                states = [
                    { label: Generic.t('ON'), value: true },
                    { label: Generic.t('OFF'), value: false },
                ];
            } else if (this.state.objects[index].common.type === 'number') {
                const min = this.state.objects[index].common.min === undefined ? 0 : this.state.objects[index].common.min;
                const max = this.state.objects[index].common.max === undefined ? 100 : this.state.objects[index].common.max;
                const step = this.state.objects[index].common.step === undefined ? ((max - min) / 10) : this.state.objects[index].common.step;
                states = [];
                for (let i = min; i <= max; i += step) {
                    states.push({ label: i + (this.state.objects[index].common.unit || ''), value: i });
                }
            } else {
                states = [];
            }

            return <FormControl fullWidth>
                <InputLabel
                    classes={{ root: states.find(item => item.value === value) ? this.props.classes.selectLabel : undefined }}
                >
                    {this.state.rxData[`title${index}`] || (this.state.objects[index]?.common?.name) || ''}
                </InputLabel>
                <Select
                    variant="standard"
                    value={value !== undefined ? value : ''}
                    onChange={event => {
                        const values = JSON.parse(JSON.stringify(this.state.values));
                        const oid = `${this.state.objects[index]._id}.val`;
                        values[oid] = event.target.value;
                        this.setState({ values });
                        this.props.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
                    }}
                >
                    {states.map(state => <MenuItem key={state.value} value={state.value}>{state.label}</MenuItem>)}
                </Select>
            </FormControl>;
        }

        if (this.state.objects[index].common.type === 'number') {
            value = this.formatValue(value);
        }

        return <div>{value + (this.state.objects[index].common.unit ? ` ${this.state.objects[index].common.unit}` : '')}</div>;
    }

    renderButton(index, icon) {
        let value = this.state.values[`${this.state.objects[index]._id}.val`];
        if (this.state.objects[index].common.type === 'number' || this.state.objects[index].common.states) {
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
                {icon ? <div className={this.props.classes.iconButton}>{icon}</div> : null}
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
        let allSwitchValue = null;
        let intermediate;

        if (this.state.rxData.type === 'lines' && Object.keys(this.state.objects).find(index => this.state.objects[index].widgetType === 'switch')) {
            allSwitchValue = Object.keys(this.state.objects)
                .filter(index => this.state.objects[index].widgetType === 'switch')
                .every(index => this.isOn(index));

            intermediate = !!Object.keys(this.state.objects)
                .filter(index => this.state.objects[index].widgetType === 'switch')
                .find(index => this.isOn(index) !== allSwitchValue);
        }

        const icons = Object.keys(this.state.objects).map(index => this.getStateIcon(index));
        const anyIcon = icons.find(icon => icon);

        const content = <>
            {this.renderDimmerDialog()}
            {this.state.rxData.type === 'lines' ?
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
                            {this.state.objects[index].widgetType !== 'input' && this.state.objects[index].widgetType !== 'select' ? <span style={{ color: this.getColor(index), paddingLeft: 16 }}>
                                {this.state.rxData[`title${index}`] || (this.state.objects[index]?.common?.name) || ''}
                            </span> : null}
                        </span>
                        {this.renderLine(index)}
                    </div>;
                })
                :
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    {Object.keys(this.state.objects).map((index, i) => {
                        // index from 1, i from 0
                        if (!this.state.objects[index]) {
                            return null;
                        }
                        return this.renderButton(index, anyIcon ? icons[i] : null);
                    })}
                </div>}
        </>;

        let addToHeader = this.state.rxData.allSwitch && Object.keys(this.state.objects).length > 1 && allSwitchValue !== null ? <Switch
            checked={allSwitchValue}
            className={intermediate ? this.props.classes.intermediate : ''}
            onChange={async () => {
                const values = JSON.parse(JSON.stringify(this.state.values));

                const keys = Object.keys(this.state.objects);

                for (let i = 0; i <= keys.length; i++) {
                    if (this.state.objects[keys[i]] && this.state.objects[keys[i]]._id && this.state.objects[keys[i]].widgetType === 'switch') {
                        const oid = `${this.state.objects[keys[i]]._id}.val`;
                        if (this.state.objects[keys[i]].common.type === 'boolean') {
                            values[oid] = !allSwitchValue;
                            await this.props.socket.setState(this.state.objects[keys[i]]._id, values[oid]);
                        } else if (this.state.objects[keys[i]].common.type === 'number') {
                            values[oid] = allSwitchValue ? this.state.objects[keys[i]].common.min : this.state.objects[keys[i]].common.max;
                            await this.props.socket.setState(this.state.objects[keys[i]]._id, values[oid]);
                        } else {
                            values[oid] = !allSwitchValue;
                            await this.props.socket.setState(this.state.objects[keys[i]]._id, values[oid] ? 'true' : 'false');
                        }
                    }
                }

                this.setState({ values });
            }}
        /> : null;

        if (!this.state.rxData.widgetTitle && addToHeader) {
            addToHeader = <div style={{ textAlign: 'right', width: '100%' }}>
                {addToHeader}
            </div>;
        }

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
