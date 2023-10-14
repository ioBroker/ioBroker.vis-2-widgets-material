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
    FormControl, Tooltip, DialogActions, Menu, Card, CardContent,
} from '@mui/material';

import {
    Lightbulb as LightbulbIconOn,
    LightbulbOutlined as LightbulbIconOff,
    Close as CloseIcon,
    RoomService,
    Check,
    Thermostat,
    ColorLens,
    Brightness6,
    Celebration as CelebrationIcon,
    ElectricBolt as BoostIcon,
    Thermostat as ThermostatIcon,
    PowerSettingsNew as PowerSettingsNewIcon,
    LockOpen,
    Lock,
    Backspace,
    MeetingRoom as DoorOpenedIcon,
    LockOpen as LockOpenedIcon,
    Cancel,
    Lock as LockClosedIcon,
    BatteryChargingFull, BatteryFull, PlayArrow, Pause, Home,
} from '@mui/icons-material';

import {
    hexToHsva,
    hslaToHsva,
    hsvaToHex,
    hsvaToHsla,
    hsvaToRgba, rgbaToHex,
    rgbaToHsva,
    ShadeSlider,
    Sketch,
    Wheel,
} from '@uiw/react-color';
import { TbSquareLetterW } from 'react-icons/tb';
import { CircularSliderWithChildren } from 'react-circular-slider-svg';

import { Icon, Utils } from '@iobroker/adapter-react-v5';

import Generic from './Generic';
import BlindsBase, { STYLES } from './Components/BlindsBase';
import WindowClosed from './Components/WindowClosed';
import DoorAnimation from './Components/DoorAnimation';
import LockAnimation from './Components/LockAnimation';
import { colorTemperatureToRGB, RGB_NAMES, RGB_ROLES } from './RGBLight';
import {
    FanIcon,
    VACUUM_CHARGING_STATES,
    VACUUM_CLEANING_STATES,
    VACUUM_ID_ROLES,
    VACUUM_PAUSE_STATES, vacuumGetStatusColor,
} from './Vacuum';
import VacuumCleanerIcon from './Components/VacuumIcon';

const VacuumIcon = () => <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeWidth="1" fill="none" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor" d="M21 12a9 9 0 1 1 -18 0a9 9 0 0 1 18 0z" />
    <path strokeWidth="1" fill="none" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor" d="M14 9a2 2 0 1 1 -4 0a2 2 0 0 1 4 0z" />
    <path strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor" d="M12 16h.01" />
</svg>;

// import ObjectChart from './ObjectChart';

const HISTORY = ['influxdb', 'sql', 'history'];

echarts.use([TimelineComponent, LineChart, SVGRenderer]);

const loadStates = async (field, data, changeData, socket, index) => {
    if (data[field.name]) {
        const object = await socket.getObject(data[field.name]);
        if (object && object.common) {
            const id = data[field.name].split('.');
            id.pop();
            const states = await socket.getObjectView(`${id.join('.')}.`, `${id.join('.')}.\u9999`, 'state');
            if (states) {
                let changed = false;
                Object.values(states).forEach(state => {
                    const role = state.common.role;
                    if (role && RGB_ROLES[role] && (!data[role] || data[role] === 'nothing_selected') && field !== role) {
                        changed = true;
                        if (RGB_ROLES[role] === 'rgb') {
                            data[`oid${index}`] = state._id;
                        } else {
                            data[RGB_ROLES[role] + index] = state._id;
                        }
                        if (RGB_ROLES[role] === 'color_temperature') {
                            if (!data[`ct_min${index}`] && state.common.min) {
                                data[`ct_min${index}`] = state.common.min;
                            }
                            if (!data[`ct_max${index}`] && state.common.max) {
                                data[`ct_max${index}`] = state.common.max;
                            }
                        }
                    }
                });
                changed && changeData(data);
            }
        }
    }
};

const vacuumLoadStates = async (field, data, changeData, socket, index) => {
    if (data[field.name]) {
        const object = await socket.getObject(data[field.name]);
        if (object && object.common) {
            let parts = object._id.split('.');
            parts.pop();
            // try to find a device object
            let device = await socket.getObject(parts.join('.'));
            if (!device) {
                return;
            }
            if (device.type === 'channel' || device.type === 'folder') {
                parts.pop();
                device = await socket.getObject(parts.join('.'));
            }
            if (device.type !== 'device') {
                parts = object._id.split('.');
                parts.pop();
            }

            const states = await socket.getObjectView(`${parts.join('.')}.`, `${parts.join('.')}.\u9999`, 'state');
            if (states) {
                let changed = false;

                if (data[`type${index}`] !== 'vacuum' && data[field.name].startsWith('mihome-vacuum.')) {
                    changed = true;
                    data[`type${index}`] = 'vacuum';
                }

                Object.keys(VACUUM_ID_ROLES).forEach(name => {
                    if (!data[`vacuum-${name}-oid${index}`]) {
                        // try to find state
                        Object.values(states).forEach(state => {
                            const _parts = state._id.split('.');
                            if (_parts.includes('rooms')) {
                                if (!data[`vacuum-rooms${index}`]) {
                                    changed = true;
                                    data[`vacuum-rooms${index}`] = true;
                                }
                                return;
                            }

                            const role = state.common.role;
                            if (VACUUM_ID_ROLES[name].role && !role?.includes(VACUUM_ID_ROLES[name].role)) {
                                return;
                            }
                            if (VACUUM_ID_ROLES[name].name) {
                                const last = state._id.split('.').pop().toLowerCase();
                                if (!last.includes(VACUUM_ID_ROLES[name].name)) {
                                    return;
                                }
                            }

                            changed = true;
                            data[`vacuum-${name}-oid${index}`] = state._id;
                        });
                    }
                });

                changed && changeData(data);
            }
        }
    }
};

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
    widgetContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
    },
    buttonsContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoData: {
        textAlign: 'center',
        minWidth: 58,
    },
    value: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryValueDiv: {
        marginLeft: 4,
        fontSize: 'smaller',
        opacity: 0.6,
        whiteSpace: 'nowrap',
    },
    secondaryValue: {
        marginLeft: 4,
        whiteSpace: 'nowrap',
    },

    rgbSliderContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
    },
    rgbDialogContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 400,
    },
    rgbWheel: {
        display: 'flex',
        justifyContent: 'center',
    },
    rgbDialog: {
        maxWidth: 400,
    },

    thermostatCircleDiv: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        '& svg circle': {
            cursor: 'pointer',
        },
        '&>div': {
            margin: 'auto',
            '&>div': {
                top: '35% !important',
            },
        },
    },
    thermostatButtonsDiv: {
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        position: 'absolute',
        bottom: 8,
        left: 0,
    },
    thermostatNewValueLight: {
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
    thermostatNewValueDark: {
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
    thermostatDesiredTemp: {
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        left: 0,
        transform: 'none',
    },

    lockPinGrid:  {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridGap: '10px',
    },
    lockPinInput:  {
        padding: '10px 0px',
    },
    lockWorkingIcon: {
        position: 'absolute',
        top: 10,
        left: 10,
    },
    lockSvgIcon: {
        // width: '100%',
        // height: '100%',
    },

    vacuumBattery: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    },
    vacuumSensorsContainer: {
        overflow: 'auto',
    },
    vacuumSensors: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 4,
        minWidth: 'min-content',
    },
    vacuumButtons: {
        display: 'flex', alignItems: 'center', gap: 4,
    },
    vacuumContent: {
        width: '100%',
        height: '100%',
        overflow: 'auto',
    },
    vacuumMapContainer: { flex: 1 },
    vacuumTopPanel: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    vacuumBottomPanel: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    vacuumSensorCard: {
        boxShadow: 'none',
        backgroundColor: 'transparent',
        backgroundImage: 'none',
    },
    vacuumSensorCardContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: 2,
        paddingBottom: 2,
    },
    vacuumSensorBigText: { fontSize: 20 },
    vacuumSensorSmallText: { fontSize: 12 },
    vacuumImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        color: 'grey',
    },
    vacuumSpeedContainer: { gap: 4, display: 'flex', alignItems: 'center' },

    ...STYLES,
});

