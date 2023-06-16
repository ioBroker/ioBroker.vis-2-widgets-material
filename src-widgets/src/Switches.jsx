import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import ReactEchartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
    TimelineComponent,
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';

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
    CircularProgress,
    InputAdornment,
    InputLabel,
    FormControl,
} from '@mui/material';

import {
    Lightbulb as LightbulbIconOn,
    LightbulbOutlined as LightbulbIconOff,
    Close as CloseIcon,
    RoomService, Check,
} from '@mui/icons-material';

import { Icon, Utils } from '@iobroker/adapter-react-v5';

import Generic from './Generic';
// import ObjectChart from './ObjectChart';

const HISTORY = ['influxdb', 'sql', 'history'];

echarts.use([TimelineComponent, LineChart, SVGRenderer]);

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
        position: 'relative',
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
        this.state.showControlDialog = null;
        this.state.inputValue = '';
        this.state.showSetButton = [];
        this.state.inputValues = [];
        // this.state.values = {};
        this.state.objects = {};
        this.state.historyData = {};
        this.state.chartWidth = {};
        this.state.chartHeight = {};
        this.history = {};
        this.refs = {};
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
                            hidden: 'data["type" + index] === "button" || data["type" + index] === "switch"',
                        },
                        {
                            name: 'step',
                            label: 'values_step',
                            hidden: '!data["oid" + index] || data["type" + index] !== "select"',
                        },
                        {
                            name: 'hideChart',
                            type: 'checkbox',
                            label: 'hide_chart',
                            hidden: '!data["oid" + index] || data["type" + index] !== "info"',
                        },
                        {
                            name: 'chartPeriod',
                            type: 'select',
                            options: [
                                { value: 10, label: '10_minutes' },
                                { value: 30, label: '30_minutes' },
                                { value: 60, label: '1_hour' },
                                { value: 120, label: '2_hours' },
                                { value: 180, label: '3_hours' },
                                { value: 360, label: '6_hours' },
                                { value: 720, label: '12_hours' },
                                { value: 1440, label: '1_day' },
                                { value: 2880, label: '2_days' },
                                { value: 10080, label: '1_week' },
                            ],
                            default: 60,
                            label: 'chart_period',
                            hidden: '!data["oid" + index] || data["type" + index] !== "info" || !!data["hideChart" + index]',
                        },
                        {
                            name: 'buttonText',
                            type: 'text',
                            noButton: true,
                            label: 'button_text',
                            hidden: 'data.type !== "lines" || !data["oid" + index] || data["type" + index] !== "button" || !!data["buttonIcon" + index] || !!data["buttonImage" + index]',
                        },
                        {
                            name: 'buttonIcon',
                            type: 'icon64',
                            label: 'button_icon',
                            hidden: 'data.type !== "lines" || !data["oid" + index] || data["type" + index] !== "button" || !!data["buttonText" + index] || !!data["buttonImage" + index]',
                        },
                        {
                            name: 'buttonImage',
                            type: 'image',
                            label: 'button_image',
                            hidden: 'data.type !== "lines" || !data["oid" + index] || data["type" + index] !== "button" || !!data["buttonText" + index] || !!data["buttonIcon" + index]',
                        },
                        {
                            name: 'infoInactiveText',
                            type: 'text',
                            noButton: true,
                            label: 'info_inactive_text',
                            hidden: '!data["oid" + index] || data["type" + index] !== "info" || !!data["infoInactiveIcon" + index] || !!data["infoInactiveImage" + index]',
                        },
                        {
                            name: 'infoActiveText',
                            type: 'text',
                            noButton: true,
                            label: 'info_active_text',
                            hidden: '!data["oid" + index] || data["type" + index] !== "info" || !!data["infoActiveIcon" + index] || !!data["infoActiveImage" + index]',
                        },
                        {
                            name: 'infoInactiveIcon',
                            type: 'icon64',
                            label: 'info_inactive_icon',
                            hidden: '!data["oid" + index] || data["type" + index] !== "info" || !!data["infoInactiveText" + index] || !!data["infoInactiveImage" + index]',
                        },
                        {
                            name: 'infoActiveIcon',
                            type: 'icon64',
                            label: 'info_active_icon',
                            hidden: '!data["oid" + index] || data["type" + index] !== "info" || !!data["infoActiveText" + index] || !!data["infoActiveImage" + index]',
                        },
                        {
                            name: 'infoInactiveImage',
                            type: 'image',
                            label: 'info_inactive_image',
                            hidden: '!data["oid" + index] || data["type" + index] !== "info" || !!data["infoInactiveIcon" + index] || !!data["infoInactiveText" + index]',
                        },
                        {
                            name: 'infoActiveImage',
                            type: 'image',
                            label: 'info_active_image',
                            hidden: '!data["oid" + index] || data["type" + index] !== "info" || !!data["infoActiveIcon" + index] || !!data["infoActiveText" + index]',
                        },
                        {
                            name: 'infoInactiveColor',
                            type: 'color',
                            label: 'info_inactive_color',
                            hidden: '!data["oid" + index] || data["type" + index] !== "info"',
                        },
                        {
                            name: 'infoActiveColor',
                            type: 'color',
                            label: 'info_active_color',
                            hidden: '!data["oid" + index] || data["type" + index] !== "info"',
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

        this.systemConfig = this.systemConfig || (await this.props.socket.getObject('system.config'));

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
                            object.common.icon = Generic.getObjectIcon(grandParentObject, grandParentObject._id);
                        }
                    } else {
                        object.common.icon = Generic.getObjectIcon(parentObject, parentObject._id);
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

    async componentWillUnmount() {
        this.updateDialogChartInterval && clearInterval(this.updateDialogChartInterval);
        this.updateDialogChartInterval = null;

        this.updateChartInterval && clearInterval(this.updateChartInterval);
        this.updateChartInterval = null;
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
            this.state.objects[index].widgetType === 'select' ||
            this.state.objects[index].widgetType === 'info'
        ) {
            if (this.state.objects[index].widgetType === 'info') {
                this.updateDialogChartInterval = this.updateDialogChartInterval || setInterval(() =>
                    this.updateCharts(), 60000);

                this.updateCharts(index)
                    .catch(e => window.alert(`Cannot read history: ${e}`));
            }

            this.setState({ showControlDialog: index, inputValue: this.state.values[`${this.state.objects[index]._id}.val`] });
        } else if (this.state.objects[index].widgetType === 'button') {
            if (this.state.objects[index].common.max !== undefined) {
                this.props.socket.setState(this.state.rxData[`oid${index}`], this.state.objects[index].common.max);
            } else {
                this.props.socket.setState(this.state.rxData[`oid${index}`], true);
            }
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
        this.setState({ values, showControlDialog: null });
        this.props.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
    }

    renderControlDialog() {
        const index = this.state.showControlDialog;
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
                    const step = parseInt(this.state.rxData[`step${index}`], 10) ||
                        (this.state.objects[index].common.step === undefined ? ((max - min) / 10) : this.state.objects[index].common.step);
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
                control = <div
                    style={{
                        width: '100%',
                        textAlign: 'center',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 4,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {buttons}
                </div>;
            } else if (this.state.objects[index].widgetType === 'slider') {
                control = <>
                    <div style={{ width: '100%', marginBottom: 20 }}>
                        <Button
                            style={{ width: '50%' }}
                            color="grey"
                            className={curValue === this.state.objects[index].common.min ? '' : this.props.classes.buttonInactive}
                            onClick={() => {
                                this.setOnOff(index, false);
                                this.setState({ showControlDialog: null });
                            }}
                        >
                            <LightbulbIconOff />
                            {Generic.t('OFF').replace('vis_2_widgets_material_', '')}
                        </Button>
                        <Button
                            style={{ width: '50%' }}
                            className={curValue === this.state.objects[index].common.max ? '' : this.props.classes.buttonInactive}
                            color="primary"
                            onClick={() => {
                                this.setOnOff(index, true);
                                this.setState({ showControlDialog: null });
                            }}
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
            } else if (this.state.objects[index].widgetType === 'info') {
                if (this.refs[index]) {
                    // update width and height of chart container
                    setTimeout(() => this.checkChartWidth(), 50);

                    // draw chart
                    control = <div
                        style={{
                            width: '100%',
                            minWidth: 500,
                            height: '100%',
                            minHeight: 300,
                        }}
                        ref={this.refs[index]}
                    >
                        {this.drawChart(index, {
                            width: this.state.chartWidth[index],
                            height: this.state.chartHeight[index],
                            position: 'relative',
                            top: undefined,
                            right: undefined,
                            maxWidth: undefined,
                            userSelect: undefined,
                            pointerEvents: undefined,
                        })}
                        {/*
                         <ObjectChart
                            t={key => Generic.t(key)}
                            lang={Generic.getLanguage()}
                            socket={this.props.socket}
                            obj={this.state.objects[index]}
                            unit={this.state.objects[index].common.unit}
                            title={this.state.rxData[`title${index}`] || Generic.getText(this.state.objects[index].common.name)}
                            objLineType="line"
                            objColor={this.props.theme.palette.primary.main}
                            objBackgroundColor={this.props.theme.palette.primary.main}
                            themeType={this.props.themeType}
                            defaultHistory={this.history[index]}
                            noToolbar
                            systemConfig={this.systemConfig}
                            dateFormat={this.systemConfig.common.dateFormat}
                            chartTitle=""
                        />
                        */}
                    </div>;
                } else {
                    control = <CircularProgress />;
                }
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
                                this.setState({ values, showControlDialog: null });
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
                            this.setState({ values, showControlDialog: null });
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
                onClose={() => {
                    this.updateDialogChartInterval && clearInterval(this.updateDialogChartInterval);
                    this.updateDialogChartInterval = null;

                    this.setState({ showControlDialog: null });
                }}
            >
                <DialogTitle>
                    {this.state.rxData[`title${index}`] || this.state.objects[index].common.name}
                    <IconButton style={{ float: 'right' }} onClick={() => this.setState({ showControlDialog: null })}><CloseIcon /></IconButton>
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
            const icon = this.state.rxData[`buttonIcon${index}`] || this.state.rxData[`buttonImage${index}`];
            const text = this.state.rxData[`buttonText${index}`];

            return <Button onClick={() => this.buttonPressed(index)}>
                {text || (icon ? <Icon src={icon} style={{ width: 24, height: 24 }} /> : <RoomService />)}
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
                <div key="value" style={{ width: 45 }}>
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
                const step = parseInt(this.state.rxData[`step${index}`], 10) ||
                    (this.state.objects[index].common.step === undefined ? ((max - min) / 10) : this.state.objects[index].common.step);
                states = [];
                for (let i = min; i <= max; i += step) {
                    states.push({ label: i + (this.state.objects[index].common.unit || ''), value: i });
                    if (value > i && value < i + step) {
                        states.push({ label: value + (this.state.objects[index].common.unit || ''), value });
                    }
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

        // info
        this.checkHistory(index)
            .catch(e => window.alert(`Cannot check history: ${e}`));

        if (value === null || value === undefined) {
            value = '--';
        }

        let icon;
        let text;
        let color;
        let val = false;
        if (this.state.objects[index].common.type === 'boolean' || value === true || value === 'true' || value === false || value === 'false') {
            if (value === true || value === 'true' || value === 1 || value === '1' || value === 'on' || value === 'ON' || value === 'On' || value === 'ein' || value === 'EIN' || value === 'Ein' || value === 'an' || value === 'AN' || value === 'An') {
                val = true;
            }
            if (val) {
                const diffColors = this.state.rxData[`infoActiveColor${index}`] && this.state.rxData[`infoInactiveColor${index}`] && this.state.rxData[`infoActiveColor${index}`] !== this.state.rxData[`infoInactiveColor${index}`];
                icon = this.state.rxData[`infoActiveIcon${index}`] || this.state.rxData[`infoActiveImage${index}`];
                if (!icon && diffColors) {
                    icon = this.state.rxData[`infoInactiveIcon${index}`] || this.state.rxData[`infoInactiveImage${index}`];
                }

                text = this.state.rxData[`infoActiveText${index}`];
                if (!text && diffColors) {
                    text = this.state.rxData[`infoInactiveText${index}`];
                }
                color = this.state.rxData[`infoActiveColor${index}`] || this.state.rxData[`infoInactiveColor${index}`];
            } else {
                icon = this.state.rxData[`infoInactiveIcon${index}`] || this.state.rxData[`infoInactiveImage${index}`];
                text = this.state.rxData[`infoInactiveText${index}`];
                color = this.state.rxData[`infoInactiveColor${index}`];
            }
        }

        let staticElem;
        if (text) {
            staticElem = <span style={{ color }}>{text}</span>;
        } else if (icon) {
            staticElem = <Icon src={icon} style={{ width: 24, height: 24, color }} />;
        } else {
            staticElem = value + (this.state.objects[index].common.unit ? ` ${this.state.objects[index].common.unit}` : '');
        }

        // todo: history for booleans
        if (this.refs[index] && this.state.objects[index].common.type === 'number') {
            setTimeout(() => this.checkChartWidth(), 50);
            return <div
                style={{
                    flexGrow: 1,
                    textAlign: 'right',
                    cursor: 'pointer',
                }}
                ref={this.refs[index]}
                onClick={() => this.setState({ showControlDialog: index })}
            >
                {this.drawChart(index)}
                {staticElem}
            </div>;
        }

        return <div>
            {staticElem}
        </div>;
    }

    checkChartWidth() {
        Object.keys(this.refs).forEach(i => {
            if (this.refs[i] && this.refs[i].current) {
                const width = this.refs[i].current.offsetWidth;
                const height = this.refs[i].current.offsetHeight;
                if (width !== this.state.chartWidth[i] || height !== this.state.chartHeight[i]) {
                    const chartWidth = { ...this.state.chartWidth };
                    const chartHeight = { ...this.state.chartHeight };
                    chartWidth[i] = width;
                    chartHeight[i] = height;
                    this.setState({ chartWidth, chartHeight });
                }
            }
        });
    }

    drawChart(index, style) {
        if (this.state.historyData[index] && this.state.chartWidth[index]) {
            const _style = {
                height: 37,
                width: this.state.chartWidth[index],
                position: 'absolute',
                right: 0,
                top: 0,
                maxWidth: 200,
                userSelect: 'none',
                pointerEvents: 'none',
                ...style,
            };

            return <ReactEchartsCore
                className={this.props.classes.chart}
                echarts={echarts}
                option={this.state.historyData[index]}
                notMerge
                lazyUpdate
                theme={this.props.themeType === 'dark' ? 'dark' : ''}
                style={_style}
                opts={{ renderer: 'svg' }}
            />;
        }

        return null;
    }

    async checkHistory(index, doNotRequestData) {
        const custom = this.state.objects[index].common.custom;

        if (!custom || this.state.rxData[`hideChart${index}`]) {
            this.state.objects[index].common.history = false;

            if (this.refs[index]) {
                delete this.refs[index];
            }
            if (this.history[index]) {
                delete this.history[index];
            }
            if (!Object.keys(this.history).length) {
                this.updateChartInterval && clearInterval(this.updateChartInterval);
                this.updateChartInterval = null;
                this.updateDialogChartInterval && clearInterval(this.updateDialogChartInterval);
                this.updateDialogChartInterval = null;
            }
            if (this.state.historyData[index]) {
                setTimeout(() => {
                    const historyData = { ...this.state.historyData };
                    delete historyData[index];
                    this.setState({ historyData });
                }, 100);
            }
            return;
        }

        // we check it already
        if (this.state.objects[index].common.history) {
            return;
        }

        // remember that it is checked
        this.state.objects[index].common.history = true;

        let historyInstance;
        // first check default history and if it is alive
        if (custom[this.systemConfig.common.defaultHistory]) {
            const alive = await this.props.socket.getState(`system.adapter.${this.systemConfig.common.defaultHistory}.alive`);
            if (alive?.val) {
                historyInstance = this.systemConfig.common.defaultHistory;
            }
        }

        if (!historyInstance) {
            // find the first live history instance
            historyInstance = Object.keys(custom).find(async instance => {
                if (instance === this.systemConfig.common.defaultHistory) {
                    return false;
                }
                const adapter = instance.split('.')[0];
                if (HISTORY.includes(adapter)) {
                    const alive = await this.props.socket.getState(`system.adapter.${instance}.alive`);
                    if (alive?.val) {
                        return true;
                    }
                }
                return false;
            });
        }

        if (historyInstance) {
            this.refs[index] = this.refs[index] || React.createRef();
            // try to read history for last hour
            this.history[index] = historyInstance;
            if (!doNotRequestData) {
                this.updateChartInterval = this.updateChartInterval || setInterval(() =>
                    this.updateCharts(), 60000);

                this.updateCharts(index)
                    .catch(e => window.alert(`Cannot read history: ${e}`));
            }
        }
    }

    async updateCharts(index) {
        let indexesToUpdate = Object.keys(this.history);
        if (index !== undefined) {
            indexesToUpdate = [index];
        } else {
            indexesToUpdate = Object.keys(this.history);
        }
        for (let i = 0; i < indexesToUpdate.length; i++) {
            (_index => {
                this.props.socket.getHistory(this.state.objects[_index]._id, {
                    instance: this.history[_index],
                    start: Date.now() - (parseInt(this.state.rxData[`chartPeriod${_index}`], 10) || 60) * 60000,
                    aggregate: 'minmax',
                    step: 60000,
                })
                    .then(result => {
                        // console.log(`Result: ${JSON.stringify(result)}`);
                        if (result) {
                            const historyData = { ...this.state.historyData };
                            const data = [];
                            let min = result[0].val || 0;
                            let max = result[0].val || 0;
                            for (let j = 0; j < result.length; j++) {
                                const item = result[j];
                                if (min > item.val) {
                                    min = item.val;
                                }
                                if (max < item.val) {
                                    max = item.val;
                                }
                                data.push([item.ts, item.val]);
                            }

                            const withGrid = this.state.rxData.type !== 'lines';

                            const serie = {
                                type: 'line',
                                showSymbol: false,
                                data,
                                lineStyle: {
                                    color: this.props.theme.palette.primary.main,
                                    opacity: 0.3,
                                },
                                areaStyle: {
                                    opacity: 0.1,
                                },
                            };

                            const yAxis = {
                                type: 'value',
                                show: withGrid,
                                boundaryGap: [0, '100%'],
                                splitLine: {
                                    show: withGrid,
                                },
                                min,
                                max,
                            };
                            let tooltip;

                            if (withGrid) {
                                yAxis.axisTick = {
                                    alignWithLabel: true,
                                };
                                yAxis.axisLabel = {
                                    formatter: value => {
                                        let text;
                                        if (this.systemConfig.common.isFloatComma) {
                                            text = value.toString().replace(',', '.') + (this.state.objects[_index].common.unit || '');
                                        } else {
                                            text = value + (this.state.objects[_index].common.unit || '');
                                        }

                                        return text;
                                    },
                                    showMaxLabel: true,
                                    showMinLabel: true,
                                };
                                delete yAxis.min;
                                delete yAxis.max;

                                if (this.state.objects[_index].common.type === 'boolean') {
                                    serie.step = 'end';
                                    yAxis.axisLabel.showMaxLabel = false;
                                    yAxis.axisLabel.formatter = value => (value === 1 ? 'TRUE' : 'FALSE');
                                    yAxis.max = 1.5;
                                    yAxis.interval = 1;
                                    // widthAxis = 50;
                                } else
                                if (this.state.objects[_index].common.type === 'number' && this.state.objects[_index].common.states) {
                                    serie.step = 'end';
                                    yAxis.axisLabel.showMaxLabel = false;
                                    yAxis.axisLabel.formatter = value => (this.state.objects[_index].common.states[value] !== undefined ? this.state.objects[_index].common.states[value] : value);
                                    const keys = Object.keys(this.state.objects[_index].common.states);
                                    keys.sort();
                                    yAxis.max = parseFloat(keys[keys.length - 1]) + 0.5;
                                    yAxis.interval = 1;
                                    // let max = '';
                                    // for (let i = 0; i < keys.length; i++) {
                                    //     if (typeof this.state.objects[_index].common.states[keys[i]] === 'string' && this.state.objects[_index].common.states[keys[i]].length > max.length) {
                                    //         max = this.state.objects[_index].common.states[keys[i]];
                                    //     }
                                    // }
                                    // widthAxis = ((max.length * 9) || 50) + 12;
                                } else if (this.state.objects[_index].common.type === 'number') {
                                    if (this.state.objects[_index].common.min !== undefined && this.state.objects[_index].common.max !== undefined) {
                                        yAxis.max = this.state.objects[_index].common.max;
                                        yAxis.min = this.state.objects[_index].common.min;
                                    } else
                                    if (this.state.objects[_index].common.unit === '%') {
                                        yAxis.max = 100;
                                        yAxis.min = 0;
                                    }
                                }

                                tooltip = {
                                    trigger: 'axis',
                                    formatter: params => {
                                        params = params[0];
                                        const date = new Date(params.value[0]);
                                        let value = params.value[1];
                                        if (value !== null && this.systemConfig.common.isFloatComma) {
                                            value = value.toString().replace('.', ',');
                                        }
                                        return `${params.exact === false ? 'i' : ''}${date.toLocaleString()}.${date.getMilliseconds().toString().padStart(3, '0')}: ` +
                                            `${value}${this.state.objects[_index].common.unit || ''}`;
                                    },
                                    axisPointer: {
                                        animation: true,
                                    },
                                };
                            }

                            historyData[_index] = {
                                backgroundColor: 'transparent',
                                grid: withGrid ? { top: 10, right: 0 } : {
                                    left: 2,
                                    right: 2,
                                    top: 2,
                                    bottom: 2,
                                },
                                animation: false,
                                xAxis: {
                                    type: 'time',
                                    show: withGrid,
                                },
                                yAxis,
                                series: [serie],
                                tooltip,
                            };

                            const newState = { historyData };
                            if (this.refs[_index] &&
                                this.refs[_index].current &&
                                this.refs[_index].current.offsetWidth &&
                                (this.state.chartWidth[_index] !== this.refs[_index].current.offsetWidth ||
                                this.state.chartHeight[_index] !== this.refs[_index].current.offsetHeight)
                            ) {
                                newState.chartWidth = { ...this.state.chartWidth };
                                newState.chartHeight = { ...this.state.chartHeight };
                                newState.chartWidth[_index] = this.refs[_index].current.offsetWidth;
                                newState.chartHeight[_index] = this.refs[_index].current.offsetHeight;
                            }
                            this.setState(newState);
                        }
                    });
            })(indexesToUpdate[i]);
        }
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

        if (this.state.objects[index].widgetType === 'info') {
            this.checkHistory(index)
                .catch(e => console.error(`Cannot read history: ${e}`));
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
                disabled={this.state.objects[index].widgetType === 'info' && (!this.history[index] || this.state.rxData[`hideChart${index}`])}
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
            {this.renderControlDialog()}
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