class Switches extends BlindsBase {
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
        this.state.sketch = {};
        this.state.dialogPin = null;
        this.timeouts = {};
        this.history = {};
        this._refs = {}; // this.refs name does not work (I don't know why)
        this.widgetRef = {};
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
                            default: 'lines',
                        },
                        {
                            name: 'allSwitch',
                            type: 'checkbox',
                            default: true,
                            label: 'show_all_switch',
                            hidden: 'data.type !== "lines"',
                        },
                        {
                            name: 'orientation',
                            type: 'select',
                            options: [
                                { value: 'h', label: 'horizontal' },
                                { value: 'v', label: 'vertical' },
                                { value: 'f', label: 'flexible' },
                            ],
                            default: 'horizontal',
                            label: 'orientation',
                            hidden: 'data.type !== "buttons"',
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
                            hidden: 'data["widget" + index]',
                            onChange: async (field, data, changeData, socket, index) => {
                                if (data[field.name]) {
                                    if (data[field.name].startsWith('mihome-vacuum.')) {
                                        await vacuumLoadStates(field, data, changeData, socket, index);
                                        return;
                                    }
                                    const object = await socket.getObject(data[field.name]);

                                    if (object?.common?.role &&
                                        (
                                            object.common.role.includes('level.temperature') ||
                                            object.common.role.includes('rgb') ||
                                            object.common.role.includes('lock')
                                        )
                                    ) {
                                        const id = data[field.name].split('.');
                                        id.pop();
                                        const states = await socket.getObjectView(`${id.join('.')}.`, `${id.join('.')}.\u9999`, 'state');
                                        if (states) {
                                            let changed = false;
                                            if (data[`type${index}`] !== 'thermostat' && object.common.role.includes('level.temperature')) {
                                                changed = true;
                                                data[`type${index}`] = 'thermostat';
                                            }
                                            if (data[`type${index}`] !== 'rgb' && object.common.role.includes('rgb')) {
                                                changed = true;
                                                data[`type${index}`] = 'rgb';
                                            }
                                            if (data[`type${index}`] !== 'lock' && object.common.role.includes('lock')) {
                                                changed = true;
                                                data[`type${index}`] = 'lock';
                                            }
                                            if (object.common.role.includes('level.temperature')) {
                                                Object.values(states).forEach(state => {
                                                    const role = state.common.role;
                                                    if (role && role.includes('value.temperature')) {
                                                        data[`actual${index}`] = state._id;
                                                        changed = true;
                                                    } else if (role && role.includes('power')) {
                                                        data[`switch${index}`] = state._id;
                                                        changed = true;
                                                    } else if (role && role.includes('boost')) {
                                                        data[`boost${index}`] = state._id;
                                                        changed = true;
                                                    } else if (role && role.includes('party')) {
                                                        data[`party${index}`] = state._id;
                                                        changed = true;
                                                    }
                                                });
                                            } else if (object.common.role.includes('rgb')) {
                                                if (data[`rgbType${index}`] !== 'rgb' && object.common.role.includes('rgbw')) {
                                                    changed = true;
                                                    data[`rgbType${index}`] = 'rgbw';
                                                } else if (data[`rgbType${index}`] !== 'rgb') {
                                                    changed = true;
                                                    data[`rgbType${index}`] = 'rgb';
                                                }

                                                Object.values(states).forEach(state => {
                                                    const role = state.common.role;
                                                    if (role && RGB_ROLES[role] && (!data[role] || data[role] === 'nothing_selected') && field !== role) {
                                                        changed = true;
                                                        if (RGB_ROLES[role] === 'rgb') {
                                                            data[`oid${index}`] = state._id;
                                                        } else {
                                                            data[RGB_ROLES[role] + index] = state._id;
                                                        }
                                                    }
                                                });
                                            } else if (object.common.role.includes('lock')) {
                                                Object.values(states).forEach(state => {
                                                    const role = state.common.role;
                                                    if (role && role.includes('button')) {
                                                        data[`open${index}`] = state._id;
                                                        changed = true;
                                                    } else if (role && role.includes('working')) {
                                                        data[`working${index}`] = state._id;
                                                        changed = true;
                                                    }
                                                });
                                            }

                                            changed && changeData(data);
                                        }
                                    }
                                }
                            },
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
                                {
                                    value: 'blinds',
                                    label: 'blinds',
                                },
                                {
                                    value: 'thermostat',
                                    label: 'thermostat',
                                },
                                {
                                    value: 'rgb',
                                    label: 'rgb',
                                },
                                {
                                    value: 'lock',
                                    label: 'lock',
                                },
                                {
                                    value: 'vacuum',
                                    label: 'vacuum',
                                },
                            ],
                            hidden: '!data["oid" + index]',
                            default: 'auto',
                        },
                        {
                            name: 'noIcon',
                            type: 'checkbox',
                            label: 'no_icon',
                            hidden: 'data.type === "buttons" && !!data["widget" + index]',
                        },
                        {
                            name: 'icon',
                            type: 'image',
                            label: 'icon',
                            hidden: '!!data["iconSmall" + index] || data["type" + index] === "blinds" || data["noIcon" + index] || (data.type === "buttons" && !!data["widget" + index])',
                        },
                        {
                            name: 'iconSmall',
                            type: 'icon64',
                            label: 'small_icon',
                            hidden: '!!data["icon" + index] || data["type" + index] === "blinds" || data["noIcon" + index] || (data.type === "buttons" && !!data["widget" + index])',
                        },
                        {
                            name: 'iconEnabled',
                            type: 'image',
                            label: 'icon_active',
                            hidden: '!data["oid" + index] || !!data["iconEnabledSmall" + index] || data["type" + index] === "blinds" || data["noIcon" + index] || (data.type === "buttons" && !!data["widget" + index])',
                        },
                        {
                            name: 'iconEnabledSmall',
                            type: 'icon64',
                            label: 'small_icon_active',
                            hidden: '!data["oid" + index] || !!data["iconEnabled" + index] || data["type" + index] === "blinds" || data["noIcon" + index] || (data.type === "buttons" && !!data["widget" + index])',
                        },
                        {
                            name: 'color',
                            type: 'color',
                            label: 'color',
                            hidden: '!data["oid" + index] || data["type" + index] === "blinds" || data["widget" + index]',
                        },
                        {
                            name: 'colorEnabled',
                            type: 'color',
                            label: 'color_active',
                            hidden: 'data["type" + index] === "blinds" || data["widget" + index]',
                        },
                        {
                            name: 'title',
                            type: 'text',
                            label: 'title',
                            hidden: 'data.type === "buttons" && !!data["widget" + index]',
                        },
                        {
                            name: 'unit',
                            type: 'text',
                            noButton: true,
                            label: 'unit',
                            hidden: 'data["type" + index] === "button" || data["type" + index] === "switch" || data["widget" + index]',
                        },
                        {
                            name: 'step',
                            label: 'values_step',
                            hidden: '!data["oid" + index] || (data["type" + index] !== "select" && data["type" + index] !== "thermostat")',
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
                            name: 'buttonIconActive',
                            type: 'icon64',
                            label: 'button_icon',
                            hidden: 'data.type !== "lines" || !data["oid" + index] || data["type" + index] !== "button" || !!data["buttonText" + index] || !!data["buttonImageActive" + index]',
                        },
                        {
                            name: 'buttonImageActive',
                            type: 'image',
                            label: 'button_image',
                            hidden: 'data.type !== "lines" || !data["oid" + index] || data["type" + index] !== "button" || !!data["buttonText" + index] || !!data["buttonIconActive" + index]',
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
                        {
                            name: 'widget',
                            type: 'widget',
                            label: 'widget_id',
                            hidden: '!!data["oid" + index]',
                            checkUsage: true,
                        },
                        {
                            name: 'height',
                            type: 'slider',
                            min: 40,
                            max: 500,
                            label: 'height',
                            hidden: '!data["widget" + index]',
                        },
                        {
                            name: 'position',
                            type: 'slider',
                            min: 0,
                            max: 500,
                            label: 'position',
                            hidden: '!data["widget" + index] || data.type !== "lines"',
                        },
                        {
                            name: 'hide',
                            type: 'checkbox',
                            label: 'hide',
                            tooltip: 'hide_tooltip',
                        },
                        {
                            name: 'actual',
                            type: 'id',
                            label: 'actual_oid',
                            hidden: '!!data["widget" + index] || data["type" + index] !== "thermostat"',
                        },
                        {
                            name: 'boost',
                            type: 'id',
                            label: 'mode_boost',
                            hidden: '!!data["widget" + index] || data["type" + index] !== "thermostat"',
                        },
                        {
                            name: 'party',
                            type: 'id',
                            label: 'mode_party',
                            hidden: '!!data["widget" + index] || data["type" + index] !== "thermostat"',
                        },
                        {
                            name: 'switch',
                            type: 'id',
                            label: 'switch',
                            onChange: loadStates,
                            hidden: '!!data["widget" + index] || (data["type" + index] !== "rgb" || data["type" + index] !== "thermostat")',
                        },
                        {
                            name: 'brightness',
                            type: 'id',
                            label: 'brightness',
                            onChange: loadStates,
                            hidden: '!!data["widget" + index] || data["type" + index] !== "rgb"',
                        },
                        {
                            name: 'rgbType',
                            label: 'rgbType',
                            type: 'select',
                            noTranslation: true,
                            options: [
                                'rgb', 'rgbw', 'r/g/b', 'r/g/b/w', 'hue/sat/lum', 'ct',
                            ],
                            onChange: loadStates,
                            hidden: '!!data["widget" + index] || data["type" + index] !== "rgb"',
                        },
                        {
                            name: 'red',
                            type: 'id',
                            label: 'red',
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'rgb' || (data[`rgbType${index}`] !== 'r/g/b' && data[`rgbType${index}`] !== 'r/g/b/w'),
                            onChange: loadStates,
                        },
                        {
                            name: 'green',
                            type: 'id',
                            label: 'green',
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'rgb' || (data[`rgbType${index}`] !== 'r/g/b' && data[`rgbType${index}`] !== 'r/g/b/w'),
                            onChange: loadStates,
                        },
                        {
                            name: 'blue',
                            type: 'id',
                            label: 'blue',
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'rgb' || (data[`rgbType${index}`] !== 'r/g/b' && data[`rgbType${index}`] !== 'r/g/b/w'),
                            onChange: loadStates,
                        },
                        {
                            name: 'white',
                            type: 'id',
                            label: 'white',
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'rgb' || (data[`rgbType${index}`] !== 'r/g/b/w' && data[`rgbType${index}`] !== 'rgbw'),
                            onChange: loadStates,
                        },
                        {
                            name: 'color_temperature',
                            type: 'id',
                            label: 'color_temperature',
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'rgb' || data[`rgbType${index}`] !== 'ct',
                            onChange: loadStates,
                        },
                        {
                            name: 'ct_min',
                            type: 'number',
                            min: 500,
                            max: 10000,
                            label: 'color_temperature_min',
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'rgb' || data[`rgbType${index}`] !== 'ct' || !data[`color_temperature${index}`],
                        },
                        {
                            name: 'ct_max',
                            type: 'number',
                            min: 500,
                            max: 10000,
                            label: 'color_temperature_max',
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'rgb' || data[`rgbType${index}`] !== 'ct' || !data[`color_temperature${index}`],
                        },
                        {
                            name: 'hue',
                            type: 'id',
                            label: 'hue',
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'rgb' || data[`rgbType${index}`] !== 'hue/sat/lum',
                            onChange: loadStates,
                        },
                        {
                            name: 'saturation',
                            type: 'id',
                            label: 'saturation',
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'rgb' || data[`rgbType${index}`] !== 'hue/sat/lum',
                            onChange: loadStates,
                        },
                        {
                            name: 'luminance',
                            type: 'id',
                            label: 'luminance',
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'rgb' || data[`rgbType${index}`] !== 'hue/sat/lum',
                            onChange: loadStates,
                        },
                        {
                            name: 'open',
                            type: 'id',
                            label: 'doorOpen-oid',
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'lock',
                        },
                        {
                            name: 'working',
                            type: 'id',
                            label: 'lockWorking-oid',
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'lock',
                        },
                        {
                            name: 'sensor',
                            type: 'id',
                            label: 'doorSensor-oid',
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'lock',
                        },
                        {
                            name: 'pincode',
                            label: 'pincode',
                            onChange: async (field, data, changeData, socket, index) => {
                                if (data[`pincode${index}`] && data[`pincode${index}`].match(/[^0-9]/g)) {
                                    data[`pincode${index}`] = data[`pincode${index}`].replace(/[^0-9]/g, '');
                                    changeData(data);
                                }
                            },
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'lock' || !!data[`oid-pincode${index}`],
                        },
                        {
                            name: 'oid-pincode',
                            type: 'id',
                            label: 'pincode_oid',
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'lock' || !!data[`pincode${index}`],
                        },
                        {
                            name: 'doNotConfirm',
                            type: 'checkbox',
                            label: 'doNotConfirm',
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'lock' || (!!data[`oid-pincode${index}`] && !!data[`pincode${index}`]),
                        },
                        {
                            name: 'noLockAnimation',
                            label: 'noLockAnimation',
                            type: 'checkbox',
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'lock' || !data[`oid${index}`],
                        },
                        {
                            name: 'lockColor',
                            label: 'Lock color',
                            type: 'color',
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'lock' || !data[`oid${index}`] || !!data[`noLockAnimation${index}`],
                        },
                        {
                            name: 'pincodeReturnButton',
                            type: 'select',
                            options: ['submit', 'backspace'],
                            default: 'submit',
                            label: 'pincode_return_button',
                            hidden: (data, index) => !!data[`widget${index}`] || data[`type${index}`] !== 'lock' || (!!data[`oid-pincode${index}`] && !!data[`pincode${index}`]),
                        },
                        {
                            name: 'timeout',
                            label: 'controlTimeout',
                            tooltip: 'timeout_tooltip',
                            type: 'slider',
                            min: 0,
                            max: 2000,
                            default: 500,
                            hidden: '!!data["widget" + index] || (data["type" + index] !== "rgb" && data["type" + index] !== "slider" && data["type" + index] !== "thermostat")',
                        },

                        {
                            label: 'status',
                            name: 'vacuum-status-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                        },
                        {
                            label: 'battery',
                            name: 'vacuum-battery-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                        },
                        {
                            label: 'is_charging',
                            name: 'vacuum-is-charging-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                        },
                        {
                            label: 'fan_speed',
                            name: 'vacuum-fan-speed-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                        },
                        {
                            label: 'sensors_left',
                            name: 'vacuum-sensors-left-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                        },
                        {
                            label: 'filter_left',
                            name: 'vacuum-filter-left-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                        },
                        {
                            label: 'main_brush_left',
                            name: 'vacuum-main-brush-left-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                        },
                        {
                            label: 'side_brush_left',
                            name: 'vacuum-side-brush-left-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                        },
                        {
                            label: 'cleaning_count',
                            name: 'vacuum-cleaning-count-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                        },
                        {
                            label: 'rooms',
                            name: 'vacuum-use-rooms',
                            type: 'checkbox',
                            tooltip: 'rooms_tooltip',
                        },
                        {
                            label: 'map64',
                            name: 'vacuum-map64-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                        },
                        {
                            label: 'useDefaultPicture',
                            name: 'vacuum-use-default-picture',
                            type: 'checkbox',
                            default: true,
                            hidden: '!!data["vacuum-map64-oid"]',
                        },
                        {
                            label: 'ownImage',
                            name: 'vacuum-own-image',
                            type: 'image',
                            hidden: '!!data["vacuum-map64-oid"] || !data["vacuum-use-default-picture"]',
                        },
                        {
                            label: 'start',
                            name: 'vacuum-start-oid',
                            type: 'id',
                        },
                        {
                            label: 'home',
                            name: 'vacuum-home-oid',
                            type: 'id',
                        },
                        {
                            label: 'pause',
                            name: 'vacuum-pause-oid',
                            type: 'id',
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
        const secondaryObjects = {};
        const ids = [];
        for (let index = 1; index <= this.state.rxData.count; index++) {
            if (this.state.rxData[`type${index}`] === 'rgb') {
                this.rgbObjectIDs(index, ids);
            } else if (this.state.rxData[`type${index}`] === 'thermostat') {
                this.thermostatObjectIDs(index, ids);
            } else if (this.state.rxData[`type${index}`] === 'vacuum') {
                this.vacuumObjectIDs(index, ids);
            } else if (this.state.rxData[`oid${index}`] && this.state.rxData[`oid${index}`] !== 'nothing_selected') {
                ids.push(this.state.rxData[`oid${index}`]);
            }
        }
        const _objects = ids.length ? (await this.props.context.socket.getObjectsById(ids)) : {};

        // try to find icons for all OIDs
        for (let index = 1; index <= this.state.rxData.count; index++) {
            if (this.state.rxData[`type${index}`] === 'rgb') {
                this.rgbReadObjects(index, _objects, objects, secondaryObjects);
            } else if (this.state.rxData[`type${index}`] === 'thermostat') {
                this.thermostatReadObjects(index, _objects, objects, secondaryObjects);
            } else if (this.state.rxData[`type${index}`] === 'vacuum') {
                await this.vacuumReadObjects(index, _objects, objects, secondaryObjects);
            } else if (this.state.rxData[`oid${index}`] && this.state.rxData[`oid${index}`] !== 'nothing_selected') {
                // read an object itself
                const object = _objects[this.state.rxData[`oid${index}`]];
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
                    } else if (object.common.states && object.common.write !== false) {
                        // with states => select
                        widgetType = 'select';
                    } else if (object.common.type === 'number' && object.common.max !== undefined) {
                        // number writable max => slider
                        widgetType = 'slider';
                    } else if (object.common.type === 'boolean' && object.common.write !== false) {
                        // boolean writable => switch
                        widgetType = 'switch';
                    } else if (object.common.type === 'boolean' && object.common.read === false) {
                        // boolean not readable => button
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

                if (this.state.rxData[`noIcon${index}`]) {
                    object.common.icon = null;
                } else if (!this.state.rxData[`icon${index}`] && !this.state.rxData[`iconSmall${index}`] && !object.common.icon && (object.type === 'state' || object.type === 'channel')) {
                    const idArray = this.state.rxData[`oid${index}`].split('.');

                    // read channel
                    const parentObject = await this.props.context.socket.getObject(idArray.slice(0, -1).join('.'));
                    if (!parentObject?.common?.icon && (object.type === 'state' || object.type === 'channel')) {
                        const grandParentObject = await this.props.context.socket.getObject(idArray.slice(0, -2).join('.'));
                        if (grandParentObject?.common?.icon) {
                            object.common.icon = Generic.getObjectIcon(grandParentObject, grandParentObject._id);
                        }
                    } else {
                        object.common.icon = Generic.getObjectIcon(parentObject, parentObject._id);
                    }
                }

                if (widgetType === 'blinds') {
                    object.common.unit = '%';
                }

                objects[index] = {
                    common: object.common,
                    _id: object._id,
                    widgetType,
                };
                if (this.widgetRef[index]) {
                    delete this.widgetRef[index];
                }
            } else if (this.state.rxData[`widget${index}`]) {
                objects[index] = this.state.rxData[`widget${index}`];
                this.widgetRef[index] = this.widgetRef[index] || React.createRef();
            } else if (this.widgetRef[index]) {
                delete this.widgetRef[index];
                objects[index] = null;
            }
        }

        if (JSON.stringify(objects) !== JSON.stringify(this.state.objects) ||
            JSON.stringify(secondaryObjects) !== JSON.stringify(this.state.secondaryObjects)
        ) {
            this.setState({ objects, secondaryObjects });
        }
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.propertiesUpdate();
        // inform view about, that this widget can include other widgets
        this.props.askView && this.props.askView('update', {
            id: this.props.id,
            uuid: this.uuid,
            canHaveWidgets: true,
        });
    }

    // eslint-disable-next-line
    onCommand(command, options) {
        const result = super.onCommand(command, options);
        if (!result) {
            if (command === 'include') {
                let found = false;
                // find first completely free position
                for (let index = 1; index <= this.state.rxData.count; index++) {
                    if (!this.state.rxData[`oid${index}`] &&
                        !this.state.rxData[`widget${index}`] &&
                        !this.state.rxData[`title${index}`]
                    ) {
                        found = index;
                        break;
                    }
                }
                const project = JSON.parse(JSON.stringify(this.props.context.views));
                const widget = project[this.props.view].widgets[this.props.id];
                // if required add new widget
                if (!found) {
                    widget.data.count++;
                    found = widget.data.count;
                }
                widget.data[`widget${found}`] = options;
                this.props.context.changeProject(project);
                return true;
            }
        }

        return result;
    }

    async componentWillUnmount() {
        this.updateDialogChartInterval && clearInterval(this.updateDialogChartInterval);
        this.updateDialogChartInterval = null;

        this.updateChartInterval && clearInterval(this.updateChartInterval);
        this.updateChartInterval = null;

        this.rgbDestroy();
    }

    async onRxDataChanged() {
        await this.propertiesUpdate();
    }

    isOn(index, values) {
        const obj = this.state.objects[index];
        if (!obj || typeof obj === 'string') {
            return false;
        }

        values = values || this.state.values;
        if (obj.widgetType === 'rgb' || obj.widgetType === 'thermostat' || obj.widgetType === 'vacuum') {
            // analyse rgb
            return values[`${this.state.rxData[`switch${index}`]}.val`];
        }
        if (obj.common.type === 'number') {
            return values[`${this.state.objects[index]._id}.val`] !== obj.common.min;
        }

        return !!values[`${this.state.objects[index]._id}.val`];
    }

    getStateIcon(index) {
        const obj = this.state.objects[index];
        let icon = '';
        if (this.state.rxData[`noIcon${index}`]) {
            return null;
        }
        if (this.isOn(index)) {
            icon = this.state.rxData[`iconEnabled${index}`] || this.state.rxData[`iconEnabledSmall${index}`];
        }

        icon = icon || this.state.rxData[`icon${index}`] || this.state.rxData[`iconSmall${index}`];
        icon = icon || obj?.common?.icon;

        const isOn = this.isOn(index);
        const color = this.getColor(index, isOn);

        if (icon) {
            icon = <Icon
                src={icon}
                style={{ width: 40, height: 40, color }}
                className={this.props.classes.iconCustom}
            />;
        } else if (obj?.widgetType === 'blinds') {
            icon = <WindowClosed style={{ color }} />;
        } else if (obj?.widgetType === 'vacuum') {
            icon = <VacuumIcon />;
        } else if (obj?.widgetType === 'thermostat') {
            if (this.state.rxData[`switch${index}`] && this.state.values[`${this.state.rxData[`switch${index}`]}.val`]) {
                icon = <Thermostat color="primary" style={{ color }} />;
            } else {
                icon = <Thermostat />;
            }
        } else if (obj?.widgetType === 'lock') {
            if (isOn) {
                icon = <LockOpen color="primary" style={{ color }} />;
            } else {
                icon = <Lock style={{ color }} />;
            }
        } else if (obj?.widgetType === 'vacuum') {
            if (isOn) {
                icon = <LightbulbIconOn color="primary" style={{ color }} />;
            } else {
                icon = <LightbulbIconOff style={{ color }} />;
            }
        } else if (obj?.widgetType === 'rgb') {
            // check if rgb has power
            if (this.state.rxData[`switch${index}`]) {
                if (this.state.values[`${this.state.rxData[`switch${index}`]}.val`]) {
                    icon = <LightbulbIconOn color="primary" style={{ color }} />;
                } else {
                    icon = <LightbulbIconOff style={{ color }} />;
                }
            } else if (this.state.rxData[`brightness${index}`]) {
                if (this.state.values[`${this.state.rxData[`brightness${index}`]}.val`]) {
                    icon = <LightbulbIconOn color="primary" style={{ color }} />;
                } else {
                    icon = <LightbulbIconOff style={{ color }} />;
                }
            } else {
                icon = <LightbulbIconOn color="primary" style={{ color }} />;
            }
        } else if (isOn) {
            icon = <LightbulbIconOn color="primary" style={{ color }} />;
        } else {
            icon = <LightbulbIconOff style={{ color }} />;
        }

        return icon;
    }

    getColor(index, isOn) {
        const obj = this.state.objects[index];
        if (typeof obj === 'string') {
            return undefined;
        }
        if (isOn === undefined) {
            isOn = this.isOn(index);
        }

        return isOn ?
            this.state.rxData[`colorEnabled${index}`] || this.state.rxData[`color${index}`] || obj?.common?.color
            : this.state.rxData[`color${index}`] || obj?.common?.color;
    }

    changeSwitch = index => {
        if (
            this.state.objects[index].widgetType === 'rgb' ||
            this.state.objects[index].widgetType === 'lock' ||
            this.state.objects[index].widgetType === 'vacuum' ||
            this.state.objects[index].widgetType === 'thermostat'
        ) {
            this.setState({ showControlDialog: index });
        } else if (
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
                this.props.context.socket.setState(this.state.rxData[`oid${index}`], this.state.objects[index].common.max);
            } else {
                this.props.context.socket.setState(this.state.rxData[`oid${index}`], true);
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
            this.props.context.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
        }
    };

    buttonPressed(index) {
        this.props.context.socket.setState(this.state.rxData[`oid${index}`], true);
    }

    setOnOff(index, isOn) {
        const values = JSON.parse(JSON.stringify(this.state.values));
        const oid = `${this.state.objects[index]._id}.val`;
        values[oid] = isOn ? this.state.objects[index].common.max : this.state.objects[index].common.min;
        this.setState({ values });
        this.props.context.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
    }

    controlSpecificState(index, value) {
        const values = JSON.parse(JSON.stringify(this.state.values));
        const oid = `${this.state.objects[index]._id}.val`;
        values[oid] = value;
        this.setState({ values, showControlDialog: null });
        this.props.context.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
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
                                style={this.customStyle}
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
                            style={this.customStyle}
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
                            style={{ width: '50%', ...this.customStyle }}
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
                            style={{ width: '50%', ...this.customStyle }}
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
                            step={parseFloat(this.state.rxData[`step${index}`]) || undefined}
                            valueLabelDisplay="auto"
                            min={this.state.objects[index].common.min}
                            max={this.state.objects[index].common.max}
                            onChange={(event, value) => {
                                const values = JSON.parse(JSON.stringify(this.state.values));
                                const oid = `${this.state.objects[index]._id}.val`;
                                values[oid] = value;
                                this.setState({ values });
                                this.props.context.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
                            }}
                        />
                    </div>
                </>;
            } else if (this.state.objects[index].widgetType === 'rgb') {
                control = this.rgbRenderDialog(index);
            } else if (this.state.objects[index].widgetType === 'thermostat') {
                control = this.thermostatRenderDialog(index);
            } else if (this.state.objects[index].widgetType === 'lock') {
                // control = this.lockRenderDialog(index);
            } else if (this.state.objects[index].widgetType === 'vacuum') {
                control = this.vacuumRenderDialog(index);
            } else if (this.state.objects[index].widgetType === 'info') {
                if (this._refs[index]) {
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
                        ref={this._refs[index]}
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
                            socket={this.props.context.socket}
                            obj={this.state.objects[index]}
                            unit={this.state.objects[index].common.unit}
                            title={this.state.rxData[`title${index}`] || Generic.getText(this.state.objects[index].common.name)}
                            objLineType="line"
                            objColor={this.props.context.theme.palette.primary.main}
                            objBackgroundColor={this.props.context.theme.palette.primary.main}
                            themeType={this.props.themeType}
                            defaultHistory={this.history[index]}
                            noToolbar
                            systemConfig={this.props.context.systemConfig}
                            dateFormat={this.props.context.systemConfig.common.dateFormat}
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
                                    this.props.context.socket.setState(this.state.rxData[`oid${index}`], parseFloat(values[oid]));
                                } else if (this.state.objects[index].common.type === 'boolean') {
                                    this.props.context.socket.setState(
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
                                    this.props.context.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
                                }
                            }
                        }}
                        onChange={event => this.setState({ inputValue: event.target.value })}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        title={Generic.t('Set')}
                        style={this.customStyle}
                        onClick={() => {
                            const values = JSON.parse(JSON.stringify(this.state.values));
                            const oid = `${this.state.objects[index]._id}.val`;
                            values[oid] = this.state.inputValue;
                            this.setState({ values, showControlDialog: null });
                            if (this.state.objects[index].common.type === 'number') {
                                this.props.context.socket.setState(this.state.rxData[`oid${index}`], parseFloat(values[oid]));
                            } else if (this.state.objects[index].common.type === 'boolean') {
                                this.props.context.socket.setState(
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
                                this.props.context.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
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
                classes={{ paper: this.props.classes.rgbDialog }}
                open={!0}
                onClose={() => {
                    this.updateDialogChartInterval && clearInterval(this.updateDialogChartInterval);
                    this.updateDialogChartInterval = null;

                    this.setState({ showControlDialog: null });
                }}
            >
                <DialogTitle>
                    {(this.state.rxData[`title${index}`] || Generic.getText(this.state.objects[index].common?.name) || '').trim()}
                    <IconButton style={{ float: 'right' }} onClick={() => this.setState({ showControlDialog: null })}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent>
                    {control}
                </DialogContent>
            </Dialog>;
        }

        return null;
    }

    renderWidgetInWidget(index, asButton) {
        const wid = this.state.rxData[`widget${index}`];
        const widget = this.props.context.views[this.props.view]?.widgets?.[wid];
        if (widget && wid !== this.props.id && this.getWidgetInWidget) { // todo: remove this condition after vis release
            // come again when the ref is filled
            if (!this.widgetRef[index].current) {
                setTimeout(() => this.forceUpdate(), 50);
            }
            const style = asButton ? { justifyContent: 'center' } : { margin: 8, justifyContent: 'right' };
            if (asButton) {
                if (!this.state.rxData.orientation || this.state.rxData.orientation === 'h') {
                    style.width = this.state.rxData[`width${index}`] || this.state.rxData.buttonsWidth || widget.style?.width || 120;
                } else if (this.state.rxData.orientation === 'v') {
                    style.height = this.state.rxData[`height${index}`] || this.state.rxData.buttonsHeight || widget.style?.height || 80;
                } else if (this.state.rxData.orientation === 'f') {
                    style.width = this.state.rxData[`width${index}`] || this.state.rxData.buttonsWidth || widget.style?.width || 120;
                    style.height = this.state.rxData[`height${index}`] || this.state.rxData.buttonsHeight || widget.style?.height || 80;
                }

                if (this.state.selectedOne) {
                    style.border = '1px dashed gray';
                    style.boxSizing = 'border-box';
                }
            } else {
                style.height = this.state.rxData[`height${index}`] || widget.style?.height || 80;
                style.marginRight = this.state.rxData[`position${index}`];
            }

            return <div
                key={index}
                ref={this.widgetRef[index]}
                className={this.props.classes.widgetContainer}
                style={style}
            >
                {this.widgetRef[index].current ? this.getWidgetInWidget(this.props.view, wid, { refParent: this.widgetRef[index] }) : null}
            </div>;
        }
        return null;
    }

    renderLine(index) {
        if (typeof this.state.objects[index] === 'string') {
            return this.renderWidgetInWidget(index);
        }
        let value = this.state.values[`${this.state.objects[index]._id}.val`];

        if (this.state.objects[index].widgetType === 'rgb') {
            let switchState = null;
            if (this.state.secondaryObjects[index].switch) {
                switchState = this.getPropertyValue(`switch${index}`);
            }

            return <IconButton
                style={{
                    backgroundColor: switchState === null || switchState ? this.rgbGetColor(index) :
                        (this.props.context.themeType === 'dark' ? '#111' : '#eee'),
                    color: this.rgbGetTextColor(index),
                    width: 36,
                    height: 36,
                }}
                onClick={() => this.setState({ showControlDialog: index })}
            >
                <ColorLens
                    style={{
                        color: switchState === null || switchState ? undefined : this.rgbGetColor(index),
                    }}
                />
            </IconButton>;
        }

        if (this.state.objects[index].widgetType === 'vacuum') {
            return this.vacuumRenderButtons(index, true);
        }

        if (this.state.objects[index].widgetType === 'lock') {
            return this.lockRenderLine(index);
        }

        if (this.state.objects[index].widgetType === 'button') {
            const text = this.state.rxData[`buttonText${index}`];
            let icon = this.state.rxData[`buttonIcon${index}`] || this.state.rxData[`buttonImage${index}`];
            const iconActive = this.state.rxData[`buttonIconActive${index}`] || this.state.rxData[`buttonImageActive${index}`];
            if (iconActive && (value === '1' || value === 1 || value === true || value === 'true')) {
                icon = iconActive;
            }

            return <Button
                onClick={() => this.buttonPressed(index)}
                style={this.customStyle}
            >
                {text || (icon ? <Icon src={icon} style={{ width: 24, height: 24 }} /> : <RoomService />)}
            </Button>;
        }

        if (this.state.objects[index].widgetType === 'switch') {
            return <Switch
                checked={this.isOn(index)}
                onChange={() => this.changeSwitch(index)}
            />;
        }

        if (this.state.objects[index].widgetType === 'slider') {
            const min = this.state.objects[index].common.min === undefined ? 0 : this.state.objects[index].common.min;
            const max = this.state.objects[index].common.max === undefined ? 100 : this.state.objects[index].common.max;
            return [
                <Slider
                    key="slider"
                    className={this.props.classes.controlElement}
                    size="small"
                    valueLabelDisplay="auto"
                    step={parseFloat(this.state.rxData[`step${index}`]) || undefined}
                    value={value === undefined || value === null ? min : value}
                    onChange={(event, newValue) => {
                        const values = JSON.parse(JSON.stringify(this.state.values));
                        const oid = `${this.state.objects[index]._id}.val`;
                        values[oid] = newValue;
                        this.setState({ values }, () => {
                            let timeout = this.state.rxData[`timeout${index}`];
                            if (timeout === null || timeout === undefined || timeout === '') {
                                timeout = 500;
                            }

                            if (timeout) {
                                this.timeouts[index] = this.timeouts[index] || {};
                                this.timeouts[index][oid] && clearTimeout(this.timeouts[index][oid]);
                                this.timeouts[index][oid] = setTimeout(_newValue => {
                                    this.timeouts[index][oid] = null;
                                    this.props.context.socket.setState(this.state.rxData[`oid${index}`], _newValue);
                                }, parseInt(timeout, 10), newValue);
                            } else {
                                this.props.context.socket.setState(this.state.rxData[`oid${index}`], newValue);
                            }
                        });
                    }}
                    min={min}
                    max={max}
                />,
                <div key="value" style={{ width: 45 }}>
                    {value + (this.state.objects[index].common.unit ? ` ${this.state.objects[index].common.unit}` : '')}
                </div>,
            ];
        }

        if (this.state.objects[index].widgetType === 'thermostat') {
            const min = this.state.objects[index].common.min === undefined ? 12 : this.state.objects[index].common.min;
            const max = this.state.objects[index].common.max === undefined ? 30 : this.state.objects[index].common.max;
            let temp;
            if (this.state.rxData[`actual${index}`]) {
                temp = this.state.values[`${this.state.rxData[`actual${index}`]}.val`];
                if (temp || temp === '0') {
                    temp = temp.toString();
                    if (temp.includes('.')) {
                        const f = Math.round((parseFloat(temp) || 0) * 10) / 10;
                        if (this.props.context.systemConfig.common.isFloatComma) {
                            temp = f.toString().replace('.', ',');
                        } else {
                            temp = f.toString();
                        }
                    }
                }
            }
            return [
                <Slider
                    key="slider"
                    className={this.props.classes.controlElement}
                    size="small"
                    step={parseFloat(this.state.rxData[`step${index}`]) || undefined}
                    valueLabelDisplay="auto"
                    value={value === undefined || value === null ? min : value}
                    onChange={(event, newValue) => {
                        const values = JSON.parse(JSON.stringify(this.state.values));
                        const oid = `${this.state.objects[index]._id}.val`;
                        values[oid] = newValue;
                        this.setState({ values }, () => {
                            let timeout = this.state.rxData[`timeout${index}`];
                            if (timeout === null || timeout === undefined || timeout === '') {
                                timeout = 500;
                            }

                            if (timeout) {
                                this.timeouts[index] = this.timeouts[index] || {};
                                this.timeouts[index][oid] && clearTimeout(this.timeouts[index][oid]);
                                this.timeouts[index][oid] = setTimeout(_newValue => {
                                    this.timeouts[index][oid] = null;
                                    this.props.context.socket.setState(this.state.rxData[`oid${index}`], _newValue);
                                }, parseInt(timeout, 10), newValue);
                            } else {
                                this.props.context.socket.setState(this.state.rxData[`oid${index}`], newValue);
                            }
                        });
                    }}
                    min={min}
                    max={max}
                />,
                <div
                    key="value"
                    onClick={() => this.setState({ showControlDialog: index })}
                    style={{
                        width: 45,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                    }}
                >
                    <div style={{ whiteSpace: 'nowrap' }}>{value + (this.state.objects[index].common.unit ? ` ${this.state.objects[index].common.unit}` : '')}</div>
                    {temp ? <div style={{ fontSize: 'smaller', opacity: 0.7, whiteSpace: 'nowrap' }}>{temp + (this.state.objects[index].common.unit ? ` ${this.state.objects[index].common.unit}` : '')}</div> : null}
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
                                this.props.context.socket.setState(this.state.rxData[`oid${index}`], parseFloat(values[oid]));
                            } else if (this.state.objects[index].common.type === 'boolean') {
                                this.props.context.socket.setState(
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
                                this.props.context.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
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
                    label={this.state.rxData[`title${index}`] || Generic.getText(this.state.objects[index]?.common?.name) || ''}
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
                    style={this.customStyle}
                    onClick={() => {
                        const values = JSON.parse(JSON.stringify(this.state.values));
                        const oid = `${this.state.objects[index]._id}.val`;
                        values[oid] = this.state.inputValues[index];
                        const showSetButton = [...this.state.showSetButton];
                        showSetButton[index] = false;
                        this.setState({ values, showSetButton });
                        if (this.state.objects[index].common.type === 'number') {
                            this.props.context.socket.setState(this.state.rxData[`oid${index}`], parseFloat(values[oid]));
                        } else if (this.state.objects[index].common.type === 'boolean') {
                            this.props.context.socket.setState(
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
                            this.props.context.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
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
                    {this.state.rxData[`title${index}`] || Generic.getText(this.state.objects[index]?.common?.name) || ''}
                </InputLabel>
                <Select
                    variant="standard"
                    value={value !== undefined ? value : ''}
                    onChange={event => {
                        const values = JSON.parse(JSON.stringify(this.state.values));
                        const oid = `${this.state.objects[index]._id}.val`;
                        values[oid] = event.target.value;
                        this.setState({ values });
                        this.props.context.socket.setState(this.state.rxData[`oid${index}`], values[oid]);
                    }}
                >
                    {states.map(state => <MenuItem key={state.value} value={state.value}>{state.label}</MenuItem>)}
                </Select>
            </FormControl>;
        }

        if (this.state.objects[index].common.type === 'number') {
            if (this.state.objects[index].widgetType === 'blinds') {
                const options = this.getMinMaxPosition(1, index);
                value = parseFloat(value);
                value = ((value - options.min) / (options.max - options.min)) * 100;
            }

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
        if (this.state.objects[index].common.type === 'boolean' ||
            this.state.objects[index].common.type === 'number' ||
            value === 0 ||
            value === 1 ||
            value === '0' ||
            value === '1' ||
            value === true ||
            value === 'true' ||
            value === false ||
            value === 'false'
        ) {
            if (value === true || value === 'true' || value === 1 || value === '1' || value === 'on' || value === 'ON' || value === 'On' || value === 'ein' || value === 'EIN' || value === 'Ein' || value === 'an' || value === 'AN' || value === 'An') {
                val = true;
            }
            const colorInactive = this.state.rxData[`infoInactiveColor${index}`] || this.state.rxData[`color${index}`];
            if (val) {
                const colorActive = this.state.rxData[`infoActiveColor${index}`] || this.state.rxData[`colorEnabled${index}`];
                const diffColors = colorActive && colorInactive && colorActive !== colorInactive;
                icon = this.state.rxData[`infoActiveIcon${index}`] || this.state.rxData[`infoActiveImage${index}`];
                if (!icon && diffColors) {
                    icon = this.state.rxData[`infoInactiveIcon${index}`] || this.state.rxData[`infoInactiveImage${index}`];
                }

                text = this.state.rxData[`infoActiveText${index}`];
                if (!text && diffColors) {
                    text = this.state.rxData[`infoInactiveText${index}`];
                }
                color = colorActive || colorInactive;
            } else {
                icon = this.state.rxData[`infoInactiveIcon${index}`] || this.state.rxData[`infoInactiveImage${index}`];
                text = this.state.rxData[`infoInactiveText${index}`];
                color = colorInactive;
            }
        }

        if (this.state.objects[index].widgetType === 'blinds') {
            let height = 40; // take 10° for opened slash
            const width = 40;
            height -= 0.12 * width;
            text = <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                }}
            >
                <span>
                    {value}
                    %
                </span>
                {this.renderWindows({ height, width }, index)}
            </div>;
        }

        let staticElem;
        if (text) {
            staticElem = <span style={{ color }}>{text}</span>;
        } else if (icon) {
            staticElem = <Icon src={icon} style={{ width: 24, height: 24, color }} />;
        } else {
            staticElem = <span style={{ color }}>{value + (this.state.objects[index].common.unit ? ` ${this.state.objects[index].common.unit}` : '')}</span>;
        }

        // todo: history for booleans
        if (this._refs[index] && this.state.objects[index].common.type === 'number') {
            setTimeout(() => this.checkChartWidth(), 50);
            return <div
                style={{
                    flexGrow: 1,
                    textAlign: 'right',
                    cursor: 'pointer',
                }}
                ref={this._refs[index]}
                onClick={() => this.setState({ showControlDialog: index })}
            >
                {this.drawChart(index)}
                {staticElem}
            </div>;
        }

        return <div className={this.props.classes.infoData}>
            {staticElem}
        </div>;
    }

    checkChartWidth() {
        Object.keys(this._refs).forEach(i => {
            if (this._refs[i] && this._refs[i].current) {
                const width = this._refs[i].current.offsetWidth;
                const height = this._refs[i].current.offsetHeight;
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
                theme={this.props.context.themeType === 'dark' ? 'dark' : ''}
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

            if (this._refs[index]) {
                this._refs[index] = null;
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
        if (custom[this.props.context.systemConfig.common.defaultHistory]) {
            const alive = await this.props.context.socket.getState(`system.adapter.${this.props.context.systemConfig.common.defaultHistory}.alive`);
            if (alive?.val) {
                historyInstance = this.props.context.systemConfig.common.defaultHistory;
            }
        }

        if (!historyInstance) {
            // find the first live history instance
            historyInstance = Object.keys(custom).find(async instance => {
                if (instance === this.props.context.systemConfig.common.defaultHistory) {
                    return false;
                }
                const adapter = instance.split('.')[0];
                if (HISTORY.includes(adapter)) {
                    const alive = await this.props.context.socket.getState(`system.adapter.${instance}.alive`);
                    if (alive?.val) {
                        return true;
                    }
                }
                return false;
            });
        }

        if (historyInstance) {
            this._refs[index] = this._refs[index] || React.createRef();

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
                this.props.context.socket.getHistory(this.state.objects[_index]._id, {
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
                            let min = (result[0] && result[0].val) || 0;
                            let max = (result[0] && result[0].val) || 0;
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
                                    color: this.props.context.theme.palette.primary.main,
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
                                        if (this.props.context.systemConfig.common.isFloatComma) {
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
                                } else if (this.state.objects[_index].common.type === 'number' && this.state.objects[_index].common.states) {
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
                                    } else if (this.state.objects[_index].common.unit === '%') {
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
                                        if (value !== null && this.props.context.systemConfig.common.isFloatComma) {
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
                            if (this._refs[_index] &&
                                this._refs[_index].current &&
                                this._refs[_index].current.offsetWidth &&
                                (this.state.chartWidth[_index] !== this._refs[_index].current.offsetWidth ||
                                this.state.chartHeight[_index] !== this._refs[_index].current.offsetHeight)
                            ) {
                                newState.chartWidth = { ...this.state.chartWidth };
                                newState.chartHeight = { ...this.state.chartHeight };
                                newState.chartWidth[_index] = this._refs[_index].current.offsetWidth;
                                newState.chartHeight[_index] = this._refs[_index].current.offsetHeight;
                            }
                            this.setState(newState);
                        }
                    });
            })(indexesToUpdate[i]);
        }
    }

    renderButton(index, icon) {
        if (typeof this.state.objects[index] === 'string') {
            return this.renderWidgetInWidget(index, true);
        }

        let value;
        let secondary = null;
        const style = {};

        if (this.state.objects[index].widgetType !== 'rgb') {
            value = this.state.values[`${this.state.objects[index]._id}.val`];
            if (this.state.objects[index].common?.type === 'number' || this.state.objects[index].common?.states) {
                if (this.state.objects[index].common.states && this.state.objects[index].common.states[value] !== undefined) {
                    value = this.state.objects[index].common.states[value];
                } else {
                    if (this.state.objects[index].widgetType === 'blinds') {
                        const options = this.getMinMaxPosition(1, index);
                        value = parseFloat(value);
                        value = ((value - options.min) / (options.max - options.min)) * 100;
                    }

                    value = this.formatValue(value);
                }
            }
        }

        if (this.state.objects[index].widgetType === 'info') {
            this.checkHistory(index)
                .catch(e => console.error(`Cannot read history: ${e}`));
        } else if (this.state.objects[index].widgetType === 'blinds') {
            let height = 40; // take 10° for opened slash
            const width = 40;
            height -= 0.12 * width;
            icon = this.renderWindows({ height, width }, index);
        } else if (this.state.objects[index].widgetType === 'rgb') {
            let switchState = null;
            if (this.state.secondaryObjects[index].switch) {
                switchState = this.getPropertyValue(`switch${index}`);
            }

            style.backgroundColor = switchState === null || switchState ? this.rgbGetColor(index) :
                (this.props.context.themeType === 'dark' ? '#111' : '#eee');
            style.color = Utils.getInvertedColor(style.backgroundColor, this.props.context.themeType);

            icon = <ColorLens
                style={{
                    color: switchState === null || switchState ? undefined : this.rgbGetColor(index),
                }}
            />;
        } else if (this.state.objects[index].widgetType === 'thermostat') {
            const actualObj = this.state.secondaryObjects[index]?.actual;
            if (actualObj) {
                const actualTemp = this.state.values[`${actualObj._id}.val`];
                if (actualTemp || actualTemp === 0) {
                    secondary = <div className={this.props.classes.secondaryValueDiv}>
                        /
                        <span className={this.props.classes.secondaryValue}>
                            {this.formatValue(actualTemp, 1)}
                            {this.state.rxData[`unit${index}`] || actualObj.common?.unit || ''}
                        </span>
                    </div>;
                }
            }
        } else if (this.state.objects[index].widgetType === 'vacuum') {
            const status = this.vacuumGetValue(index, 'status');
            const statusColor = vacuumGetStatusColor(status);

            icon = <VacuumCleanerIcon style={{ color: statusColor, width: '100%', height: '100%' }} />;
            value = <span style={{ color: statusColor }}>{Generic.t(status).replace('vis_2_widgets_material_', '')}</span>;
        }

        let buttonWidth;
        let buttonHeight;
        if (!this.state.rxData.orientation || this.state.rxData.orientation === 'h') {
            buttonWidth = this.state.rxData[`width${index}`] || this.state.rxData.buttonsWidth || 120;
        } else if (this.state.rxData.orientation === 'v') {
            buttonHeight = this.state.rxData[`height${index}`] || this.state.rxData.buttonsHeight || 80;
        } else if (this.state.rxData.orientation === 'f') {
            buttonWidth = this.state.rxData[`width${index}`] || this.state.rxData.buttonsWidth || 120;
            buttonHeight = this.state.rxData[`height${index}`] || this.state.rxData.buttonsHeight || 80;
        }

        if (this.state.objects[index].widgetType === 'lock') {
            return this.lockRenderLine(index, buttonWidth, buttonHeight);
        }

        return <div
            key={index}
            className={this.props.classes.buttonDiv}
            style={{
                width: buttonWidth || undefined,
                height: buttonHeight || undefined,
                border: this.state.selectedOne ? '1px dashed gray' : 'none',
                boxSizing: 'border-box',
            }}
        >
            <Button
                onClick={() => this.changeSwitch(index)}
                color={!this.state.objects[index].common?.states && this.isOn(index) ? 'primary' : 'grey'}
                style={style}
                className={Utils.clsx(this.props.classes.button, !this.isOn(index) && this.props.classes.buttonInactive)}
                disabled={this.state.objects[index].widgetType === 'info' && (!this.history[index] || this.state.rxData[`hideChart${index}`])}
            >
                {icon ? <div className={this.props.classes.iconButton}>{icon}</div> : null}
                <div className={this.props.classes.text} style={this.customStyle}>
                    {this.state.rxData[`title${index}`] || Generic.getText(this.state.objects[index].common?.name) || ''}
                </div>
                {(value !== undefined && value !== null) || secondary ?
                    <div className={this.props.classes.value}>
                        <div>{value}</div>
                        {this.state.rxData[`unit${index}`] || this.state.objects[index].common?.unit || ''}
                        {secondary}
                    </div> : null}
            </Button>
        </div>;
    }

    lockRenderUnlockDialog() {
        if (this.state.dialogPin === null) {
            return null;
        }
        const index = this.state.dialogPin.index;
        const pincode = this.lockGetPinCode(index);
        const pincodeReturnButton = this.state.rxData[`pincodeReturnButton${index}`] === 'backspace' ? 'backspace' : 'submit';

        return <Dialog open={!0} onClose={() => this.setState({ dialogPin: null })}>
            <DialogTitle>{Generic.t('enter_pin')}</DialogTitle>
            <DialogContent>
                <div className={this.props.classes.lockPinInput}>
                    <TextField
                        variant="outlined"
                        fullWidth
                        type={this.state.invalidPin ? 'text' : 'password'}
                        inputProps={{
                            readOnly: true,
                            style: {
                                textAlign: 'center',
                                color: this.state.invalidPin ? '#ff3e3e' : 'inherit',
                            },
                        }}
                        value={this.state.invalidPin ? Generic.t('invalid_pin') : this.state.lockPinInput}
                    />
                </div>
                <div className={this.props.classes.lockPinGrid}>
                    {
                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 'R', 0,
                            pincodeReturnButton].map(button => {
                            let buttonTitle = button;
                            if (button === 'backspace') {
                                buttonTitle = <Backspace />;
                            } else if (button === 'submit') {
                                buttonTitle = <Check />;
                            }
                            return <Button
                                variant="outlined"
                                key={button}
                                title={button === 'R' ?
                                    (this.state.lockPinInput ? Generic.t('reset') : Generic.t('close')) :
                                    (button === pincodeReturnButton ? 'enter' : '')}
                                onClick={() => {
                                    if (button === 'submit') {
                                        if (this.state.lockPinInput === pincode) {
                                            if (this.state.dialogPin.oid === 'open') {
                                                this.props.context.socket.setState(this.state.rxData[`open${index}`], true);
                                            } else {
                                                this.props.context.socket.setState(this.state.rxData[`oid${index}`], true);
                                            }
                                            this.setState({ dialogPin: null });
                                        } else {
                                            this.setState({ lockPinInput: '', invalidPin: true });
                                            setTimeout(() => this.setState({ invalidPin: false }), 500);
                                        }
                                    } else if (button === 'backspace') {
                                        this.setState({ lockPinInput: this.state.lockPinInput.slice(0, -1) });
                                    } else if (button === 'R') {
                                        if (!this.state.lockPinInput) {
                                            this.setState({ dialogPin: null });
                                        } else {
                                            this.setState({ lockPinInput: '' });
                                        }
                                    } else {
                                        const lockPinInput = this.state.lockPinInput + button;
                                        this.setState({ lockPinInput });
                                        if (pincodeReturnButton === 'backspace' && lockPinInput === pincode) {
                                            if (this.state.dialogPin.oid === 'open') {
                                                this.props.context.socket.setState(this.state.rxData[`open${index}`], true);
                                            } else {
                                                this.props.context.socket.setState(this.state.rxData[`oid${index}`], true);
                                            }
                                            this.setState({ dialogPin: null });
                                        }
                                    }
                                }}
                            >
                                {buttonTitle === 'R' ? (this.state.lockPinInput ? 'R' : 'x') : buttonTitle}
                            </Button>;
                        })
                    }
                </div>
            </DialogContent>
        </Dialog>;
    }

    lockGetPinCode(index) {
        return this.state.rxData[`oid-pincode${index}`] ?
            this.getPropertyValue(`oid-pincode${index}`) :
            this.state.rxData[`pincode${index}`];
    }

    lockRenderConfirmDialog() {
        if (!this.state.lockConfirmDialog) {
            return null;
        }
        const index = this.state.lockConfirmDialog.index;
        return <Dialog
            open={!0}
            onClose={() => this.setState({ lockConfirmDialog: null })}
        >
            <DialogContent>
                {Generic.t('please_confirm')}
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        this.setState({ lockConfirmDialog: null });
                        if (this.state.lockConfirmDialog.oid === 'open') {
                            this.props.context.socket.setState(this.state.rxData[`open${index}`], true);
                        } else {
                            this.props.context.socket.setState(this.state.rxData[`oid${index}`], true);
                        }
                    }}
                    startIcon={this.state.lockConfirmDialog.oid === 'open' ? <DoorOpenedIcon /> : <LockOpenedIcon />}
                >
                    {Generic.t('Open')}
                </Button>
                <Button
                    variant="contained"
                    color="grey"
                    autoFocus
                    onClick={() => this.setState({ lockConfirmDialog: null })}
                    startIcon={<Cancel />}
                >
                    {Generic.t('Cancel')}
                </Button>
            </DialogActions>
        </Dialog>;
    }

    lockRenderLine(index, buttonWidth, buttonHeight) {
        let size = 30;
        if (buttonWidth) {
            size = Math.min((buttonWidth - 32) / 2, buttonHeight - 16);
        }

        const doorOpened = this.state.rxData[`sensor${index}`] && this.getPropertyValue(`sensor${index}`);
        const lockOpened = this.getPropertyValue(`oid${index}`);
        const working = this.state.rxData[`working${index}`] && this.getPropertyValue(`working${index}`);

        const content = <div style={{ display: 'flex' }}>
            {this.state.rxData[`sensor${index}`] || this.state.rxData[`open${index}`] ?
                <IconButton
                    key="door"
                    disabled={!this.state.rxData[`open${index}`]}
                    title={this.state.rxData[`open${index}`] ? Generic.t('open_door') : null}
                    onClick={() => {
                        if (this.lockGetPinCode(index)) {
                            this.setState({ dialogPin: { oid: 'open', index }, lockPinInput: '' });
                        } else if (this.state.rxData[`doNotConfirm${index}`]) {
                            this.props.context.socket.setState(this.state.rxData[`open${index}`], true);
                        } else {
                            this.setState({ lockConfirmDialog: { oid: 'open', index } });
                        }
                    }}
                >
                    <DoorAnimation open={doorOpened} size={size} />
                </IconButton> : null}
            {this.state.rxData[`oid${index}`] ?
                <IconButton
                    key="lock"
                    title={lockOpened ? Generic.t('close_lock') : Generic.t('open_lock')}
                    onClick={() => {
                        if (!lockOpened && this.lockGetPinCode(index)) {
                            this.setState({ dialogPin: { oid: 'oid', index }, lockPinInput: '' });
                        } else if (lockOpened || this.state.rxData[`doNotConfirm${index}`]) {
                            this.props.context.socket.setState(this.state.rxData[`oid${index}`], !this.getPropertyValue(`oid${index}`));
                        } else {
                            this.setState({ lockConfirmDialog: { oid: 'oid', index } });
                        }
                    }}
                >
                    {working ? <CircularProgress className={this.props.classes.workingIcon} size={size} /> : null}
                    {this.state.rxData[`noLockAnimation${index}`] ? (lockOpened ?
                        <LockOpenedIcon
                            style={{ width: size, height: size }}
                            className={this.props.classes.lockSvgIcon}
                            sx={theme => ({ color: theme.palette.primary.main })}
                        /> :
                        <LockClosedIcon
                            style={{ width: size, height: size }}
                            className={this.props.classes.lockSvgIcon}
                        />) :
                        <LockAnimation
                            style={{
                                marginTop: -4,
                            }}
                            open={lockOpened}
                            size={size}
                            color={this.state.rxData[`lockColor${index}`]}
                        />}
                </IconButton> : null}
        </div>;

        if (!buttonWidth) {
            return content;
        }

        const title = this.state.rxData[`title${index}`] || Generic.getText(this.state.objects[index].common.name) || '';
        if (!title) {
            return content;
        }
        return <div
            key={index}
            className={this.props.classes.buttonDiv}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: buttonWidth || undefined,
                height: buttonHeight || undefined,
                border: this.state.selectedOne ? '1px dashed gray' : 'none',
                boxSizing: 'border-box',
            }}
        >
            {content}
            <div>
                {title}
            </div>
        </div>;
    }

    thermostatObjectIDs(index, ids) {
        const _ids = ['oid', 'actual', 'boost', 'party'];
        _ids.forEach(id => {
            const _id = id + index;
            if (this.state.rxData[_id] && this.state.rxData[_id] !== 'nothing_selected') {
                ids.push(this.state.rxData[_id]);
            }
        });
    }

    thermostatReadObjects(index, _objects, objects, secondaryObjects) {
        let id = this.state.rxData[`oid${index}`];

        if (_objects[id]) {
            const tempObj = _objects[id];
            objects[index] = {
                widgetType: 'thermostat',
                common: tempObj.common,
                _id: id,
            };
            objects[index].common.min = tempObj?.common?.min === undefined ? 12 : tempObj.common.min;
            objects[index].common.max = tempObj?.common?.max === undefined ? 30 : tempObj.common.max;
        } else {
            objects[index] = {
                widgetType: 'thermostat',
            };
        }

        id = this.state.rxData[`actual${index}`];
        secondaryObjects[index] = {};
        if (_objects[id]) {
            secondaryObjects[index].actual = { common: _objects[id].common, _id: id };
        } else {
            secondaryObjects[index] = null;
        }
    }

    thermIsWithPowerButton(index) {
        return this.state.rxData[`switch${index}`] && this.state.rxData[`switch${index}`] !== 'nothing_selected';
    }

    thermIsWithModeButtons(index) {
        return (this.state.rxData[`party${index}`] || this.state.rxData[`boost${index}`]) &&
            // if no power button or power is on
            (!this.state.rxData[`switch${index}`] || this.state.values[`${this.state.rxData[`switch${index}`]}.val`]);
    }

    thermostatRenderDialog(index) {
        const setObj = this.state.objects[index];
        let tempValue = null;
        if (setObj?._id) {
            tempValue = this.state.values[`${setObj._id}.val`];
            if (tempValue === undefined) {
                tempValue = null;
            }
            if (tempValue !== null && tempValue < setObj.common.min) {
                tempValue = setObj.common.min;
            } else if (tempValue !== null && tempValue > setObj.common.max) {
                tempValue = setObj.common.max;
            }

            if (tempValue === null) {
                tempValue = (setObj.common.max - setObj.common.min) / 2 + setObj.common.min;
            }
        }

        const actualObj = this.state.secondaryObjects[index]?.actual;
        let actualTemp = null;
        if (actualObj) {
            actualTemp = this.state.values[`${actualObj._id}.val`];
            if (actualTemp === undefined) {
                actualTemp = null;
            }
        }

        let size = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth;
        if (size > 200) {
            size = 200;
        }
        let handleSize = Math.round(size / 25);
        if (handleSize < 8) {
            handleSize = 8;
        }

        actualTemp = actualTemp !== null ? this.formatValue(actualTemp, 1) : null;

        const arcColor = this.props.customSettings?.viewStyle?.overrides?.palette?.primary?.main || this.props.context.theme?.palette.primary.main || '#448aff';

        const modesButton = [];
        if (this.thermIsWithModeButtons(index)) {
            if (this.state.rxData[`party${index}`]) {
                let currentValueStr = this.state.values[`${this.state.rxData[`party${index}`]}.val`];
                if (currentValueStr === null || currentValueStr === undefined) {
                    currentValueStr = false;
                } else {
                    currentValueStr = currentValueStr === '1' || currentValueStr === 'true' || currentValueStr === true;
                }
                modesButton.push(<Button
                    key="party"
                    color={currentValueStr ? 'primary' : 'grey'}
                    onClick={() => {
                        let _currentValueStr = this.state.values[`${this.state.rxData[`party${index}`]}.val`];
                        if (_currentValueStr === null || _currentValueStr === undefined) {
                            _currentValueStr = false;
                        } else {
                            _currentValueStr = _currentValueStr === '1' || _currentValueStr === 'true' || _currentValueStr === true;
                        }
                        const values = JSON.parse(JSON.stringify(this.state.values));
                        values[`${this.state.rxData[`party${index}`]}.val`] = !_currentValueStr;
                        this.setState(values);
                        this.props.context.socket.setState(this.state.rxData[`party${index}`], !_currentValueStr);
                    }}
                    startIcon={<CelebrationIcon />}
                >
                    {Generic.t('Party')}
                </Button>);
            }
            if (this.state.rxData[`boost${index}`]) {
                let currentValueStr = this.state.values[`${this.state.rxData[`boost${index}`]}.val`];
                if (currentValueStr === null || currentValueStr === undefined) {
                    currentValueStr = false;
                } else {
                    currentValueStr = currentValueStr === '1' || currentValueStr === 'true' || currentValueStr === true;
                }
                modesButton.push(<Button
                    key="boost"
                    color={currentValueStr ? 'primary' : 'grey'}
                    onClick={() => {
                        let _currentValueStr = this.state.values[`${this.state.rxData[`boost${index}`]}.val`];
                        if (_currentValueStr === null || _currentValueStr === undefined) {
                            _currentValueStr = false;
                        } else {
                            _currentValueStr = _currentValueStr === '1' || _currentValueStr === 'true' || _currentValueStr === true;
                        }
                        const values = JSON.parse(JSON.stringify(this.state.values));
                        values[`${this.state.rxData[`boost${index}`]}.val`] = !_currentValueStr;
                        this.setState(values);
                        this.props.context.socket.setState(this.state.rxData[`boost${index}`], !_currentValueStr);
                    }}
                    startIcon={<BoostIcon />}
                >
                    {Generic.t('Boost')}
                </Button>);
            }
        }
        if (this.thermIsWithPowerButton(index)) {
            modesButton.push(<Tooltip key="power" title={Generic.t('power').replace('vis_2_widgets_material_', '')}>
                <IconButton
                    color={this.state.values[`${this.state.rxData[`switch${index}`]}.val`] ? 'primary' : 'grey'}
                    onClick={() => {
                        const values = JSON.parse(JSON.stringify(this.state.values));
                        const id = `${this.state.rxData[`switch${index}`]}.val`;
                        values[id] = !values[id];
                        this.setState(values);
                        this.props.context.socket.setState(this.state.rxData[`switch${index}`], values[id]);
                    }}
                >
                    <PowerSettingsNewIcon />
                </IconButton>
            </Tooltip>);
        }

        return <div
            className={this.props.classes.thermostatCircleDiv}
            style={{ height: '100%' }}
        >
            {/* if no header, draw button here */}
            {size && setObj ?
                <CircularSliderWithChildren
                    minValue={setObj.common.min}
                    maxValue={setObj.common.max}
                    size={size}
                    arcColor={arcColor}
                    arcBackgroundColor={this.props.context.themeType === 'dark' ? '#DDD' : '#222'}
                    startAngle={40}
                    step={0.5}
                    handleSize={handleSize}
                    endAngle={320}
                    handle1={{
                        value: tempValue,
                        onChange: value => {
                            const values = JSON.parse(JSON.stringify(this.state.values));
                            if (this.state.rxData[`step${index}`] === '0.5') {
                                values[`${setObj._id}.val`] = Math.round(value * 2) / 2;
                            } else {
                                values[`${setObj._id}.val`] = Math.round(value);
                            }
                            this.setState({ values });
                        },
                    }}
                    onControlFinished={() =>
                        this.props.context.socket.setState(setObj._id, this.state.values[`${setObj._id}.val`])}
                >
                    {tempValue !== null ? <Tooltip title={Generic.t('desired_temperature')}>
                        <div
                            className={this.props.classes.thermostatDesiredTemp}
                            style={{ fontSize: Math.round(size / 6), ...this.customStyle }}
                        >
                            <ThermostatIcon style={{ width: size / 8, height: size / 8 }} />
                            <div style={{ display: 'flex', alignItems: 'top', ...this.customStyle }}>
                                {this.formatValue(tempValue)}
                                <span style={{ fontSize: Math.round(size / 12), fontWeight: 'normal' }}>{this.state.rxData[`unit${index}`] || setObj.common?.unit}</span>
                            </div>
                        </div>
                    </Tooltip> : null}
                    {actualTemp !== null ? <Tooltip title={Generic.t('actual_temperature')}>
                        <div
                            style={{ fontSize: Math.round((size * 0.6) / 6), opacity: 0.7, ...this.customStyle }}
                            key={`${actualTemp}valText`}
                            className={this.props.context.themeType === 'dark' ? this.props.classes.thermostatNewValueDark : this.props.classes.thermostatNewValueLight}
                        >
                            {actualTemp}
                            {this.state.rxData[`unit${index}`] || actualObj?.common?.unit}
                        </div>
                    </Tooltip> : null}
                </CircularSliderWithChildren>
                : null}
            <div
                className={this.props.classes.thermostatButtonsDiv}
                style={{ bottom: 8 }}
            >
                {modesButton}
            </div>
        </div>;
    }

    rgbGetIdMin = (index, id) => {
        if (id === 'color_temperature') {
            return this.state.rxData[`ct_min${index}`] || this.state.secondaryObjects[index][id]?.common?.min || 0;
        }
        return this.state.secondaryObjects[index][id]?.common?.min || 0;
    };

    rgbGetIdMax = (index, id) => {
        if (id === 'color_temperature') {
            return this.state.rxData[`ct_max${index}`] || this.state.secondaryObjects[index][id]?.common?.max || 0;
        }
        return this.state.secondaryObjects[index][id]?.common?.min || 0;
    };

    rgbSetId = (index, id, value) => {
        if (this.state.secondaryObjects[index][id]) {
            this.timeouts = this.timeouts || {};
            this.timeouts[index] = this.timeouts[index] || {};
            this.timeouts[index][id] && clearTimeout(this.timeouts[index][id]);

            // control switch directly without timeout
            if (id === 'switch') {
                this.props.context.socket.setState(this.state.rxData[`switch${index}`], value);
            } else {
                const values = { ...this.state.values, [`${this.state.rxData[id + index]}.val`]: value };
                this.setState({ values });

                this.timeouts[index][id] = setTimeout(() => {
                    this.timeouts[index][id] = null;
                    this.props.context.socket.setState(this.state.rxData[id + index], value);
                }, parseInt(this.state.rxData[`timeout${index}`], 10) || 200);
            }
        }
    };

    rgbObjectIDs(index, ids) {
        RGB_NAMES.forEach(name => {
            if (this.state.rxData[name + index] && this.state.rxData[name + index] !== 'nothing_selected') {
                ids.push(this.state.rxData[name + index]);
            }
        });
    }

    rgbReadObjects(index, _objects, objects, secondaryObjects) {
        const _rgbObjects = {};

        RGB_NAMES.forEach(name => {
            const oid = this.state.rxData[name + index];
            if (oid) {
                const object = _objects[oid];
                if (object) {
                    _rgbObjects[name] = object;
                }
            }
        });

        secondaryObjects[index] = _rgbObjects;

        if (_rgbObjects.color_temperature) {
            const colors = [];
            const minCt = parseInt(this.state.rxData[`ct_min${index}`] || _rgbObjects.color_temperature?.common?.min, 10) || 2700;
            const maxCt = parseInt(this.state.rxData[`ct_max${index}`] || _rgbObjects.color_temperature?.common?.max, 10) || 6000;
            const step = (maxCt - minCt) / 20;
            for (let i = minCt; i <= maxCt; i += step) {
                colors.push(colorTemperatureToRGB(i));
            }
            _rgbObjects.color_temperature.colors = colors;
        }

        objects[index] = {
            widgetType: 'rgb',
            common: _rgbObjects.oid?.common,
        };
    }

    rgbDestroy() {
        if (this.timeouts) {
            for (const index in this.timeouts) {
                for (const k in this.timeouts[index]) {
                    if (this.timeouts[index][k]) {
                        clearTimeout(this.timeouts[index][k]);
                        this.timeouts[index][k] = null;
                    }
                }
            }
        }
    }

    rgbIsOnlyHue = index => this.state.rxData[`rgbType${index}`] === 'hue/sat/lum' && (!this.state.secondaryObjects[index].saturation || !this.state.secondaryObjects[index].luminance);

    rgbGetWheelColor = index => {
        let result = {
            h: undefined,
            s: undefined,
            v: undefined,
            a: undefined,
        };

        if (this.state.rxData[`rgbType${index}`] === 'hue/sat/lum') {
            result = hslaToHsva({
                h: this.getPropertyValue(`hue${index}`),
                s: this.rgbIsOnlyHue(index) ? 100 : this.getPropertyValue(`saturation${index}`),
                l: this.rgbIsOnlyHue(index) ? 50 : this.getPropertyValue(`luminance${index}`),
            });
        } else if (this.state.rxData[`rgbType${index}`] === 'r/g/b' || this.state.rxData[`rgbType${index}`] === 'r/g/b/w') {
            result = rgbaToHsva({
                r: this.getPropertyValue(`red${index}`),
                g: this.getPropertyValue(`green${index}`),
                b: this.getPropertyValue(`blue${index}`),
            });
        } else if (this.state.rxData[`rgbType${index}`] === 'rgb') {
            try {
                const val = this.getPropertyValue(`oid${index}`) || '';
                if (val && val.length >= 4) {
                    result = hexToHsva(val);
                } else {
                    result = hexToHsva('#000000');
                }
            } catch (e) {
                console.error(e);
            }
        } else if (this.state.rxData[`rgbType${index}`] === 'rgbw') {
            try {
                const val = this.getPropertyValue(`oid${index}`) || '';
                if (val && val.length >= 4) {
                    result = hexToHsva(val);
                } else {
                    result = hexToHsva('#000000');
                }
            } catch (e) {
                console.error(e);
            }
        }
        return result;
    };

    rgbSetWheelColor = (index, color) => {
        if (this.state.rxData[`rgbType${index}`] === 'hue/sat/lum') {
            color = hsvaToHsla(color);
            this.rgbSetId(index, 'hue', color.h);
            if (!this.rgbIsOnlyHue(index)) {
                this.rgbSetId(index, 'saturation', color.s);
                this.rgbSetId(index, 'luminance', color.l);
            }
        } else if (this.state.rxData[`rgbType${index}`] === 'r/g/b' || this.state.rxData[`rgbType${index}`] === 'r/g/b/w') {
            color = hsvaToRgba(color);
            this.rgbSetId(index, 'red', color.r);
            this.rgbSetId(index, 'green', color.g);
            this.rgbSetId(index, 'blue', color.b);
        } else if (this.state.rxData[`rgbType${index}`] === 'rgb') {
            this.rgbSetId(index, 'oid', hsvaToHex(color));
        } else if (this.state.rxData[`rgbType${index}`] === 'rgbw') {
            if (this.state.secondaryObjects[index].white) {
                this.rgbSetId(index, 'oid', hsvaToHex(color));
            } else {
                let val = this.getPropertyValue(`oid${index}`) || '#00000000';
                val = hsvaToHex(color) + val.substring(7);
                this.rgbSetId(index, 'oid', val);
            }
        }
    };

    rgbGetWhite = index => {
        if (this.state.rxData[`rgbType${index}`] === 'r/g/b/w') {
            return this.getPropertyValue(`white${index}`);
        }
        if (this.state.rxData[`rgbType${index}`] === 'rgbw') {
            if (this.state.secondaryObjects[index].white) {
                return this.getPropertyValue(`white${index}`);
            }

            const val = this.getPropertyValue(`oid${index}`)?.substring(7);
            return parseInt(val, 16);
        }
        return 0;
    };

    rgbSetWhite = (index, color) => {
        if (this.state.rxData[`rgbType${index}`] === 'r/g/b/w') {
            this.rgbSetId(index, 'white', color);
        } else if (this.state.rxData[`rgbType${index}`] === 'rgbw') {
            if (this.state.secondaryObjects[index].white) {
                this.rgbSetId(index, 'white', color);
            } else {
                let val = this.getPropertyValue(`oid${index}`) || '#00000000';
                val = val.substring(0, 7) + color.toString(16).padStart(2, '0');
                this.rgbSetId(index, 'oid', val);
            }
        }
    };

    rgbIsRgb = index => {
        if ((this.state.rxData[`rgbType${index}`] === 'rgb' || this.state.rxData[`rgbType${index}`] === 'rgbw')
            && this.state.rxData[`oid${index}`]) {
            return true;
        }

        return (this.state.rxData[`rgbType${index}`] === 'r/g/b' || this.state.rxData[`rgbType${index}`] === 'r/g/b/w')
            && this.state.secondaryObjects[index].red
            && this.state.secondaryObjects[index].green
            && this.state.secondaryObjects[index].blue;
    };

    rgbIsWhite = index => (this.state.rxData[`rgbType${index}`] === 'rgbw' && this.state.rxData[`oid${index}`])
        || (this.state.rxData[`rgbType${index}`] === 'r/g/b/w' && this.state.secondaryObjects[index].white);

    rgbIsHSL = index => this.state.rxData[`rgbType${index}`] === 'hue/sat/lum' && this.state.secondaryObjects[index].hue;

    rgbRenderSwitch(index) {
        return this.state.secondaryObjects[index].switch && <div
            className={this.props.classes.rgbSliderContainer}
            style={{
                justifyContent: 'center',
            }}
        >
            {Generic.t('Off')}
            <Switch
                checked={this.getPropertyValue(`switch${index}`) || false}
                onChange={e => this.rgbSetId(index, 'switch', e.target.checked)}
            />
            {Generic.t('On')}
        </div>;
    }

    rgbRenderBrightness(index) {
        return this.state.secondaryObjects[index].brightness && <div className={this.props.classes.rgbSliderContainer}>
            <Tooltip title={Generic.t('Brightness')}>
                <Brightness6 />
            </Tooltip>
            <Slider
                min={this.rgbGetIdMin(index, 'brightness') || 0}
                max={this.rgbGetIdMax(index, 'brightness') || 100}
                valueLabelDisplay="auto"
                value={this.getPropertyValue(`brightness${index}`) || 0}
                onChange={(e, value) => this.rgbSetId(index, 'brightness', value)}
            />
        </div>;
    }

    rgbRenderSketch(index) {
        return <div className={`dark ${this.props.classes.rgbWheel}`}>
            <Sketch
                color={this.rgbGetWheelColor(index)}
                disableAlpha
                onChange={color => this.rgbSetWheelColor(index, color.hsva)}
            />
        </div>;
    }

    rgbRenderWheelTypeSwitch(index, isWheelVisible, twoPanels) {
        if (!isWheelVisible) {
            return null;
        }
        return !this.rgbIsOnlyHue(index) && <div style={{ textAlign: twoPanels ? 'right' : undefined }}>
            <Tooltip title={Generic.t('Switch color picker')}>
                <IconButton
                    onClick={() => {
                        const sketch = JSON.parse(JSON.stringify(this.state.sketch));
                        sketch[index] = !sketch[index];
                        this.setState({ sketch });
                    }}
                >
                    <ColorLens />
                </IconButton>
            </Tooltip>
        </div>;
    }

    rgbRenderBrightnessSlider(index, isWheelVisible) {
        if (!isWheelVisible || this.state.sketch[index]) {
            return null;
        }
        return !this.rgbIsOnlyHue(index) && <ShadeSlider
            hsva={this.rgbGetWheelColor(index)}
            onChange={shade =>
                this.rgbSetWheelColor(index, { ...this.rgbGetWheelColor(index), ...shade })}
        />;
    }

    rgbRenderWheel(index, isWheelVisible) {
        if (!isWheelVisible) {
            return null;
        }
        return this.state.sketch[index] ? this.rgbRenderSketch(index) :  <div className={this.props.classes.rgbWheel}>
            <Wheel
                color={this.rgbGetWheelColor(index)}
                onChange={color => {
                    color = JSON.parse(JSON.stringify(color));
                    this.rgbSetWheelColor(index, color.hsva);
                }}
            />
        </div>;
    }

    rgbRenderWhite(index) {
        if (!this.rgbIsWhite(index)) {
            return null;
        }
        let min;
        let max;
        if (!this.state.secondaryObjects[index].white) {
            min = 0;
            max = 255;
        } else {
            min = this.rgbGetIdMin(index, 'white') || 0;
            max = this.rgbGetIdMax(index, 'white') || 100;
        }

        return <div className={this.props.classes.rgbSliderContainer}>
            <TbSquareLetterW style={{ width: 24, height: 24 }} />
            <Slider
                min={min}
                max={max}
                valueLabelDisplay="auto"
                value={this.rgbGetWhite(index) || 0}
                onChange={(e, value) => this.rgbSetWhite(index, value)}
            />
        </div>;
    }

    rgbRenderColorTemperature(index) {
        if (this.state.rxData[`rgbType${index}`] !== 'ct') {
            return null;
        }
        return <div className={this.props.classes.rgbSliderContainer}>
            <Tooltip title={Generic.t('Color temperature')}>
                <Thermostat />
            </Tooltip>
            <div
                className={this.props.classes.rgbSliderContainer}
                style={{
                    background:
                        `linear-gradient(to right, ${this.state.secondaryObjects[index].color_temperature.colors.map(c => `rgb(${c.red}, ${c.green}, ${c.blue})`).join(', ')})`,
                    flex: '1',
                    borderRadius: 4,
                }}
            >
                <Slider
                    valueLabelDisplay="auto"
                    min={this.rgbGetIdMin(index, 'color_temperature') || 2700}
                    max={this.rgbGetIdMax(index, 'color_temperature') || 6000}
                    value={this.getPropertyValue(`color_temperature${index}`) || 0}
                    onChange={(e, value) => this.rgbSetId(index, 'color_temperature', value)}
                />
            </div>
        </div>;
    }

    rgbRenderDialog(index) {
        const wheelVisible = this.rgbIsRgb(index) || this.rgbIsHSL(index);

        return <div className={this.props.classes.rgbDialogContainer}>
            {this.rgbRenderSwitch(index)}
            {this.rgbRenderBrightness(index)}
            {this.rgbRenderWhite(index)}
            {this.rgbRenderWheelTypeSwitch(index, wheelVisible)}
            {this.rgbRenderWheel(index, wheelVisible)}
            {this.rgbRenderBrightnessSlider(index, wheelVisible)}
            {this.rgbRenderColorTemperature(index)}
        </div>;
    }

    rgbGetColor = index => {
        if (this.state.rxData[`rgbType${index}`] === 'ct') {
            const color = colorTemperatureToRGB(this.getPropertyValue(`color_temperature${index}`));
            return rgbaToHex({
                r: color.red,
                g: color.green,
                b: color.blue,
            });
        }
        return hsvaToHex(this.rgbGetWheelColor(index));
    };

    rgbGetTextColor = index => {
        if (this.state.rxData[`rgbType${index}`] === 'ct') {
            const color = colorTemperatureToRGB(this.getPropertyValue(`color_temperature${index}`));
            return color.red + color.green + color.blue > 3 * 128 ? '#000000' : '#ffffff';
        }
        const color = hsvaToRgba(this.rgbGetWheelColor(index));
        return color.r + color.g + color.b > 3 * 128 ? '#000000' : '#ffffff';
    };

    vacuumObjectIDs(index, ids) {
        const keys = Object.keys(VACUUM_ID_ROLES);
        for (let k = 0; k < keys.length; k++) {
            const oid = this.state.rxData[`vacuum-${keys[k]}-oid${index}`];
            if (oid) {
                ids.push(oid);
            }
        }
    }

    async vacuumReadObjects(index, _objects, objects, secondaryObjects) {
        secondaryObjects[index] = {};

        objects[index] = {
            widgetType: 'vacuum',
            common: {
                name: Generic.t('vacuum'),
            },
        };

        const keys = Object.keys(VACUUM_ID_ROLES);
        // read all objects at once
        Object.values(_objects).forEach(obj => {
            const oid = keys.find(_oid => this.state.rxData[`vacuum-${_oid}-oid${index}`] === obj._id);
            if (oid) {
                secondaryObjects[index][oid] = obj;
            }
        });

        secondaryObjects[index].rooms = await this.vacuumLoadRooms();
    }

    async vacuumLoadRooms(index) {
        if (this.state.rxData[`vacuum-use-rooms${index}`]) {
            // try to detect the `rooms` object according to status OID
            // mihome-vacuum.0.info.state => mihome-vacuum.0.rooms
            if (this.state.rxData[`vacuum-status-oid${index}`]) {
                const parts = this.state.rxData[`vacuum-status-oid${index}`].split('.');
                if (parts.length === 4) {
                    parts.pop();
                    parts.pop();
                    parts.push('rooms');
                    const rooms = await this.props.context.socket.getObjectView(`${parts.join('.')}.room`, `${parts.join('.')}.room\u9999`, 'channel');
                    const result = [];
                    Object.keys(rooms).forEach(id =>
                        result.push({
                            value: `${id}.roomClean`,
                            label: Generic.getText(rooms[id].common?.name || id.split('.').pop()),
                        }));
                    result.sort((a, b) => a.label.localeCompare(b.label));
                    return result;
                }
            }
        }

        return null;
    }

    vacuumGetValue(index, id, numberValue) {
        const obj = this.vacuumGetObj(index, id);
        if (!obj) {
            return null;
        }
        const value = this.state.values[`${obj._id}.val`];
        if (!numberValue && obj.common?.states) {
            if (obj.common.states[value] !== undefined && obj.common.states[value] !== null) {
                return obj.common.states[value];
            }
        }
        return value;
    }

    vacuumGetObj(index, id) {
        if (!this.state.secondaryObjects[index]) {
            return null;
        }
        return this.state.secondaryObjects[index][id];
    }

    vacuumRenderBattery(index) {
        return this.vacuumGetObj(index, 'battery') && <div className={this.props.classes.vacuumBattery}>
            {this.vacuumGetObj(index, 'is-charging') && this.vacuumGetValue(index, 'is-charging') ? <BatteryChargingFull /> : <BatteryFull />}
            {this.vacuumGetValue(index, 'battery') || 0}
            {' '}
            {this.vacuumGetObj(index, 'battery').common?.unit}
        </div>;
    }

    vacuumRenderSpeed(index) {
        const obj = this.vacuumGetObj(index, 'fan-speed');
        if (!obj) {
            return null;
        }
        let options = null;
        options = obj.common.states;
        if (Array.isArray(options)) {
            const result = {};
            options.forEach(item => result[item] = item);
            options = result;
        }

        let value = this.vacuumGetValue(index, 'fan-speed', true);
        if (value === null || value === undefined) {
            value = '';
        }
        value = value.toString();

        return [
            <Button
                variant="standard"
                key="speed"
                className={this.props.classes.vacuumSpeedContainer}
                endIcon={<FanIcon />}
                onClick={e => {
                    e.stopPropagation();
                    this.setState({ showSpeedMenu: e.currentTarget });
                }}
            >
                {options[value] !== undefined && options[value] !== null ? Generic.t(options[value]).replace('vis_2_widgets_material_', '') : value}
            </Button>,
            this.state.showSpeedMenu ? <Menu
                open={!0}
                anchorEl={this.state.showSpeedMenu}
                key="speedMenu"
                onClose={() => this.setState({ showSpeedMenu: null })}
            >
                {Object.keys(options).map(state => <MenuItem
                    key={state}
                    value={state}
                    selected={value === state}
                    onClick={e => {
                        const _value = e.target.value;
                        this.setState({ showSpeedMenu: null }, () =>
                            this.props.context.socket.setState(this.state.rxData[`vacuum-fan-speed-oid${index}`], _value));
                    }}
                >
                    {Generic.t(options[state]).replace('vis_2_widgets_material_', '')}
                </MenuItem>)}
            </Menu> : null,
        ];
    }

    vacuumRenderRooms(index) {
        if (!this.state.secondaryObjects[index] || !this.state.secondaryObjects[index].rooms?.length) {
            return null;
        }
        return [
            <Button
                variant="outlined"
                color="grey"
                key="rooms"
                onClick={e => this.setState({ showRoomsMenu: e.currentTarget })}
            >
                {Generic.t('Room')}
            </Button>,
            this.state.showRoomsMenu ? <Menu
                onClose={() => this.setState({ showRoomsMenu: null })}
                open={!0}
                anchorEl={this.state.showRoomsMenu}
                key="roomsMenu"
            >
                {this.state.secondaryObjects[index].rooms.map(room => <MenuItem
                    key={room.value}
                    value={room.value}
                    onClick={() => {
                        // build together mihome-vacuum.0.rooms.room1.roomClean
                        const id = room.value;
                        this.setState({ showRoomsMenu: null }, () =>
                            this.props.context.socket.setState(id, true));
                    }}
                >
                    {room.label}
                </MenuItem>)}
            </Menu> : null,
        ];
    }

    vacuumRenderSensors(index) {
        const sensors = ['filter-left', 'side-brush-left', 'main-brush-left', 'sensors-left', 'cleaning-count'].filter(sensor =>
            this.vacuumGetObj(index, sensor));

        return sensors.length ? <div className={this.props.classes.vacuumSensorsContainer}>
            <div className={this.props.classes.vacuumSensors}>
                {sensors.map(sensor => {
                    const object = this.vacuumGetObj(index, sensor);

                    return <Card
                        key={sensor}
                        className={this.props.classes.vacuumSensorCard}
                    >
                        <CardContent
                            className={this.props.classes.vacuumSensorCardContent}
                            style={{ paddingBottom: 2 }}
                        >
                            <div>
                                <span className={this.props.classes.vacuumSensorBigText}>
                                    {this.vacuumGetValue(index, sensor) || 0}
                                </span>
                                {' '}
                                <span className={this.props.classes.vacuumSensorSmallText}>
                                    {object.common.unit}
                                </span>
                            </div>
                            <div>
                                <span className={this.props.classes.vacuumSensorSmallText}>
                                    {Generic.t(sensor.replaceAll('-', '_'))}
                                </span>
                            </div>
                        </CardContent>
                    </Card>;
                })}
            </div>
        </div> : null;
    }

    vacuumRenderButtons(index, withDialog) {
        let statusColor;
        const statusObj = this.vacuumGetObj(index, 'status');
        let status;
        let smallStatus;
        if (statusObj) {
            status = this.vacuumGetValue(index, 'status');
            statusColor = vacuumGetStatusColor(status);

            if (typeof status === 'boolean') {
                smallStatus = status ? 'cleaning' : 'pause';
                status = status ? 'Cleaning' : 'Pause';
            } else {
                if (status === null || status === undefined) {
                    status = '';
                }
                status = status.toString();
                smallStatus = status.toLowerCase();
            }
        }

        return <div
            className={this.props.classes.vacuumButtons}
            style={withDialog ? { cursor: 'pointer' } : null}
            onClick={withDialog ? e => {
                e.stopPropagation();
                e.preventDefault();
                this.setState({ showControlDialog: index });
            } : undefined}
        >
            {this.vacuumGetObj(index, 'start') && !VACUUM_CLEANING_STATES.includes(smallStatus) &&
                <Tooltip title={Generic.t('Start')}>
                    <IconButton
                        onClick={withDialog ? null : () => this.props.context.socket.setState(this.state.rxData[`vacuum-start-oid${index}`], true)}
                    >
                        <PlayArrow />
                    </IconButton>
                </Tooltip>}
            {this.vacuumGetObj(index, 'pause') && !VACUUM_PAUSE_STATES.includes(smallStatus) && !VACUUM_CHARGING_STATES.includes(smallStatus) &&
                <Tooltip title={Generic.t('Pause')}>
                    <IconButton
                        onClick={withDialog ? null : () => this.props.context.socket.setState(this.state.rxData[`vacuum-pause-oid${index}`], true)}
                    >
                        <Pause />
                    </IconButton>
                </Tooltip>}
            {this.vacuumGetObj(index, 'home') && !VACUUM_CHARGING_STATES.includes(smallStatus) &&
                <Tooltip title={Generic.t('Home')}>
                    <IconButton
                        onClick={withDialog ? null : () => this.props.context.socket.setState(this.state.rxData[`vacuum-home-oid${index}`], true)}
                    >
                        <Home />
                    </IconButton>
                </Tooltip>}
            {statusObj && <Tooltip title={Generic.t('Status')}>
                <div style={{ color: statusColor }}>
                    {Generic.t(status).replace('vis_2_widgets_material_', '')}
                </div>
            </Tooltip>}
        </div>;
    }

    vacuumRenderMap(index) {
        const obj = this.vacuumGetObj(index, 'map64');
        if (!obj) {
            if (this.state.rxData[`vacuum-use-default-picture${index}`]) {
                return <VacuumCleanerIcon className={this.props.classes.vacuumImage} />;
            }
            if (this.state.rxData[`vacuum-own-image${index}`]) {
                return <Icon src={this.state.rxData[`vacuum-own-image${index}`]} className={this.props.classes.vacuumImage} />;
            }
            return null;
        }

        return <img src={this.state.values[`${obj._id}.val`]} alt="vacuum" className={this.props.classes.vacuumImage} />;
    }

    vacuumRenderDialog(index) {
        const rooms = this.vacuumRenderRooms(index);
        const battery = this.vacuumRenderBattery(index);
        let height = 0;
        if (rooms) {
            height += 36;
        } else if (battery) {
            height += 24;
        }
        const sensors = this.vacuumRenderSensors(index);
        if (sensors) {
            height += 46;
        }

        const buttons = this.vacuumRenderButtons(index);
        const speed = this.vacuumRenderSpeed(index);

        if (buttons || rooms) {
            height += 40;
        }

        const map = this.vacuumRenderMap(index);

        return <div className={this.props.classes.vacuumContent}>
            {battery || rooms ? <div className={this.props.classes.vacuumTopPanel}>
                {rooms}
                {battery}
            </div> : null}
            {map ? <div className={this.props.classes.vacuumMapContainer} style={{ height: `calc(100% - ${height}px)`, width: '100%' }}>
                {map}
            </div> : null}
            {sensors}
            {buttons || speed ? <div className={this.props.classes.vacuumBottomPanel}>
                {buttons}
                {speed}
            </div> : null}
        </div>;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);
        this.customStyle = {};
        if (this.state.rxStyle['font-weight']) {
            this.customStyle.fontWeight = this.state.rxStyle['font-weight'];
        }
        if (this.state.rxStyle['font-size']) {
            this.customStyle.fontSize = this.state.rxStyle['font-size'];
        }
        if (this.state.rxStyle['font-family']) {
            this.customStyle.fontFamily = this.state.rxStyle['font-family'];
        }
        if (this.state.rxStyle['font-style']) {
            this.customStyle.fontStyle = this.state.rxStyle['font-style'];
        }
        if (this.state.rxStyle['word-spacing']) {
            this.customStyle.wordSpacing = this.state.rxStyle['word-spacing'];
        }
        if (this.state.rxStyle['letter-spacing']) {
            this.customStyle.letterSpacing = this.state.rxStyle['letter-spacing'];
        }
        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData !== actualRxData) {
            this.updateTimeout = this.updateTimeout || setTimeout(async () => {
                this.updateTimeout = null;
                await this.propertiesUpdate();
            }, 50);
        }
        let allSwitchValue = null;
        let intermediate;
        const items = Object.keys(this.state.objects)
            .filter(index => this.state.objects[index] && !this.state.rxData[`hide${index}`]);

        if (this.state.rxData.type === 'lines' && items
            .filter(index => typeof this.state.objects[index] !== 'string')
            .find(index => this.state.objects[index].widgetType === 'switch')
        ) {
            allSwitchValue = items
                .filter(index => this.state.objects[index]?.widgetType === 'switch')
                .every(index => this.isOn(index));

            intermediate = !!items
                .filter(index => this.state.objects[index]?.widgetType === 'switch')
                .find(index => this.isOn(index) !== allSwitchValue);
        }

        const icons = items.map(index => this.getStateIcon(index));
        const anyIcon = icons.find(icon => icon);

        const content = <>
            {this.lockRenderUnlockDialog()}
            {this.lockRenderConfirmDialog()}
            {this.renderControlDialog()}
            {this.renderBlindsDialog()}
            {this.state.rxData.type === 'lines' ?
                // LINES
                // index from 1, i from 0
                items.map((index, i) => <div
                    className={this.props.classes.cardsHolder}
                    style={this.state.rxData[`widget${index}`] && this.state.rxData[`height${index}`] ?
                        { height: this.state.rxData[`widget${index}`] } : undefined}
                    key={index}
                >
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {anyIcon ? <span className={this.props.classes.iconSwitch}>
                            {icons[i]}
                        </span> : null}
                        {this.state.objects[index].widgetType !== 'input' && this.state.objects[index].widgetType !== 'select' ? <span style={{ color: this.getColor(index), paddingLeft: 16 }}>
                            {this.state.rxData[`title${index}`] || Generic.getText(this.state.objects[index]?.common?.name) || ''}
                        </span> : null}
                    </span>
                    {this.renderLine(index)}
                </div>)
                :
                // BUTTONS
                <div className={this.props.classes.buttonsContainer} style={{ flexWrap: this.state.rxData.orientation && this.state.rxData.orientation !== 'h' ? 'wrap' : 'nowrap' }}>
                    {items.map((index, i) =>
                        // index from 1, i from 0
                        this.renderButton(index, anyIcon ? icons[i] : null))}
                </div>}
        </>;

        let addToHeader = this.state.rxData.allSwitch && items.length > 1 && allSwitchValue !== null ? <Switch
            checked={allSwitchValue}
            className={intermediate ? this.props.classes.intermediate : ''}
            onChange={async () => {
                const values = JSON.parse(JSON.stringify(this.state.values));

                for (let i = 0; i <= items.length; i++) {
                    if (this.state.objects[items[i]] && this.state.objects[items[i]]._id && this.state.objects[items[i]].widgetType === 'switch') {
                        const oid = `${this.state.objects[items[i]]._id}.val`;
                        if (this.state.objects[items[i]].common.type === 'boolean') {
                            values[oid] = !allSwitchValue;
                            await this.props.context.socket.setState(this.state.objects[items[i]]._id, values[oid]);
                        } else if (this.state.objects[items[i]].common.type === 'number') {
                            values[oid] = allSwitchValue ? this.state.objects[items[i]].common.min : this.state.objects[items[i]].common.max;
                            await this.props.context.socket.setState(this.state.objects[items[i]]._id, values[oid]);
                        } else {
                            values[oid] = !allSwitchValue;
                            await this.props.context.socket.setState(this.state.objects[items[i]]._id, values[oid] ? 'true' : 'false');
                        }
                    }
                }

                this.setState({ values });
            }}
        /> : null;

        if (this.state.rxData.noCard || props.widget.usedInWidget) {
            return content;
        }

        if (!this.state.rxData.widgetTitle && addToHeader) {
            addToHeader = <div style={{ textAlign: 'right', width: '100%' }}>
                {addToHeader}
            </div>;
        }

        return this.wrapContent(content, addToHeader);
    }
}

Switches.propTypes = {
    context: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default withStyles(styles)(Switches);
