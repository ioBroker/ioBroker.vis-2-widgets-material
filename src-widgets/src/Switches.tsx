import React from 'react';

import ReactEchartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TimelineComponent } from 'echarts/components';
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
    Tooltip,
    DialogActions,
    Menu,
    Card,
    CardContent,
    Box,
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
    BatteryChargingFull,
    BatteryFull,
    PlayArrow,
    Pause,
    Home,
    WbAuto,
} from '@mui/icons-material';

import {
    hexToHsva,
    hslaToHsva,
    type HsvaColor,
    hsvaToHex,
    hsvaToHsla,
    hsvaToRgba,
    rgbaToHex,
    rgbaToHsva,
    ShadeSlider,
    Sketch,
    Wheel,
} from '@uiw/react-color';
import { TbSquareLetterW } from 'react-icons/tb';
import { CircularSliderWithChildren } from 'react-circular-slider-svg';

import { Icon, type LegacyConnection, Utils } from '@iobroker/adapter-react-v5';
import type {
    AnyWidgetId,
    GroupWidget,
    RxRenderWidgetProps,
    RxWidgetInfo,
    RxWidgetInfoAttributesField,
    SingleWidget,
    VisRxWidgetProps,
    VisRxWidgetStateValues,
    WidgetData,
} from '@iobroker/types-vis-2';

import Generic from './Generic';
import BlindsBase, {
    type BlindsBaseRxData,
    type BlindsBaseState,
    // type HelperObject,
    STYLES,
} from './Components/BlindsBase';
import WindowClosed from './Components/WindowClosed';
import DoorAnimation from './Components/DoorAnimation';
import LockAnimation from './Components/LockAnimation';
import { colorTemperatureToRGB, RGB_NAMES, type RGB_NAMES_TYPE, RGB_ROLES } from './RGBLight';
import {
    FanIcon,
    VACUUM_CHARGING_STATES,
    VACUUM_CLEANING_STATES,
    VACUUM_ID_ROLES,
    type VACUUM_ID_ROLES_TYPE,
    VACUUM_PAUSE_STATES,
    vacuumGetStatusColor,
} from './Vacuum';
import VacuumCleanerIcon from './Components/VacuumIcon';
import type { WidgetType } from './deviceWidget';
import type { TooltipOption, YAXisOption } from 'echarts/types/dist/shared';
import type { EChartsOption, SeriesOption } from 'echarts';
import type { FormatterParam } from './ObjectChart';

type HelperObject = {
    common: ioBroker.StateCommon;
    _id: string;
    widgetType?: WidgetType;
};

function VacuumIcon(): React.JSX.Element {
    return (
        <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeWidth="1"
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
                stroke="currentColor"
                d="M21 12a9 9 0 1 1 -18 0a9 9 0 0 1 18 0z"
            />
            <path
                strokeWidth="1"
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
                stroke="currentColor"
                d="M14 9a2 2 0 1 1 -4 0a2 2 0 0 1 4 0z"
            />
            <path
                strokeWidth="2"
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
                stroke="currentColor"
                d="M12 16h.01"
            />
        </svg>
    );
}

const HISTORY = ['influxdb', 'sql', 'history'];

echarts.use([TimelineComponent, LineChart, SVGRenderer]);

async function loadStates(
    field: RxWidgetInfoAttributesField,
    data: WidgetData,
    changeData: (newData: WidgetData) => void,
    socket: LegacyConnection,
    index?: number,
): Promise<void> {
    if (data[field.name!]) {
        const object = await socket.getObject(data[field.name!]);
        if (object?.common) {
            const id = data[field.name!].split('.');
            id.pop();
            const states = await socket.getObjectViewSystem('state', `${id.join('.')}.`, `${id.join('.')}.\u9999`);
            if (states) {
                let changed = false;
                Object.values(states).forEach(state => {
                    const role = state.common.role;
                    if (
                        role &&
                        RGB_ROLES[role] &&
                        (!data[role] || data[role] === 'nothing_selected') &&
                        field.name !== role
                    ) {
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
                if (changed) {
                    changeData(data);
                }
            }
        }
    }
}

const vacuumLoadStates = async (
    field: RxWidgetInfoAttributesField,
    data: WidgetData,
    changeData: (newData: WidgetData) => void,
    socket: LegacyConnection,
    index?: number,
): Promise<void> => {
    if (data[field.name!]) {
        const object = await socket.getObject(data[field.name!]);
        if (object?.common) {
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

            const states = await socket.getObjectViewSystem(
                'state',
                `${parts.join('.')}.`,
                `${parts.join('.')}.\u9999`,
            );
            if (states) {
                let changed = false;

                if (data[`type${index}`] !== 'vacuum' && data[field.name!].startsWith('mihome-vacuum.')) {
                    changed = true;
                    data[`type${index}`] = 'vacuum';
                }

                Object.keys(VACUUM_ID_ROLES).forEach(name => {
                    if (!data[`vacuum-${name as VACUUM_ID_ROLES_TYPE}-oid${index}`]) {
                        // try to find state
                        Object.values(states).forEach(state => {
                            const _parts = state._id.split('.');
                            if (_parts.includes('rooms')) {
                                if (!data[`vacuum-use-rooms${index}`]) {
                                    changed = true;
                                    data[`vacuum-use-rooms${index}`] = true;
                                }
                                return;
                            }

                            const role = state.common.role;
                            const vacuumRole = VACUUM_ID_ROLES[name as VACUUM_ID_ROLES_TYPE].role;
                            if (vacuumRole && !role?.includes(vacuumRole)) {
                                return;
                            }
                            const vacuumName = VACUUM_ID_ROLES[name as VACUUM_ID_ROLES_TYPE].name;
                            if (vacuumName) {
                                const last = state._id.split('.').pop()!.toLowerCase();
                                if (!last.includes(vacuumName)) {
                                    return;
                                }
                            }

                            changed = true;
                            data[`vacuum-${name}-oid${index}`] = state._id;
                        });
                    }
                });

                if (changed) {
                    changeData(data);
                }
            }
        }
    }
};

const styles: Record<string, any> = {
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
    allButtonsTitle: {
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
        position: 'relative',
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
        position: 'relative',
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
        animation: 'vis-2-widgets-material-newValueAnimationLight 2s ease-in-out',
    },
    thermostatNewValueDark: {
        animation: 'vis-2-widgets-material-newValueAnimationDark 2s ease-in-out',
    },
    thermostatDesiredTemp: {
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        left: 0,
        transform: 'none',
    },

    lockPinGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridGap: '10px',
    },
    lockPinInput: {
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
        display: 'flex',
        alignItems: 'center',
        gap: 4,
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
    tooltip: {
        pointerEvents: 'none',
    },

    disabledOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        userSelect: 'none',
        pointerEvents: 'none',
        zIndex: 100,
    },

    ...STYLES,
};

interface SwitchesRxData extends BlindsBaseRxData {
    noCard: boolean;
    widgetTitle: string;
    count: number;
    type: 'lines' | 'buttons';
    allSwitch: boolean;
    orientation: 'h' | 'v' | 'f';
    buttonsWidth: number;
    // TODO: Check if it really used
    buttonsHeight: number;
    doNotWantIncludeWidgets: boolean;
    [key: `oid${number}`]: string;
    [key: `type${number}`]: WidgetType;
    [key: `noIcon${number}`]: boolean;
    [key: `icon${number}`]: string;
    [key: `iconSmall${number}`]: string;
    [key: `iconEnabled${number}`]: string;
    [key: `iconEnabledSmall${number}`]: string;
    [key: `color${number}`]: string;
    [key: `colorEnabled${number}`]: string;
    [key: `slideInvert${number}`]: boolean;
    [key: `title${number}`]: string;
    [key: `unit${number}`]: string;
    [key: `step${number}`]: string;
    [key: `hideChart${number}`]: boolean;
    [key: `chartPeriod${number}`]: string;
    [key: `buttonText${number}`]: string;
    [key: `buttonIcon${number}`]: string;
    [key: `buttonImage${number}`]: string;
    [key: `buttonIconActive${number}`]: string;
    [key: `buttonImageActive${number}`]: string;
    [key: `infoInactiveText${number}`]: string;
    [key: `infoActiveText${number}`]: string;
    [key: `infoInactiveIcon${number}`]: string;
    [key: `infoActiveIcon${number}`]: string;
    [key: `infoInactiveImage${number}`]: string;
    [key: `infoActiveImage${number}`]: string;
    [key: `infoInactiveColor${number}`]: string;
    [key: `infoActiveColor${number}`]: string;
    [key: `widget${number}`]: AnyWidgetId;
    [key: `height${number}`]: number;
    [key: `position${number}`]: number;
    [key: `hide${number}`]: boolean;
    [key: `actual${number}`]: string;
    [key: `boost${number}`]: string;
    [key: `party${number}`]: string;
    [key: `rgbType${number}`]: 'rgb' | 'rgbw' | 'r/g/b' | 'r/g/b/w' | 'hue/sat/lum' | 'ct';
    [key: `ct_min${number}`]: number | string;
    [key: `ct_max${number}`]: number | string;
    [key: `hideBrightness${number}`]: boolean;
    [key: `whiteMode${number}`]: boolean;
    [key: `noRgbPalette${number}`]: boolean;
    [key: `open${number}`]: string;
    [key: `working${number}`]: string;
    [key: `sensor${number}`]: string;

    [key: `pincode${number}`]: string;
    [key: `oid-pincode${number}`]: string;
    [key: `doNotConfirm${number}`]: boolean;
    [key: `noLockAnimation${number}`]: boolean;
    [key: `lockColor${number}`]: string;
    [key: `pincodeReturnButton${number}`]: 'submit' | 'backspace';
    [key: `timeout${number}`]: number | string;

    [key: `vacuum-${VACUUM_ID_ROLES_TYPE}-oid${number}`]: string;
    [key: `vacuum-use-rooms${number}`]: boolean;
    [key: `vacuum-use-default-picture${number}`]: boolean;
    [key: `vacuum-own-image${number}`]: string;

    [key: `start${number}`]: string;
    [key: `home${number}`]: string;
    [key: `pause${number}`]: string;
    [key: `visibility-oid${number}`]: string;
    [key: `visibility-cond${number}`]:
        | '=='
        | '!='
        | '<='
        | '>='
        | '<'
        | '>'
        | 'consist'
        | 'not consist'
        | 'exist'
        | 'not exist';
    [key: `visibility-val${number}`]: string;
    [key: `visibility-no-hide${number}`]: string;
    [key: `${RGB_NAMES_TYPE}${number}`]: string;
    // TODO: Check if it really used
    [key: `width${number}`]: string;
}

type SecondaryNames = RGB_NAMES_TYPE | 'oid' | 'actual' | VACUUM_ID_ROLES_TYPE | 'rooms';

interface SwitchesState extends BlindsBaseState {
    showControlDialog: number | null;
    inputValue: string | number | boolean;
    showSetButton: boolean[];
    inputValues: string[];
    historyData: Record<string, EChartsOption>;
    chartWidth: Record<string, number>;
    chartHeight: Record<string, number>;
    sketch: Record<string, number>;

    secondaryObjects: Partial<Record<SecondaryNames, ioBroker.StateObject>>[];

    lockConfirmDialog: null | { index: number; oid: 'open' | 'oid' };

    dialogPin: null | { index: number; oid: 'open' | 'oid' };
    invalidPin: boolean;
    lockPinInput: string;

    showSpeedMenu: (EventTarget & HTMLButtonElement) | null;

    showRoomsMenu: (EventTarget & HTMLButtonElement) | null;
    controlValue: { id: string; value: number; changed: boolean } | null;
}

class Switches extends BlindsBase<SwitchesRxData, SwitchesState> {
    private timeouts: Record<number, Record<string, ReturnType<typeof setTimeout> | null>> = {};
    private history: (string | null)[] = [];
    // this.refs name does not work (I don't know why)
    private _refs: (React.RefObject<any> | null)[] = [];
    private widgetRef: Record<number, React.RefObject<any>> = {};
    private lastRxData = '';
    private doNotWantIncludeWidgets: boolean;
    private updateDialogChartInterval: ReturnType<typeof setInterval> | null = null;
    private updateChartInterval: ReturnType<typeof setInterval> | null = null;
    private customStyle: React.CSSProperties | undefined;
    private updateTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = {
            ...this.state,
            showControlDialog: null,
            inputValue: '',
            showSetButton: [],
            inputValues: [],
            objects: [],
            historyData: {},
            chartWidth: {},
            chartHeight: {},
            sketch: {},
            secondaryObjects: [],

            dialogPin: null,
            invalidPin: false,
            lockPinInput: '',
            showRoomsMenu: null,
            controlValue: null,
        };

        this.doNotWantIncludeWidgets = this.state.rxData.doNotWantIncludeWidgets;
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplMaterial2Switches',
            visSet: 'vis-2-widgets-material',
            visName: 'Switches',
            visWidgetLabel: 'switches_or_buttons', // Label of widget
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
                            label: 'doNotWantIncludeWidgets',
                            name: 'doNotWantIncludeWidgets',
                            type: 'checkbox',
                            default: false,
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
                                if (data[field.name!]) {
                                    if (data[field.name!].startsWith('mihome-vacuum.')) {
                                        await vacuumLoadStates(field, data, changeData, socket, index);
                                        return;
                                    }
                                    const object = await socket.getObject(data[field.name!]);

                                    if (
                                        object?.common?.role &&
                                        (object.common.role.includes('level.temperature') ||
                                            object.common.role.includes('rgb') ||
                                            object.common.role.includes('lock'))
                                    ) {
                                        const id = data[field.name!].split('.');
                                        id.pop();
                                        const states = await socket.getObjectViewSystem(
                                            'state',
                                            `${id.join('.')}.`,
                                            `${id.join('.')}.\u9999`,
                                        );
                                        if (states) {
                                            let changed = false;
                                            if (
                                                data[`type${index}`] !== 'thermostat' &&
                                                object.common.role.includes('level.temperature')
                                            ) {
                                                changed = true;
                                                data[`type${index}`] = 'thermostat';
                                            }
                                            if (data[`type${index}`] !== 'rgb' && object.common.role.includes('rgb')) {
                                                changed = true;
                                                data[`type${index}`] = 'rgb';
                                            }
                                            if (
                                                data[`type${index}`] !== 'lock' &&
                                                object.common.role.includes('lock')
                                            ) {
                                                changed = true;
                                                data[`type${index}`] = 'lock';
                                            }
                                            if (object.common.role.includes('level.temperature')) {
                                                Object.values(states).forEach(state => {
                                                    const role = state.common.role;
                                                    if (role?.includes('value.temperature')) {
                                                        data[`actual${index}`] = state._id;
                                                        changed = true;
                                                    } else if (role?.includes('power')) {
                                                        data[`switch${index}`] = state._id;
                                                        changed = true;
                                                    } else if (role?.includes('boost')) {
                                                        data[`boost${index}`] = state._id;
                                                        changed = true;
                                                    } else if (role?.includes('party')) {
                                                        data[`party${index}`] = state._id;
                                                        changed = true;
                                                    }
                                                });
                                            } else if (object.common.role.includes('rgb')) {
                                                if (
                                                    data[`rgbType${index}`] !== 'rgb' &&
                                                    object.common.role.includes('rgbw')
                                                ) {
                                                    changed = true;
                                                    data[`rgbType${index}`] = 'rgbw';
                                                } else if (data[`rgbType${index}`] !== 'rgb') {
                                                    changed = true;
                                                    data[`rgbType${index}`] = 'rgb';
                                                }

                                                Object.values(states).forEach(state => {
                                                    const role = state.common.role;
                                                    if (
                                                        role &&
                                                        RGB_ROLES[role] &&
                                                        (!data[role] || data[role] === 'nothing_selected') &&
                                                        field.name !== role
                                                    ) {
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
                                                    if (role?.includes('button')) {
                                                        data[`open${index}`] = state._id;
                                                        changed = true;
                                                    } else if (role?.includes('working')) {
                                                        data[`working${index}`] = state._id;
                                                        changed = true;
                                                    }
                                                });
                                            }

                                            if (changed) {
                                                changeData(data);
                                            }
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
                            label: 'invert_position',
                            type: 'checkbox',
                            hidden: '!data["oid" + index] || data["type" + index] !== "blinds"',
                            name: 'slideInvert',
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
                                { value: '10', label: '10_minutes' },
                                { value: '30', label: '30_minutes' },
                                { value: '60', label: '1_hour' },
                                { value: '120', label: '2_hours' },
                                { value: '180', label: '3_hours' },
                                { value: '360', label: '6_hours' },
                                { value: '720', label: '12_hours' },
                                { value: '1440', label: '1_day' },
                                { value: '2880', label: '2_days' },
                                { value: '10080', label: '1_week' },
                            ],
                            default: '60',
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
                            noBinding: true,
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
                            options: ['rgb', 'rgbw', 'r/g/b', 'r/g/b/w', 'hue/sat/lum', 'ct'],
                            onChange: loadStates,
                            hidden: '!!data["widget" + index] || data["type" + index] !== "rgb"',
                        },
                        {
                            name: 'red',
                            type: 'id',
                            label: 'red',
                            hidden: (data, index) =>
                                !!data[`widget${index}`] ||
                                (data[`rgbType${index}`] !== 'r/g/b' && data[`rgbType${index}`] !== 'r/g/b/w'),
                            onChange: loadStates,
                        },
                        {
                            name: 'green',
                            type: 'id',
                            label: 'green',
                            hidden: (data, index) =>
                                !!data[`widget${index}`] ||
                                data[`type${index}`] !== 'rgb' ||
                                (data[`rgbType${index}`] !== 'r/g/b' && data[`rgbType${index}`] !== 'r/g/b/w'),
                            onChange: loadStates,
                        },
                        {
                            name: 'blue',
                            type: 'id',
                            label: 'blue',
                            hidden: (data, index) =>
                                !!data[`widget${index}`] ||
                                data[`type${index}`] !== 'rgb' ||
                                (data[`rgbType${index}`] !== 'r/g/b' && data[`rgbType${index}`] !== 'r/g/b/w'),
                            onChange: loadStates,
                        },
                        {
                            name: 'white',
                            type: 'id',
                            label: 'white',
                            hidden: (data, index) =>
                                !!data[`widget${index}`] ||
                                data[`type${index}`] !== 'rgb' ||
                                (data[`rgbType${index}`] !== 'r/g/b/w' && data[`rgbType${index}`] !== 'rgbw'),
                            onChange: loadStates,
                        },
                        {
                            name: 'color_temperature',
                            type: 'id',
                            label: 'color_temperature',
                            hidden: (data, index) =>
                                !!data[`widget${index}`] ||
                                data[`type${index}`] !== 'rgb' ||
                                data[`rgbType${index}`] !== 'ct',
                            onChange: loadStates,
                        },
                        {
                            name: 'ct_min',
                            type: 'number',
                            min: 500,
                            max: 10000,
                            label: 'color_temperature_min',
                            hidden: (data, index) =>
                                !!data[`widget${index}`] ||
                                data[`type${index}`] !== 'rgb' ||
                                data[`rgbType${index}`] !== 'ct' ||
                                !data[`color_temperature${index}`],
                        },
                        {
                            name: 'ct_max',
                            type: 'number',
                            min: 500,
                            max: 10000,
                            label: 'color_temperature_max',
                            hidden: (data, index) =>
                                !!data[`widget${index}`] ||
                                data[`type${index}`] !== 'rgb' ||
                                data[`rgbType${index}`] !== 'ct' ||
                                !data[`color_temperature${index}`],
                        },
                        {
                            name: 'hue',
                            type: 'id',
                            label: 'hue',
                            hidden: (data, index) =>
                                !!data[`widget${index}`] ||
                                data[`type${index}`] !== 'rgb' ||
                                data[`rgbType${index}`] !== 'hue/sat/lum',
                            onChange: loadStates,
                        },
                        {
                            name: 'saturation',
                            type: 'id',
                            label: 'saturation',
                            hidden: (data, index) =>
                                !!data[`widget${index}`] ||
                                data[`type${index}`] !== 'rgb' ||
                                data[`rgbType${index}`] !== 'hue/sat/lum',
                            onChange: loadStates,
                        },
                        {
                            name: 'luminance',
                            type: 'id',
                            label: 'luminance',
                            hidden: (data, index) =>
                                !!data[`widget${index}`] ||
                                data[`type${index}`] !== 'rgb' ||
                                data[`rgbType${index}`] !== 'hue/sat/lum',
                            onChange: loadStates,
                        },
                        {
                            name: 'hideBrightness',
                            type: 'checkbox',
                            label: 'hideBrightness',
                            hidden: (data, index) =>
                                !!data[`widget${index}`] ||
                                data[`type${index}`] !== 'rgb' ||
                                (data[`rgbType${index}`] !== 'rgb' &&
                                    data[`rgbType${index}`] !== 'rgbw' &&
                                    data[`rgbType${index}`] !== 'r/g/b' &&
                                    data[`rgbType${index}`] !== 'r/g/b/w'),
                            onChange: loadStates,
                        },
                        {
                            name: 'whiteMode',
                            type: 'checkbox',
                            label: 'whiteMode',
                            tooltip: 'whiteModeTooltip',
                            hidden: (data, index) =>
                                !!data[`widget${index}`] ||
                                data[`type${index}`] !== 'rgb' ||
                                (data[`rgbType${index}`] !== 'rgbw' && data[`rgbType${index}`] !== 'r/g/b/w'),
                            onChange: loadStates,
                        },
                        {
                            name: 'noRgbPalette',
                            type: 'checkbox',
                            label: 'noRgbPalette',
                            hidden: (data, index) =>
                                !!data[`widget${index}`] ||
                                data[`type${index}`] !== 'rgb' ||
                                (data[`rgbType${index}`] !== 'rgb' &&
                                    data[`rgbType${index}`] !== 'rgbw' &&
                                    data[`rgbType${index}`] !== 'r/g/b' &&
                                    data[`rgbType${index}`] !== 'r/g/b/w'),
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
                            onChange: (field, data, changeData, socket, index): Promise<void> => {
                                if (data[`pincode${index}`] && data[`pincode${index}`].match(/[^0-9]/g)) {
                                    data[`pincode${index}`] = data[`pincode${index}`].replace(/[^0-9]/g, '');
                                    changeData(data);
                                }
                                return Promise.resolve();
                            },
                            hidden: (data, index) =>
                                !!data[`widget${index}`] ||
                                data[`type${index}`] !== 'lock' ||
                                !!data[`oid-pincode${index}`],
                        },
                        {
                            name: 'oid-pincode',
                            type: 'id',
                            label: 'pincode_oid',
                            hidden: (data, index) =>
                                !!data[`widget${index}`] ||
                                data[`type${index}`] !== 'lock' ||
                                !!data[`pincode${index}`],
                        },
                        {
                            name: 'doNotConfirm',
                            type: 'checkbox',
                            label: 'doNotConfirm',
                            hidden: (data, index) =>
                                !!data[`widget${index}`] ||
                                data[`type${index}`] !== 'lock' ||
                                (!!data[`oid-pincode${index}`] && !!data[`pincode${index}`]),
                        },
                        {
                            name: 'noLockAnimation',
                            label: 'noLockAnimation',
                            type: 'checkbox',
                            hidden: (data, index) =>
                                !!data[`widget${index}`] || data[`type${index}`] !== 'lock' || !data[`oid${index}`],
                        },
                        {
                            name: 'lockColor',
                            label: 'Lock color',
                            type: 'color',
                            hidden: (data, index) =>
                                !!data[`widget${index}`] ||
                                data[`type${index}`] !== 'lock' ||
                                !data[`oid${index}`] ||
                                !!data[`noLockAnimation${index}`],
                        },
                        {
                            name: 'pincodeReturnButton',
                            type: 'select',
                            options: ['submit', 'backspace'],
                            default: 'submit',
                            label: 'pincode_return_button',
                            hidden: (data, index) =>
                                !!data[`widget${index}`] ||
                                data[`type${index}`] !== 'lock' ||
                                (!!data[`oid-pincode${index}`] && !!data[`pincode${index}`]),
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
                            hidden: '!!data["widget" + index] || data["type" + index] !== "vacuum"',
                        },
                        {
                            label: 'battery',
                            name: 'vacuum-battery-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                            hidden: '!!data["widget" + index] || data["type" + index] !== "vacuum"',
                        },
                        {
                            label: 'is_charging',
                            name: 'vacuum-is-charging-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                            hidden: '!!data["widget" + index] || data["type" + index] !== "vacuum"',
                        },
                        {
                            label: 'fan_speed',
                            name: 'vacuum-fan-speed-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                            hidden: '!!data["widget" + index] || data["type" + index] !== "vacuum"',
                        },
                        {
                            label: 'sensors_left',
                            name: 'vacuum-sensors-left-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                            hidden: '!!data["widget" + index] || data["type" + index] !== "vacuum"',
                        },
                        {
                            label: 'filter_left',
                            name: 'vacuum-filter-left-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                            hidden: '!!data["widget" + index] || data["type" + index] !== "vacuum"',
                        },
                        {
                            label: 'main_brush_left',
                            name: 'vacuum-main-brush-left-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                            hidden: '!!data["widget" + index] || data["type" + index] !== "vacuum"',
                        },
                        {
                            label: 'side_brush_left',
                            name: 'vacuum-side-brush-left-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                            hidden: '!!data["widget" + index] || data["type" + index] !== "vacuum"',
                        },
                        {
                            label: 'cleaning_count',
                            name: 'vacuum-cleaning-count-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                            hidden: '!!data["widget" + index] || data["type" + index] !== "vacuum"',
                        },
                        {
                            label: 'rooms',
                            name: 'vacuum-use-rooms',
                            type: 'checkbox',
                            tooltip: 'rooms_tooltip',
                            hidden: '!!data["widget" + index] || data["type" + index] !== "vacuum"',
                        },
                        {
                            label: 'map64',
                            name: 'vacuum-map64-oid',
                            type: 'id',
                            onChange: vacuumLoadStates,
                            hidden: '!!data["widget" + index] || data["type" + index] !== "vacuum"',
                        },
                        {
                            label: 'useDefaultPicture',
                            name: 'vacuum-use-default-picture',
                            type: 'checkbox',
                            default: true,
                            hidden: '!!data["widget" + index] || data["type" + index] !== "vacuum" || !!data["vacuum-map64-oid"]',
                        },
                        {
                            label: 'ownImage',
                            name: 'vacuum-own-image',
                            type: 'image',
                            hidden: '!!data["widget" + index] || data["type" + index] !== "vacuum" || !!data["vacuum-map64-oid"] || !data["vacuum-use-default-picture"]',
                        },
                        {
                            label: 'start',
                            name: 'vacuum-start-oid',
                            type: 'id',
                            hidden: '!!data["widget" + index] || data["type" + index] !== "vacuum"',
                        },
                        {
                            label: 'home',
                            name: 'vacuum-home-oid',
                            type: 'id',
                            hidden: '!!data["widget" + index] || data["type" + index] !== "vacuum"',
                        },
                        {
                            label: 'pause',
                            name: 'vacuum-pause-oid',
                            type: 'id',
                            hidden: '!!data["widget" + index] || data["type" + index] !== "vacuum"',
                        },
                        {
                            type: 'delimiter',
                            name: 'delimiter',
                        },
                        // ---------- visibility -----------------
                        {
                            label: 'visibility-oid',
                            name: 'visibility-oid',
                            type: 'id',
                        },
                        {
                            label: 'visibility-cond',
                            name: 'visibility-cond',
                            type: 'select',
                            options: ['==', '!=', '<=', '>=', '<', '>', 'consist', 'not consist', 'exist', 'not exist'],
                            noTranslation: true,
                            default: '==',
                            hidden: '!data["visibility-oid" + index]',
                        },
                        {
                            label: 'visibility-val',
                            name: 'visibility-val',
                            type: 'text',
                            default: '1',
                            hidden: '!data["visibility-oid" + index]',
                        },
                        {
                            label: 'visibility-no-hide',
                            name: 'visibility-no-hide',
                            type: 'checkbox',
                            hidden: '!data["visibility-oid" + index]',
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

    getWidgetInfo(): RxWidgetInfo {
        return Switches.getWidgetInfo();
    }

    onStateUpdated(id: string): void {
        if (this.state.controlValue?.id === id) {
            this.setState({ controlValue: { id, value: this.state.controlValue.value, changed: true } });
        }
    }

    async propertiesUpdate(): Promise<void> {
        const actualRxData = JSON.stringify(this.state.rxData);

        if (this.lastRxData === actualRxData) {
            return;
        }

        this.lastRxData = actualRxData;
        const objects: (HelperObject | null | string)[] = [];
        const secondaryObjects: Partial<Record<SecondaryNames, ioBroker.StateObject>>[] = [];
        const ids: string[] = [];
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
        const _objects: Record<string, ioBroker.StateObject> = ids.length
            ? ((await this.props.context.socket.getObjectsById(ids)) as Record<string, ioBroker.StateObject>)
            : {};

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
                    objects[index] = { common: {} } as ioBroker.StateObject;
                    continue;
                }
                object.common ||= {} as ioBroker.StateCommon;
                let widgetType = this.state.rxData[`type${index}`];

                if (widgetType === 'auto') {
                    // not writable => info
                    if (object.common.write === false) {
                        widgetType = 'info';
                    } else if (object.common.states && (object.common.write as any) !== false) {
                        // with states => select
                        widgetType = 'select';
                    } else if (object.common.type === 'number' && object.common.max !== undefined) {
                        // number writable max => slider
                        widgetType = 'slider';
                    } else if (object.common.type === 'boolean' && (object.common.write as any) !== false) {
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
                    object.common.max ??= 100;
                    object.common.min ??= 0;
                }
                if (Array.isArray(object.common.states)) {
                    // convert to {'state1': 'state1', 'state2': 'state2', ...}
                    const states: Record<string, string> = {};
                    object.common.states.forEach(state => (states[state] = state));
                    object.common.states = states;
                }

                object.common.unit ||= this.state.rxData[`unit${index}`];

                if (this.state.rxData[`noIcon${index}`]) {
                    object.common.icon = undefined;
                } else if (
                    !this.state.rxData[`icon${index}`] &&
                    !this.state.rxData[`iconSmall${index}`] &&
                    !object.common.icon &&
                    (object.type === 'state' || object.type === 'channel')
                ) {
                    const idArray = this.state.rxData[`oid${index}`].split('.');

                    // read channel
                    const parentObject = await this.props.context.socket.getObject(idArray.slice(0, -1).join('.'));
                    if (!parentObject?.common?.icon && (object.type === 'state' || object.type === 'channel')) {
                        const grandParentObject = await this.props.context.socket.getObject(
                            idArray.slice(0, -2).join('.'),
                        );
                        if (grandParentObject?.common?.icon) {
                            object.common.icon =
                                Generic.getObjectIcon(grandParentObject, grandParentObject._id) || undefined;
                        }
                    } else {
                        object.common.icon = Generic.getObjectIcon(parentObject, parentObject._id) || undefined;
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
                this.widgetRef[index] ||= React.createRef();
            } else if (this.widgetRef[index]) {
                delete this.widgetRef[index];
                objects[index] = null;
            }
        }

        if (this.doNotWantIncludeWidgets !== !!this.state.rxData.doNotWantIncludeWidgets) {
            this.doNotWantIncludeWidgets = !!this.state.rxData.doNotWantIncludeWidgets;
            this.props.askView?.('update', {
                id: this.props.id,
                uuid: this.uuid,
                doNotWantIncludeWidgets: !!this.state.rxData.doNotWantIncludeWidgets,
            });
        }

        if (
            JSON.stringify(objects) !== JSON.stringify(this.state.objects) ||
            JSON.stringify(secondaryObjects) !== JSON.stringify(this.state.secondaryObjects)
        ) {
            this.setState({ objects, secondaryObjects });
        }
    }

    async componentDidMount(): Promise<void> {
        super.componentDidMount();
        await this.propertiesUpdate();
        this.doNotWantIncludeWidgets = !!this.state.rxData.doNotWantIncludeWidgets;

        // inform view about, that this widget can include other widgets
        this.props.askView &&
            this.props.askView('update', {
                id: this.props.id,
                uuid: this.uuid,
                canHaveWidgets: true,
                doNotWantIncludeWidgets: !!this.state.rxData.doNotWantIncludeWidgets,
            });
    }

    onCommand(command: 'include', options: any): any {
        const result = super.onCommand(command, options);
        if (result === false) {
            if (command === 'include') {
                let found: false | number = false;
                // find first completely free position
                for (let index = 1; index <= this.state.rxData.count; index++) {
                    if (
                        !this.state.rxData[`oid${index}`] &&
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
                void this.props.context.changeProject(project);
                return true;
            }
        }

        return result;
    }

    componentWillUnmount(): void {
        if (this.updateDialogChartInterval) {
            clearInterval(this.updateDialogChartInterval);
            this.updateDialogChartInterval = null;
        }

        if (this.updateChartInterval) {
            clearInterval(this.updateChartInterval);
            this.updateChartInterval = null;
        }

        this.rgbDestroy();
    }

    async onRxDataChanged(): Promise<void> {
        await this.propertiesUpdate();
    }

    isOn(index: number, values?: VisRxWidgetStateValues): boolean {
        const obj = this.state.objects[index];
        if (!obj || typeof obj === 'string') {
            return false;
        }
        const trueObj: HelperObject = obj;

        values ||= this.state.values;
        if (trueObj.widgetType === 'rgb' || trueObj.widgetType === 'thermostat' || trueObj.widgetType === 'vacuum') {
            // analyse rgb
            return values[`${this.state.rxData[`switch${index}`]}.val`];
        }
        if (trueObj.common.type === 'number') {
            return values[`${trueObj._id}.val`] !== trueObj.common.min;
        }

        return !!values[`${trueObj._id}.val`];
    }

    getStateIcon(index: number): React.JSX.Element | undefined {
        const obj = this.state.objects[index];
        let iconStr: string | undefined;
        let icon: React.JSX.Element | undefined;
        if (this.state.rxData[`noIcon${index}`]) {
            return undefined;
        }
        if (this.isOn(index)) {
            iconStr = this.state.rxData[`iconEnabled${index}`] || this.state.rxData[`iconEnabledSmall${index}`];
        }

        iconStr ||= this.state.rxData[`icon${index}`] || this.state.rxData[`iconSmall${index}`];
        iconStr ||= typeof obj === 'object' ? obj?.common?.icon : undefined;

        const isOn = this.isOn(index);
        const color = this.getColor(index, isOn);

        if (iconStr) {
            icon = (
                <Icon
                    src={iconStr}
                    style={{
                        ...styles.iconCustom,
                        width: 40,
                        height: 40,
                        color,
                    }}
                />
            );
        } else if (typeof obj === 'object' && obj?.widgetType === 'blinds') {
            icon = <WindowClosed style={{ color }} />;
        } else if (typeof obj === 'object' && obj?.widgetType === 'vacuum') {
            icon = <VacuumIcon />;
        } else if (typeof obj === 'object' && obj?.widgetType === 'thermostat') {
            if (
                this.state.rxData[`switch${index}`] &&
                this.state.values[`${this.state.rxData[`switch${index}`]}.val`]
            ) {
                icon = (
                    <Thermostat
                        color="primary"
                        style={{ color }}
                    />
                );
            } else {
                icon = <Thermostat />;
            }
        } else if (typeof obj === 'object' && obj?.widgetType === 'lock') {
            if (isOn) {
                icon = (
                    <LockOpen
                        color="primary"
                        style={{ color }}
                    />
                );
            } else {
                icon = <Lock style={{ color }} />;
            }
        } else if (typeof obj === 'object' && obj?.widgetType === 'rgb') {
            // check if rgb has power
            if (this.state.rxData[`switch${index}`]) {
                if (this.state.values[`${this.state.rxData[`switch${index}`]}.val`]) {
                    icon = (
                        <LightbulbIconOn
                            color="primary"
                            style={{ color }}
                        />
                    );
                } else {
                    icon = <LightbulbIconOff style={{ color }} />;
                }
            } else if (this.state.rxData[`brightness${index}`]) {
                if (this.state.values[`${this.state.rxData[`brightness${index}`]}.val`]) {
                    icon = (
                        <LightbulbIconOn
                            color="primary"
                            style={{ color }}
                        />
                    );
                } else {
                    icon = <LightbulbIconOff style={{ color }} />;
                }
            } else {
                icon = (
                    <LightbulbIconOn
                        color="primary"
                        style={{ color }}
                    />
                );
            }
        } else if (isOn) {
            icon = (
                <LightbulbIconOn
                    color="primary"
                    style={{ color }}
                />
            );
        } else {
            icon = <LightbulbIconOff style={{ color }} />;
        }

        return icon;
    }

    getColor(index: number, isOn?: boolean): string | undefined {
        const obj = this.state.objects[index];
        if (typeof obj === 'string') {
            return undefined;
        }
        if (isOn === undefined) {
            isOn = this.isOn(index);
        }

        return isOn
            ? this.state.rxData[`colorEnabled${index}`] || this.state.rxData[`color${index}`] || obj?.common?.color
            : this.state.rxData[`color${index}`] || obj?.common?.color;
    }

    changeSwitch = (index: number): void => {
        if (!this.state.objects[index] || typeof this.state.objects[index] === 'string') {
            return;
        }
        const trueObj: HelperObject = this.state.objects[index];

        if (
            trueObj.widgetType === 'rgb' ||
            trueObj.widgetType === 'lock' ||
            trueObj.widgetType === 'vacuum' ||
            trueObj.widgetType === 'thermostat'
        ) {
            this.setState({ showControlDialog: index });
        } else if (
            trueObj.widgetType === 'slider' ||
            trueObj.widgetType === 'input' ||
            trueObj.widgetType === 'select' ||
            trueObj.widgetType === 'info'
        ) {
            if (trueObj.widgetType === 'info') {
                this.updateDialogChartInterval ||= setInterval(() => this.updateCharts(), 60000);
                this.updateCharts(index);
            }

            this.setState({
                showControlDialog: index,
                inputValue: this.state.values[`${trueObj._id}.val`],
            });
        } else if (trueObj.widgetType === 'button') {
            if (trueObj.common.max !== undefined) {
                this.props.context.setValue(this.state.rxData[`oid${index}`], trueObj.common.max);
            } else {
                this.props.context.setValue(this.state.rxData[`oid${index}`], true);
            }
        } else {
            const values = JSON.parse(JSON.stringify(this.state.values));
            const oid = `${trueObj._id}.val`;
            if (trueObj.common.type === 'number') {
                values[oid] = values[oid] === trueObj.common.max ? trueObj.common.min : trueObj.common.max;
            } else {
                values[oid] = !values[oid];
            }
            this.setState({ values });
            this.props.context.setValue(this.state.rxData[`oid${index}`], values[oid]);
        }
    };

    buttonPressed(index: number, pressed: boolean): void {
        this.props.context.setValue(this.state.rxData[`oid${index}`], pressed);
    }

    setOnOff(index: number, isOn: boolean): void {
        if (!this.state.objects[index] || typeof this.state.objects[index] === 'string') {
            return;
        }
        const trueObj: HelperObject = this.state.objects[index];

        const values: VisRxWidgetStateValues = JSON.parse(JSON.stringify(this.state.values));
        const oid: `${string}.val` = `${trueObj._id}.val`;
        values[oid] = isOn ? trueObj.common.max : trueObj.common.min;
        this.setState({ values });
        this.props.context.setValue(this.state.rxData[`oid${index}`], values[oid]);
    }

    controlSpecificState(index: number, value: number | string | boolean): void {
        if (!this.state.objects[index] || typeof this.state.objects[index] === 'string') {
            return;
        }
        const trueObj: HelperObject = this.state.objects[index];
        const values: VisRxWidgetStateValues = JSON.parse(JSON.stringify(this.state.values));
        const oid: `${string}.val` = `${trueObj._id}.val`;
        if (trueObj.common.type === 'number') {
            value = parseFloat(value as string);
        } else if (trueObj.common.type === 'boolean') {
            value = value === 'true' || value === true;
        }

        values[oid] = value;
        this.setState({ values, showControlDialog: null });
        this.props.context.setValue(this.state.rxData[`oid${index}`], values[oid]);
    }

    finishChanging(): void {
        if (this.state.controlValue) {
            const newState: Partial<SwitchesState> = { controlValue: null };
            // If the value was not yet updated, write a new value into "values"
            if (!this.state.controlValue.changed) {
                const values: VisRxWidgetStateValues = JSON.parse(JSON.stringify(this.state.values));
                values[`${this.state.controlValue.id}.val`] = this.state.controlValue.value;
                newState.values = values;
            }
            this.setState(newState as any);
        }
    }

    renderControlDialog(): React.ReactNode {
        const index = this.state.showControlDialog;
        if (index !== null) {
            if (!this.state.objects[index] || typeof this.state.objects[index] === 'string') {
                return;
            }
            const trueObj: HelperObject = this.state.objects[index];

            const curValue = this.state.values[`${trueObj._id}.val`];
            let control;
            if (trueObj.widgetType === 'select') {
                let buttons;
                if (trueObj.common.states) {
                    buttons = Object.keys(trueObj.common.states).map((state, i) => (
                        <Button
                            style={{
                                ...(curValue !== state ? styles.buttonInactive : undefined),
                                ...this.customStyle,
                            }}
                            variant="contained"
                            key={`${state}_${i}`}
                            color={curValue === state ? 'primary' : 'grey'}
                            onClick={() => this.controlSpecificState(index, state)}
                        >
                            {(trueObj.common.states as Record<string, string>)[state]}
                        </Button>
                    ));
                } else if (trueObj.common.type === 'number') {
                    buttons = [];
                    const min = trueObj.common.min === undefined ? 0 : trueObj.common.min;
                    const max = trueObj.common.max === undefined ? 100 : trueObj.common.max;
                    const step =
                        parseInt(this.state.rxData[`step${index}`], 10) ||
                        (trueObj.common.step === undefined ? (max - min) / 10 : trueObj.common.step);
                    buttons = [];
                    for (let i = min; i <= max; i += step) {
                        buttons.push(
                            <Button
                                style={{
                                    ...(curValue !== i ? styles.buttonInactive : undefined),
                                    ...this.customStyle,
                                }}
                                variant="contained"
                                key={i}
                                color={curValue === i ? 'primary' : 'grey'}
                                onClick={() => this.controlSpecificState(index, i)}
                            >
                                {i + (trueObj.common.unit || '')}
                            </Button>,
                        );
                    }
                }
                control = (
                    <div
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
                    </div>
                );
            } else if (trueObj.widgetType === 'slider') {
                control = (
                    <>
                        <div
                            style={{
                                width: '100%',
                                marginBottom: 20,
                            }}
                        >
                            <Button
                                style={{
                                    ...(curValue === trueObj.common.min ? undefined : styles.buttonInactive),
                                    width: '50%',
                                    ...this.customStyle,
                                }}
                                color="grey"
                                onClick={() => {
                                    this.setOnOff(index, false);
                                    this.setState({ showControlDialog: null });
                                }}
                            >
                                <LightbulbIconOff />
                                {Generic.t('OFF').replace('vis_2_widgets_material_', '')}
                            </Button>
                            <Button
                                style={{
                                    ...(curValue === trueObj.common.max ? undefined : styles.buttonInactive),
                                    width: '50%',
                                    ...this.customStyle,
                                }}
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
                                value={
                                    this.state.controlValue?.id === trueObj._id
                                        ? this.state.controlValue.value
                                        : curValue
                                }
                                step={parseFloat(this.state.rxData[`step${index}`]) || undefined}
                                valueLabelDisplay="auto"
                                min={trueObj.common.min}
                                max={trueObj.common.max}
                                onChangeCommitted={() => this.finishChanging()}
                                onChange={(_event, value) =>
                                    this.setState(
                                        {
                                            controlValue: {
                                                id: trueObj._id,
                                                value,
                                                changed: !!this.state.controlValue?.changed,
                                            },
                                        },
                                        () => this.props.context.setValue(trueObj._id, value),
                                    )
                                }
                            />
                        </div>
                    </>
                );
            } else if (trueObj.widgetType === 'rgb') {
                control = this.rgbRenderDialog(index);
            } else if (trueObj.widgetType === 'thermostat') {
                control = this.thermostatRenderDialog(index);
            } else if (trueObj.widgetType === 'lock') {
                // control = this.lockRenderDialog(index);
            } else if (trueObj.widgetType === 'vacuum') {
                control = this.vacuumRenderDialog(index);
            } else if (trueObj.widgetType === 'info') {
                if (this._refs[index]) {
                    // update width and height of chart container
                    setTimeout(() => this.checkChartWidth(), 50);

                    // draw chart
                    control = (
                        <div
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
                            obj={trueObj}
                            unit={trueObj.common.unit}
                            title={this.state.rxData[`title${index}`] || Generic.getText(trueObj.common.name)}
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
                        </div>
                    );
                } else {
                    control = <CircularProgress />;
                }
            } else {
                control = (
                    <div style={{ display: 'flex', gap: 16 }}>
                        <TextField
                            fullWidth
                            variant="standard"
                            // label={this.state.rxData[`title${index}`] || (trueObj?.common?.name) || ''}
                            value={
                                this.state.inputValue === undefined || this.state.inputValue === null
                                    ? ''
                                    : this.state.inputValue
                            }
                            slotProps={{
                                input: {
                                    endAdornment: trueObj.common.unit ? (
                                        <InputAdornment position="end">{trueObj.common.unit}</InputAdornment>
                                    ) : undefined,
                                },
                            }}
                            onKeyUp={event => {
                                if (event.key === 'Enter') {
                                    const values = JSON.parse(JSON.stringify(this.state.values));
                                    const oid = `${trueObj._id}.val`;
                                    values[oid] = this.state.inputValue;
                                    this.setState({ values, showControlDialog: null });
                                    if (trueObj.common.type === 'number') {
                                        this.props.context.setValue(
                                            this.state.rxData[`oid${index}`],
                                            parseFloat(values[oid]),
                                        );
                                    } else if (trueObj.common.type === 'boolean') {
                                        this.props.context.setValue(
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
                                        this.props.context.setValue(this.state.rxData[`oid${index}`], values[oid]);
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
                                const oid = `${trueObj._id}.val`;
                                values[oid] = this.state.inputValue;
                                this.setState({ values, showControlDialog: null });
                                if (trueObj.common.type === 'number') {
                                    this.props.context.setValue(
                                        this.state.rxData[`oid${index}`],
                                        parseFloat(values[oid]),
                                    );
                                } else if (trueObj.common.type === 'boolean') {
                                    this.props.context.setValue(
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
                                    this.props.context.setValue(this.state.rxData[`oid${index}`], values[oid]);
                                }
                            }}
                        >
                            <Check />
                        </Button>
                    </div>
                );
            }

            return (
                <Dialog
                    fullWidth
                    maxWidth="sm"
                    sx={{ '& .MuiDialog-paper': styles.rgbDialog }}
                    open={!0}
                    onClose={() => {
                        if (this.updateDialogChartInterval) {
                            clearInterval(this.updateDialogChartInterval);
                            this.updateDialogChartInterval = null;
                        }

                        this.setState({ showControlDialog: null });
                    }}
                >
                    <DialogTitle>
                        {(this.state.rxData[`title${index}`] || Generic.getText(trueObj.common?.name) || '').trim()}
                        <IconButton
                            style={{ float: 'right' }}
                            onClick={() => this.setState({ showControlDialog: null })}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>{control}</DialogContent>
                </Dialog>
            );
        }

        return null;
    }

    renderWidgetInWidget(index: number, asButton: boolean, visibility: boolean | 'disabled'): React.JSX.Element | null {
        const wid: AnyWidgetId = this.state.rxData[`widget${index}`];
        const widget: GroupWidget | SingleWidget | undefined =
            this.props.context.views[this.props.view]?.widgets?.[wid];

        if (widget && wid !== this.props.id) {
            // come again when the ref is filled
            if (!this.widgetRef[index].current) {
                setTimeout(() => this.forceUpdate(), 50);
            }
            const style: React.CSSProperties = asButton
                ? { justifyContent: 'center' }
                : { margin: 8, justifyContent: 'right' };
            if (asButton) {
                if (!this.state.rxData.orientation || this.state.rxData.orientation === 'h') {
                    style.width =
                        this.state.rxData[`width${index}`] ||
                        this.state.rxData.buttonsWidth ||
                        widget.style?.width ||
                        120;
                } else if (this.state.rxData.orientation === 'v') {
                    style.height =
                        this.state.rxData[`height${index}`] ||
                        this.state.rxData.buttonsHeight ||
                        widget.style?.height ||
                        80;
                } else if (this.state.rxData.orientation === 'f') {
                    style.width =
                        this.state.rxData[`width${index}`] ||
                        this.state.rxData.buttonsWidth ||
                        widget.style?.width ||
                        120;
                    style.height =
                        this.state.rxData[`height${index}`] ||
                        this.state.rxData.buttonsHeight ||
                        widget.style?.height ||
                        80;
                }

                if (this.state.selectedOne) {
                    style.border = '1px dashed gray';
                    style.boxSizing = 'border-box';
                }
            } else {
                style.height = this.state.rxData[`height${index}`] || widget.style?.height || 80;
                style.marginRight = this.state.rxData[`position${index}`];
            }

            if (!visibility || visibility === 'disabled') {
                style.opacity = 0.3;
            }

            return (
                <div
                    key={index}
                    ref={this.widgetRef[index]}
                    style={{
                        ...styles.widgetContainer,
                        ...style,
                        ...(visibility === 'disabled' ? { pointerEvents: 'none' } : undefined),
                    }}
                >
                    {this.widgetRef[index].current
                        ? this.getWidgetInWidget(this.props.view, wid, { refParent: this.widgetRef[index] })
                        : null}
                    {visibility === 'disabled' ? <div style={styles.disabledOverlay} /> : null}
                </div>
            );
        }
        return null;
    }

    renderLine(index: number): React.ReactNode {
        if (typeof this.state.objects[index] === 'string') {
            return this.renderWidgetInWidget(index, false, true);
        }
        if (!this.state.objects[index]) {
            return null;
        }
        const trueObj: HelperObject = this.state.objects[index];
        let value = this.state.values[`${trueObj._id}.val`];

        if (trueObj.widgetType === 'rgb') {
            let switchState = null;
            if (this.state.secondaryObjects[index].switch) {
                switchState = this.getPropertyValue(`switch${index}`);
            }

            let backgroundColor;
            if (switchState) {
                backgroundColor = this.state.rxData[`colorEnabled${index}`] || '#4DABF5';
            } else {
                backgroundColor =
                    this.state.rxData[`color${index}`] || (this.props.context.themeType === 'dark' ? '#111' : '#eee');
            }

            const iconStr = this.state.rxData[`icon${index}`];
            let icon: React.JSX.Element;
            const style: React.CSSProperties = {
                color: this.rgbGetColor(index),
            };
            if (switchState === false) {
                style.opacity = 0.7;
            }

            if (iconStr !== undefined) {
                if (!iconStr) {
                    style.borderRadius = '50%';
                    // just circle
                    icon = <div style={style} />;
                } else {
                    icon = (
                        <Icon
                            src={iconStr}
                            style={style}
                        />
                    );
                }
            } else {
                icon = <ColorLens style={style} />;
            }

            return (
                <IconButton
                    style={{
                        backgroundColor,
                        width: 36,
                        height: 36,
                    }}
                    onClick={() => this.setState({ showControlDialog: index })}
                >
                    {icon}
                </IconButton>
            );
        }

        if (trueObj.widgetType === 'vacuum') {
            return this.vacuumRenderButtons(index, true);
        }

        if (trueObj.widgetType === 'lock') {
            return this.lockRenderLine(index);
        }

        if (trueObj.widgetType === 'button') {
            const text = this.state.rxData[`buttonText${index}`];
            let icon = this.state.rxData[`buttonIcon${index}`] || this.state.rxData[`buttonImage${index}`];
            const iconActive =
                this.state.rxData[`buttonIconActive${index}`] || this.state.rxData[`buttonImageActive${index}`];
            if (iconActive && (value === '1' || value === 1 || value === true || value === 'true')) {
                icon = iconActive;
            }

            return (
                <Button
                    onKeyDown={() => this.buttonPressed(index, true)}
                    onKeyUp={() => this.buttonPressed(index, false)}
                    style={this.customStyle}
                >
                    {text ||
                        (icon ? (
                            <Icon
                                src={icon}
                                style={{ width: 24, height: 24 }}
                            />
                        ) : (
                            <RoomService />
                        ))}
                </Button>
            );
        }

        if (trueObj.widgetType === 'switch') {
            return (
                <Switch
                    checked={this.isOn(index)}
                    onChange={() => this.changeSwitch(index)}
                />
            );
        }

        if (trueObj.widgetType === 'slider') {
            const min = trueObj.common.min === undefined ? 0 : trueObj.common.min;
            const max = trueObj.common.max === undefined ? 100 : trueObj.common.max;
            return [
                <Slider
                    key="slider"
                    style={styles.controlElement}
                    size="small"
                    valueLabelDisplay="auto"
                    step={parseFloat(this.state.rxData[`step${index}`]) || undefined}
                    value={
                        this.state.controlValue?.id === trueObj._id
                            ? this.state.controlValue.value
                            : value === undefined || value === null
                              ? min
                              : value
                    }
                    onChange={(event, newValue) => {
                        this.setState(
                            {
                                controlValue: {
                                    id: trueObj._id,
                                    value: newValue,
                                    changed: !!this.state.controlValue?.changed,
                                },
                            },
                            () => {
                                let timeout = this.state.rxData[`timeout${index}`];
                                if (timeout === null || timeout === undefined || timeout === '') {
                                    timeout = 500;
                                }

                                if (timeout) {
                                    this.timeouts[index] ||= {};
                                    if (this.timeouts[index][trueObj._id]) {
                                        clearTimeout(this.timeouts[index][trueObj._id]!);
                                    }
                                    this.timeouts[index][trueObj._id] = setTimeout(
                                        (_newValue: number): void => {
                                            this.timeouts[index][trueObj._id] = null;
                                            this.props.context.setValue(trueObj._id, _newValue);
                                        },
                                        parseInt(timeout as string, 10),
                                        newValue,
                                    );
                                } else {
                                    this.props.context.setValue(trueObj._id, newValue);
                                }
                            },
                        );
                    }}
                    onChangeCommitted={() => this.finishChanging()}
                    min={min}
                    max={max}
                />,
                <div
                    key="value"
                    style={{ width: 45 }}
                >
                    {value + (trueObj.common.unit ? ` ${trueObj.common.unit}` : '')}
                </div>,
            ];
        }

        if (trueObj.widgetType === 'thermostat') {
            const min = trueObj.common.min === undefined ? 12 : trueObj.common.min;
            const max = trueObj.common.max === undefined ? 30 : trueObj.common.max;
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
                    style={styles.controlElement}
                    size="small"
                    step={parseFloat(this.state.rxData[`step${index}`]) || undefined}
                    valueLabelDisplay="auto"
                    value={
                        this.state.controlValue?.id === trueObj._id
                            ? this.state.controlValue.value
                            : value === undefined || value === null
                              ? min
                              : value
                    }
                    onChange={(event, newValue) => {
                        this.setState(
                            {
                                controlValue: {
                                    id: trueObj._id,
                                    value: newValue,
                                    changed: !!this.state.controlValue?.changed,
                                },
                            },
                            () => {
                                let timeout = this.state.rxData[`timeout${index}`];
                                if (timeout === null || timeout === undefined || timeout === '') {
                                    timeout = 500;
                                }

                                if (timeout) {
                                    this.timeouts[index] ||= {};
                                    if (this.timeouts[index][trueObj._id]) {
                                        clearTimeout(this.timeouts[index][trueObj._id]!);
                                    }
                                    this.timeouts[index][trueObj._id] = setTimeout(
                                        (_newValue: number): void => {
                                            this.timeouts[index][trueObj._id] = null;
                                            this.props.context.setValue(trueObj._id, _newValue);
                                        },
                                        parseInt(timeout as string, 10),
                                        newValue,
                                    );
                                } else {
                                    this.props.context.setValue(trueObj._id, newValue);
                                }
                            },
                        );
                    }}
                    onChangeCommitted={() => this.finishChanging()}
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
                    <div style={{ whiteSpace: 'nowrap' }}>
                        {value + (trueObj.common.unit ? ` ${trueObj.common.unit}` : '')}
                    </div>
                    {temp ? (
                        <div style={{ fontSize: 'smaller', opacity: 0.7, whiteSpace: 'nowrap' }}>
                            {temp + (trueObj.common.unit ? ` ${trueObj.common.unit}` : '')}
                        </div>
                    ) : null}
                </div>,
            ];
        }

        if (trueObj.widgetType === 'input') {
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
                        if (e.key === 'Enter') {
                            const values = JSON.parse(JSON.stringify(this.state.values));
                            const oid = `${trueObj._id}.val`;
                            values[oid] = this.state.inputValues[index];
                            this.setState({ values });
                            if (trueObj.common.type === 'number') {
                                this.props.context.setValue(this.state.rxData[`oid${index}`], parseFloat(values[oid]));
                            } else if (trueObj.common.type === 'boolean') {
                                this.props.context.setValue(
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
                                this.props.context.setValue(this.state.rxData[`oid${index}`], values[oid]);
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
                    label={this.state.rxData[`title${index}`] || Generic.getText(trueObj?.common?.name) || ''}
                    value={
                        !this.state.showSetButton[index]
                            ? value === null || value === undefined
                                ? ''
                                : value
                            : this.state.inputValues[index]
                    }
                    slotProps={{
                        input: {
                            endAdornment: trueObj.common.unit ? (
                                <InputAdornment position="end">{trueObj.common.unit}</InputAdornment>
                            ) : undefined,
                        },
                    }}
                    onChange={event => {
                        const inputValues = [];
                        inputValues[index] = event.target.value;
                        this.setState({ inputValues });
                    }}
                />,
                this.state.showSetButton[index] ? (
                    <Button
                        key="button"
                        variant="contained"
                        style={this.customStyle}
                        onClick={() => {
                            const values = JSON.parse(JSON.stringify(this.state.values));
                            const oid = `${trueObj._id}.val`;
                            values[oid] = this.state.inputValues[index];
                            const showSetButton = [...this.state.showSetButton];
                            showSetButton[index] = false;
                            this.setState({ values, showSetButton });
                            if (trueObj.common.type === 'number') {
                                this.props.context.setValue(
                                    this.state.rxData[`oid${index}`],
                                    parseFloat(values[oid].replace(',', '.')),
                                );
                            } else if (trueObj.common.type === 'boolean') {
                                this.props.context.setValue(
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
                                this.props.context.setValue(this.state.rxData[`oid${index}`], values[oid]);
                            }
                        }}
                    >
                        <Check />
                    </Button>
                ) : null,
            ];
        }

        if (trueObj.widgetType === 'select') {
            let states;
            if (trueObj.common.states) {
                states = Object.keys(trueObj.common.states).map(state => ({
                    label: state,
                    value: (trueObj.common.states as Record<string, string>)[state],
                }));
            } else if (trueObj.common.type === 'boolean') {
                states = [
                    { label: Generic.t('ON'), value: true },
                    { label: Generic.t('OFF'), value: false },
                ];
            } else if (trueObj.common.type === 'number') {
                const min = trueObj.common.min === undefined ? 0 : trueObj.common.min;
                const max = trueObj.common.max === undefined ? 100 : trueObj.common.max;
                const step =
                    parseInt(this.state.rxData[`step${index}`], 10) ||
                    (trueObj.common.step === undefined ? (max - min) / 10 : trueObj.common.step);
                states = [];
                for (let i = min; i <= max; i += step) {
                    states.push({ label: i + (trueObj.common.unit || ''), value: i });
                    if (value > i && value < i + step) {
                        states.push({ label: value + (trueObj.common.unit || ''), value });
                    }
                }
            } else {
                states = [];
            }

            return (
                <FormControl fullWidth>
                    <InputLabel style={states.find(item => item.value === value) ? styles.selectLabel : undefined}>
                        {this.state.rxData[`title${index}`] || Generic.getText(trueObj?.common?.name) || ''}
                    </InputLabel>
                    <Select
                        variant="standard"
                        value={value !== undefined ? value : ''}
                        onChange={event => {
                            const values = JSON.parse(JSON.stringify(this.state.values));
                            const oid = `${trueObj._id}.val`;
                            values[oid] = event.target.value;
                            this.setState({ values });
                            this.props.context.setValue(this.state.rxData[`oid${index}`], values[oid]);
                        }}
                    >
                        {states.map(state => (
                            <MenuItem
                                key={state.value}
                                value={state.value}
                            >
                                {state.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        }

        if (trueObj.common.type === 'number') {
            if (trueObj.widgetType === 'blinds') {
                const options = this.getMinMaxPosition(1, index);
                value = parseFloat(value);
                value = ((value - options.min) / (options.max - options.min)) * 100;
                if (options.invert) {
                    value = 100 - value;
                }
            }

            value = this.formatValue(value);
        }

        // info
        this.checkHistory(index).catch(e => window.alert(`Cannot check history: ${e}`));

        if (value === null || value === undefined) {
            value = '--';
        }

        let icon;
        let text;
        let color;
        let val = false;
        if (
            trueObj.common.type === 'boolean' ||
            trueObj.common.type === 'number' ||
            value === 0 ||
            value === 1 ||
            value === '0' ||
            value === '1' ||
            value === true ||
            value === 'true' ||
            value === false ||
            value === 'false'
        ) {
            if (
                value === true ||
                value === 'true' ||
                value === 1 ||
                value === '1' ||
                value === 'on' ||
                value === 'ON' ||
                value === 'On' ||
                value === 'ein' ||
                value === 'EIN' ||
                value === 'Ein' ||
                value === 'an' ||
                value === 'AN' ||
                value === 'An'
            ) {
                val = true;
            }
            const colorInactive = this.state.rxData[`infoInactiveColor${index}`] || this.state.rxData[`color${index}`];
            if (val) {
                const colorActive =
                    this.state.rxData[`infoActiveColor${index}`] || this.state.rxData[`colorEnabled${index}`];
                const diffColors = colorActive && colorInactive && colorActive !== colorInactive;
                icon = this.state.rxData[`infoActiveIcon${index}`] || this.state.rxData[`infoActiveImage${index}`];
                if (!icon && diffColors) {
                    icon =
                        this.state.rxData[`infoInactiveIcon${index}`] || this.state.rxData[`infoInactiveImage${index}`];
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

        if (trueObj.widgetType === 'blinds') {
            let height = 40; // take 10° for opened slash
            const width = 40;
            height -= 0.12 * width;
            text = (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                    }}
                >
                    <span>{value}%</span>
                    {this.renderWindows({ height, width }, index)}
                </div>
            );
        }

        let staticElem;
        if (text) {
            staticElem = <span style={{ color }}>{text}</span>;
        } else if (icon) {
            staticElem = (
                <Icon
                    src={icon}
                    style={{ width: 24, height: 24, color }}
                />
            );
        } else {
            staticElem = (
                <span style={{ color }}>{value + (trueObj.common.unit ? ` ${trueObj.common.unit}` : '')}</span>
            );
        }

        // todo: history for booleans
        if (this._refs[index] && trueObj.common.type === 'number') {
            setTimeout(() => this.checkChartWidth(), 50);
            return (
                <div
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
                </div>
            );
        }

        return <div style={styles.infoData}>{staticElem}</div>;
    }

    checkChartWidth(): void {
        for (let i = 0; i < this._refs.length; ++i) {
            const ref = this._refs[i];
            if (ref?.current) {
                const width = ref.current.offsetWidth;
                const height = ref.current.offsetHeight;
                if (width !== this.state.chartWidth[i] || height !== this.state.chartHeight[i]) {
                    const chartWidth = { ...this.state.chartWidth };
                    const chartHeight = { ...this.state.chartHeight };
                    chartWidth[i] = width;
                    chartHeight[i] = height;
                    this.setState({ chartWidth, chartHeight });
                }
            }
        }
    }

    drawChart(index: number, style?: React.CSSProperties): React.ReactNode {
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

            return (
                <ReactEchartsCore
                    style={{ ...styles.chart, ..._style }}
                    echarts={echarts}
                    option={this.state.historyData[index]}
                    notMerge
                    lazyUpdate
                    theme={this.props.context.themeType === 'dark' ? 'dark' : ''}
                    opts={{ renderer: 'svg' }}
                />
            );
        }

        return null;
    }

    async checkHistory(index: number, doNotRequestData?: boolean): Promise<void> {
        if (!this.state.objects[index] || typeof this.state.objects[index] === 'string') {
            return;
        }
        const trueObj: HelperObject = this.state.objects[index];

        const custom = trueObj.common.custom;

        if (!custom || this.state.rxData[`hideChart${index}`]) {
            trueObj.common.history = false;

            if (this._refs[index]) {
                this._refs[index] = null;
            }
            if (this.history[index]) {
                this.history[index] = null;
            }
            let count = 0;
            for (let i = 0; i < this.history.length; i++) {
                if (this.history[i]) {
                    count++;
                }
            }

            if (!count) {
                if (this.updateChartInterval) {
                    clearInterval(this.updateChartInterval);
                    this.updateChartInterval = null;
                }
                if (this.updateDialogChartInterval) {
                    clearInterval(this.updateDialogChartInterval);
                    this.updateDialogChartInterval = null;
                }
                this.history = [];
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
        if (trueObj.common.history) {
            return;
        }

        // remember that it is checked
        trueObj.common.history = true;

        let historyInstance;
        // first check default history and if it is alive
        if (custom[this.props.context.systemConfig.common.defaultHistory]) {
            const alive = await this.props.context.socket.getState(
                `system.adapter.${this.props.context.systemConfig.common.defaultHistory}.alive`,
            );
            if (alive?.val) {
                historyInstance = this.props.context.systemConfig.common.defaultHistory;
            }
        }

        if (!historyInstance) {
            // find the first live history instance
            const keys = Object.keys(custom);
            for (let i = 0; i < keys.length; i++) {
                // we checked already it
                if (keys[i] === this.props.context.systemConfig.common.defaultHistory) {
                    continue;
                }
                const adapter = keys[i].split('.')[0];
                if (HISTORY.includes(adapter)) {
                    const alive = await this.props.context.socket.getState(`system.adapter.${keys[i]}.alive`);
                    if (alive?.val) {
                        historyInstance = keys[i];
                        break;
                    }
                }
            }
        }

        if (historyInstance) {
            this._refs[index] = this._refs[index] || React.createRef();

            // try to read history for last hour
            this.history[index] = historyInstance;
            if (!doNotRequestData) {
                this.updateChartInterval ||= setInterval(() => this.updateCharts(), 60000);

                this.updateCharts(index);
            }
        }
    }

    updateCharts(index?: number): void {
        let indexesToUpdate: number[];
        if (index !== undefined) {
            indexesToUpdate = [index];
        } else {
            indexesToUpdate = [];
            for (let i = 0; i < this.history.length; i++) {
                if (this.history[i]) {
                    indexesToUpdate.push(i);
                }
            }
        }

        for (let i = 0; i < indexesToUpdate.length; i++) {
            (_index => {
                if (
                    !this.state.objects[_index] ||
                    typeof this.state.objects[_index] === 'string' ||
                    !this.state.objects[_index]._id
                ) {
                    return;
                }
                const trueObj: HelperObject = this.state.objects[_index];

                void this.props.context.socket
                    .getHistory(trueObj._id, {
                        instance: this.history[_index]!,
                        start: Date.now() - (parseInt(this.state.rxData[`chartPeriod${_index}`], 10) || 60) * 60000,
                        aggregate: 'minmax',
                        step: 60000,
                    })
                    .then(result => {
                        // console.log(`Result: ${JSON.stringify(result)}`);
                        if (result) {
                            const historyData = { ...this.state.historyData };
                            const data: [ts: number, val: number][] = [];
                            let min: number = (result[0]?.val as number) || 0;
                            let max: number = (result[0]?.val as number) || 0;
                            for (let j = 0; j < result.length; j++) {
                                const item = result[j];
                                if (item.val !== null && min > (item.val as number)) {
                                    min = item.val as number;
                                }
                                if (item.val !== null && max < (item.val as number)) {
                                    max = item.val as number;
                                }
                                data.push([item.ts, item.val as number]);
                            }

                            const withGrid = this.state.rxData.type !== 'lines';

                            const serie: SeriesOption = {
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

                            const yAxis: YAXisOption = {
                                type: 'value',
                                show: withGrid,
                                boundaryGap: [0, '100%'],
                                splitLine: {
                                    show: withGrid,
                                },
                                min,
                                max,
                            };
                            let tooltip: TooltipOption;

                            if (withGrid) {
                                yAxis.axisTick = {
                                    // @ts-expect-error fix later
                                    alignWithLabel: true,
                                };
                                yAxis.axisLabel = {
                                    formatter: value => {
                                        let text;
                                        if (this.props.context.systemConfig.common.isFloatComma) {
                                            text = value.toString().replace(',', '.') + (trueObj.common.unit || '');
                                        } else {
                                            text = value + (trueObj.common.unit || '');
                                        }

                                        return text;
                                    },
                                    showMaxLabel: true,
                                    showMinLabel: true,
                                };
                                delete yAxis.min;
                                delete yAxis.max;

                                if (trueObj.common.type === 'boolean') {
                                    serie.step = 'end';
                                    yAxis.axisLabel.showMaxLabel = false;
                                    yAxis.axisLabel.formatter = value => (value === 1 ? 'TRUE' : 'FALSE');
                                    yAxis.max = 1.5;
                                    yAxis.interval = 1;
                                    // widthAxis = 50;
                                } else if (trueObj.common.type === 'number' && trueObj.common.states) {
                                    serie.step = 'end';
                                    yAxis.axisLabel.showMaxLabel = false;
                                    yAxis.axisLabel.formatter = value =>
                                        (trueObj.common.states as Record<string, string>)[value] ?? value;
                                    const keys = Object.keys(trueObj.common.states);
                                    keys.sort();
                                    yAxis.max = parseFloat(keys[keys.length - 1]) + 0.5;
                                    yAxis.interval = 1;
                                    // let max = '';
                                    // for (let i = 0; i < keys.length; i++) {
                                    //     if (typeof trueObj.common.states[keys[i]] === 'string' && trueObj.common.states[keys[i]].length > max.length) {
                                    //         max = trueObj.common.states[keys[i]];
                                    //     }
                                    // }
                                    // widthAxis = ((max.length * 9) || 50) + 12;
                                } else if (trueObj.common.type === 'number') {
                                    if (trueObj.common.min !== undefined && trueObj.common.max !== undefined) {
                                        yAxis.max = trueObj.common.max;
                                        yAxis.min = trueObj.common.min;
                                    } else if (trueObj.common.unit === '%') {
                                        yAxis.max = 100;
                                        yAxis.min = 0;
                                    }
                                }

                                tooltip = {
                                    trigger: 'axis',
                                    formatter: (params: any): string => {
                                        const param = (params as FormatterParam[])[0];
                                        const date = new Date(param.value[0]);
                                        let value: number | string = param.value[1];
                                        if (value !== null && this.props.context.systemConfig.common.isFloatComma) {
                                            value = value.toString().replace('.', ',');
                                        }
                                        return (
                                            `${param.exact === false ? 'i' : ''}${date.toLocaleString()}.${date.getMilliseconds().toString().padStart(3, '0')}: ` +
                                            `${value}${trueObj.common.unit || ''}`
                                        );
                                    },
                                    axisPointer: {
                                        animation: true,
                                    },
                                };
                            }

                            historyData[_index] = {
                                backgroundColor: 'transparent',
                                grid: withGrid
                                    ? { top: 10, right: 0 }
                                    : {
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
                                // @ts-expect-error todo
                                tooltip,
                            };

                            const newState: Partial<SwitchesState> = { historyData };
                            if (
                                this._refs[_index]?.current?.offsetWidth &&
                                (this.state.chartWidth[_index] !== this._refs[_index].current.offsetWidth ||
                                    this.state.chartHeight[_index] !== this._refs[_index].current.offsetHeight)
                            ) {
                                newState.chartWidth = { ...this.state.chartWidth };
                                newState.chartHeight = { ...this.state.chartHeight };
                                newState.chartWidth[_index] = this._refs[_index].current.offsetWidth;
                                newState.chartHeight[_index] = this._refs[_index].current.offsetHeight;
                            }
                            this.setState(newState as any);
                        }
                    });
            })(indexesToUpdate[i]);
        }
    }

    renderButton(index: number, icon: React.JSX.Element | undefined): React.JSX.Element | null {
        const visibility = this.checkLineVisibility(index);
        if ((!visibility && !this.props.editMode) || !this.state.objects[index]) {
            return null;
        }
        if (typeof this.state.objects[index] === 'string') {
            return this.renderWidgetInWidget(index, true, visibility);
        }
        const trueObj: HelperObject = this.state.objects[index];
        let value;
        let secondary = null;
        const style: React.CSSProperties = {};

        if (trueObj.widgetType !== 'rgb') {
            value = this.state.values[`${trueObj._id}.val`];
            if (trueObj.common?.type === 'number' || trueObj.common?.states) {
                if (trueObj.common.states && (trueObj.common.states as Record<string, string>)[value] !== undefined) {
                    value = (trueObj.common.states as Record<string, string>)[value];
                } else {
                    if (trueObj.widgetType === 'blinds') {
                        const options = this.getMinMaxPosition(1, index);
                        value = parseFloat(value);
                        value = ((value - options.min) / (options.max - options.min)) * 100;
                        if (options.invert) {
                            value = 100 - value;
                        }
                    }

                    value = this.formatValue(value);
                }
            }
        }

        if (trueObj.widgetType === 'info') {
            this.checkHistory(index).catch(e => console.error(`Cannot read history: ${e}`));
        } else if (trueObj.widgetType === 'blinds') {
            let height = 40; // take 10° for opened slash
            const width = 40;
            height -= 0.12 * width;
            icon = this.renderWindows({ height, width }, index);
        } else if (trueObj.widgetType === 'rgb') {
            let switchState = null;
            if (this.state.secondaryObjects[index].switch) {
                switchState = this.getPropertyValue(`switch${index}`);
            }

            style.backgroundColor =
                switchState === null || switchState
                    ? this.rgbGetColor(index)
                    : this.props.context.themeType === 'dark'
                      ? '#111'
                      : '#eee';
            style.color = Utils.getInvertedColor(style.backgroundColor, this.props.context.themeType);

            icon = (
                <ColorLens
                    style={{
                        color: switchState === null || switchState ? undefined : this.rgbGetColor(index),
                    }}
                />
            );
        } else if (trueObj.widgetType === 'thermostat') {
            const actualObj = this.state.secondaryObjects[index]?.actual;
            if (actualObj) {
                const actualTemp = this.state.values[`${actualObj._id}.val`];
                if (actualTemp || actualTemp === 0) {
                    secondary = (
                        <div style={styles.secondaryValueDiv}>
                            /
                            <span style={styles.secondaryValue}>
                                {this.formatValue(actualTemp, 1)}
                                {this.state.rxData[`unit${index}`] || actualObj.common?.unit || ''}
                            </span>
                        </div>
                    );
                }
            }
        } else if (trueObj.widgetType === 'vacuum') {
            const status = this.vacuumGetValue(index, 'status');
            const statusColor = vacuumGetStatusColor(status as string);

            icon = <VacuumCleanerIcon style={{ color: statusColor, width: '100%', height: '100%' }} />;
            value = (
                <span style={{ color: statusColor }}>
                    {Generic.t(status as string).replace('vis_2_widgets_material_', '')}
                </span>
            );
        }

        let buttonWidth = 120;
        let buttonHeight = 80;
        if (!this.state.rxData.orientation || this.state.rxData.orientation === 'h') {
            buttonWidth = parseInt(this.state.rxData[`width${index}`], 10) || this.state.rxData.buttonsWidth || 120;
        } else if (this.state.rxData.orientation === 'v') {
            buttonHeight = this.state.rxData[`height${index}`] || this.state.rxData.buttonsHeight || 80;
        } else if (this.state.rxData.orientation === 'f') {
            buttonWidth = parseInt(this.state.rxData[`width${index}`], 10) || this.state.rxData.buttonsWidth || 120;
            buttonHeight = this.state.rxData[`height${index}`] || this.state.rxData.buttonsHeight || 80;
        }

        if (trueObj.widgetType === 'lock') {
            return this.lockRenderLine(index, buttonWidth, buttonHeight);
        }

        return (
            <div
                key={index}
                style={{
                    ...styles.buttonDiv,
                    width: buttonWidth || undefined,
                    height: buttonHeight || undefined,
                    border: this.state.selectedOne ? '1px dashed gray' : 'none',
                    boxSizing: 'border-box',
                    opacity: visibility && visibility !== 'disabled' ? undefined : 0.3,
                    ...(visibility === 'disabled' ? { pointerEvents: 'none' } : undefined),
                }}
            >
                <Button
                    onClick={() => this.changeSwitch(index)}
                    color={!trueObj.common?.states && this.isOn(index) ? 'primary' : 'grey'}
                    style={{
                        ...styles.button,
                        ...(!this.isOn(index) ? styles.buttonInactive : undefined),
                        ...style,
                    }}
                    disabled={
                        trueObj.widgetType === 'info' &&
                        (!this.history[index] || this.state.rxData[`hideChart${index}`])
                    }
                >
                    {icon ? <div style={styles.iconButton}>{icon}</div> : null}
                    <div style={{ ...styles.text, ...this.customStyle }}>
                        {this.state.rxData[`title${index}`] || Generic.getText(trueObj.common?.name) || ''}
                    </div>
                    {(value !== undefined && value !== null) || secondary ? (
                        <div style={styles.value}>
                            <div>{value}</div>
                            {this.state.rxData[`unit${index}`] || trueObj.common?.unit || ''}
                            {secondary}
                        </div>
                    ) : null}
                </Button>
                {visibility === 'disabled' ? <div style={styles.disabledOverlay} /> : null}
            </div>
        );
    }

    lockRenderUnlockDialog(): React.ReactNode {
        if (this.state.dialogPin === null) {
            return null;
        }
        const index = this.state.dialogPin.index;
        const pincode = this.lockGetPinCode(index);
        const pincodeReturnButton =
            this.state.rxData[`pincodeReturnButton${index}`] === 'backspace' ? 'backspace' : 'submit';

        return (
            <Dialog
                open={!0}
                onClose={() => this.setState({ dialogPin: null })}
            >
                <DialogTitle>{Generic.t('enter_pin')}</DialogTitle>
                <DialogContent>
                    <div style={styles.lockPinInput}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            type={this.state.invalidPin ? 'text' : 'password'}
                            slotProps={{
                                input: {
                                    readOnly: true,
                                    style: {
                                        textAlign: 'center',
                                        color: this.state.invalidPin ? '#ff3e3e' : 'inherit',
                                    },
                                },
                            }}
                            value={this.state.invalidPin ? Generic.t('invalid_pin') : this.state.lockPinInput}
                        />
                    </div>
                    <div style={styles.lockPinGrid}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'R', 0, pincodeReturnButton].map(button => {
                            let buttonTitle: React.JSX.Element | string | number = button;
                            if (button === 'backspace') {
                                buttonTitle = <Backspace />;
                            } else if (button === 'submit') {
                                buttonTitle = <Check />;
                            }
                            return (
                                <Button
                                    variant="outlined"
                                    key={button}
                                    title={
                                        button === 'R'
                                            ? this.state.lockPinInput
                                                ? Generic.t('reset')
                                                : Generic.t('close')
                                            : button === pincodeReturnButton
                                              ? 'enter'
                                              : ''
                                    }
                                    onClick={() => {
                                        if (button === 'submit') {
                                            if (this.state.lockPinInput === pincode) {
                                                if (this.state.dialogPin!.oid === 'open') {
                                                    this.props.context.setValue(
                                                        this.state.rxData[`open${index}`],
                                                        true,
                                                    );
                                                } else {
                                                    this.props.context.setValue(this.state.rxData[`oid${index}`], true);
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
                                                if (this.state.dialogPin!.oid === 'open') {
                                                    this.props.context.setValue(
                                                        this.state.rxData[`open${index}`],
                                                        true,
                                                    );
                                                } else {
                                                    this.props.context.setValue(this.state.rxData[`oid${index}`], true);
                                                }
                                                this.setState({ dialogPin: null });
                                            }
                                        }
                                    }}
                                >
                                    {buttonTitle === 'R' ? (this.state.lockPinInput ? 'R' : 'x') : buttonTitle}
                                </Button>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    lockGetPinCode(index: number): string {
        return this.state.rxData[`oid-pincode${index}`]
            ? this.getPropertyValue(`oid-pincode${index}`)
            : this.state.rxData[`pincode${index}`];
    }

    lockRenderConfirmDialog(): React.ReactNode {
        if (!this.state.lockConfirmDialog) {
            return null;
        }
        const index = this.state.lockConfirmDialog.index;
        return (
            <Dialog
                open={!0}
                onClose={() => this.setState({ lockConfirmDialog: null })}
            >
                <DialogContent>{Generic.t('please_confirm')}</DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            this.setState({ lockConfirmDialog: null });
                            if (this.state.lockConfirmDialog!.oid === 'open') {
                                this.props.context.setValue(this.state.rxData[`open${index}`], true);
                            } else {
                                this.props.context.setValue(this.state.rxData[`oid${index}`], true);
                            }
                        }}
                        startIcon={
                            this.state.lockConfirmDialog.oid === 'open' ? <DoorOpenedIcon /> : <LockOpenedIcon />
                        }
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
            </Dialog>
        );
    }

    lockRenderLine(index: number, buttonWidth?: number, buttonHeight?: number): React.JSX.Element | null {
        if (!this.state.objects[index] || typeof this.state.objects[index] === 'string') {
            return null;
        }
        const trueObj: HelperObject = this.state.objects[index];

        let size = 30;
        if (buttonWidth) {
            size = Math.min((buttonWidth - 32) / 2, buttonHeight! - 16);
        }

        const doorOpened = this.state.rxData[`sensor${index}`] && this.getPropertyValue(`sensor${index}`);
        const lockOpened = this.getPropertyValue(`oid${index}`);
        const working = this.state.rxData[`working${index}`] && this.getPropertyValue(`working${index}`);

        const content = (
            <div style={{ display: 'flex' }}>
                {this.state.rxData[`sensor${index}`] || this.state.rxData[`open${index}`] ? (
                    <IconButton
                        key="door"
                        disabled={!this.state.rxData[`open${index}`]}
                        title={this.state.rxData[`open${index}`] ? Generic.t('open_door') : undefined}
                        onClick={() => {
                            if (this.lockGetPinCode(index)) {
                                this.setState({ dialogPin: { oid: 'open', index }, lockPinInput: '' });
                            } else if (this.state.rxData[`doNotConfirm${index}`]) {
                                this.props.context.setValue(this.state.rxData[`open${index}`], true);
                            } else {
                                this.setState({ lockConfirmDialog: { oid: 'open', index } });
                            }
                        }}
                    >
                        <DoorAnimation
                            open={doorOpened}
                            size={size}
                        />
                    </IconButton>
                ) : null}
                {this.state.rxData[`oid${index}`] ? (
                    <IconButton
                        key="lock"
                        title={lockOpened ? Generic.t('close_lock') : Generic.t('open_lock')}
                        onClick={() => {
                            if (!lockOpened && this.lockGetPinCode(index)) {
                                this.setState({ dialogPin: { oid: 'oid', index }, lockPinInput: '' });
                            } else if (lockOpened || this.state.rxData[`doNotConfirm${index}`]) {
                                this.props.context.setValue(
                                    this.state.rxData[`oid${index}`],
                                    !this.getPropertyValue(`oid${index}`),
                                );
                            } else {
                                this.setState({ lockConfirmDialog: { oid: 'oid', index } });
                            }
                        }}
                    >
                        {working ? (
                            <CircularProgress
                                style={styles.workingIcon}
                                size={size}
                            />
                        ) : null}
                        {this.state.rxData[`noLockAnimation${index}`] ? (
                            lockOpened ? (
                                <LockOpenedIcon
                                    style={{ ...styles.lockSvgIcon, width: size, height: size }}
                                    sx={theme => ({ color: theme.palette.primary.main })}
                                />
                            ) : (
                                <LockClosedIcon style={{ ...styles.lockSvgIcon, width: size, height: size }} />
                            )
                        ) : (
                            <LockAnimation
                                style={{
                                    marginTop: -4,
                                }}
                                open={lockOpened}
                                size={size}
                                color={this.state.rxData[`lockColor${index}`]}
                            />
                        )}
                    </IconButton>
                ) : null}
            </div>
        );

        if (!buttonWidth) {
            return content;
        }

        const title = this.state.rxData[`title${index}`] || Generic.getText(trueObj.common.name) || '';
        if (!title) {
            return content;
        }
        return (
            <div
                key={index}
                style={{
                    ...styles.buttonDiv,
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
                <div>{title}</div>
            </div>
        );
    }

    thermostatObjectIDs(index: number, ids: string[]): void {
        const _ids: ('oid' | 'actual' | 'boost' | 'party')[] = ['oid', 'actual', 'boost', 'party'] as (
            | 'oid'
            | 'actual'
            | 'boost'
            | 'party'
        )[];
        _ids.forEach(id => {
            const _id: `${'oid' | 'actual' | 'boost' | 'party'}${number}` = `${id}${index}`;
            if (this.state.rxData[_id] && this.state.rxData[_id] !== 'nothing_selected') {
                ids.push(this.state.rxData[_id]);
            }
        });
    }

    thermostatReadObjects(
        index: number,
        _objects: Record<string, ioBroker.StateObject>,
        objects: (HelperObject | null | string)[],
        secondaryObjects: (Partial<Record<SecondaryNames, ioBroker.StateObject>> | null)[],
    ): void {
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
                common: {} as ioBroker.StateCommon,
                _id: id,
            };
        }

        id = this.state.rxData[`actual${index}`];
        secondaryObjects[index] = {};
        if (_objects[id]) {
            secondaryObjects[index].actual = { common: _objects[id].common, _id: id, type: 'state', native: {} };
        } else {
            secondaryObjects[index] = null;
        }
    }

    thermIsWithPowerButton(index: number): boolean {
        return !!this.state.rxData[`switch${index}`] && this.state.rxData[`switch${index}`] !== 'nothing_selected';
    }

    thermIsWithModeButtons(index: number): boolean {
        return !!(
            (this.state.rxData[`party${index}`] || this.state.rxData[`boost${index}`]) &&
            // if no power button or power is on
            (!this.state.rxData[`switch${index}`] || this.state.values[`${this.state.rxData[`switch${index}`]}.val`])
        );
    }

    thermostatRenderDialog(index: number): React.ReactNode {
        if (!this.state.objects[index] || typeof this.state.objects[index] === 'string') {
            return null;
        }
        const trueObj: HelperObject = this.state.objects[index];
        let tempValue: null | number = null;
        if (trueObj._id) {
            tempValue = this.state.values[`${trueObj._id}.val`];
            if (tempValue === undefined) {
                tempValue = null;
            }
            if (tempValue !== null && trueObj.common.min !== undefined && tempValue < trueObj.common.min) {
                tempValue = trueObj.common.min;
            } else if (tempValue !== null && trueObj.common.max !== undefined && tempValue > trueObj.common.max) {
                tempValue = trueObj.common.max;
            }

            if (tempValue === null && trueObj.common.min !== undefined && trueObj.common.max !== undefined) {
                tempValue = (trueObj.common.max - trueObj.common.min) / 2 + trueObj.common.min;
            }
        }

        const actualObj = this.state.secondaryObjects[index]?.actual;
        let actualTemp: null | number | string = null;
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

        const arcColor =
            this.props.customSettings?.viewStyle?.overrides?.palette?.primary?.main ||
            this.props.context.theme?.palette.primary.main ||
            '#448aff';

        const modesButton = [];
        if (this.thermIsWithModeButtons(index)) {
            if (this.state.rxData[`party${index}`]) {
                let currentValueStr = this.state.values[`${this.state.rxData[`party${index}`]}.val`];
                if (currentValueStr === null || currentValueStr === undefined) {
                    currentValueStr = false;
                } else {
                    currentValueStr = currentValueStr === '1' || currentValueStr === 'true' || currentValueStr === true;
                }
                modesButton.push(
                    <Button
                        key="party"
                        color={currentValueStr ? 'primary' : 'grey'}
                        onClick={() => {
                            let _currentValueStr = this.state.values[`${this.state.rxData[`party${index}`]}.val`];
                            if (_currentValueStr === null || _currentValueStr === undefined) {
                                _currentValueStr = false;
                            } else {
                                _currentValueStr =
                                    _currentValueStr === '1' ||
                                    _currentValueStr === 'true' ||
                                    _currentValueStr === true;
                            }
                            const values = JSON.parse(JSON.stringify(this.state.values));
                            values[`${this.state.rxData[`party${index}`]}.val`] = !_currentValueStr;
                            this.setState(values);
                            this.props.context.setValue(this.state.rxData[`party${index}`], !_currentValueStr);
                        }}
                        startIcon={<CelebrationIcon />}
                    >
                        {Generic.t('Party')}
                    </Button>,
                );
            }
            if (this.state.rxData[`boost${index}`]) {
                let currentValueStr = this.state.values[`${this.state.rxData[`boost${index}`]}.val`];
                if (currentValueStr === null || currentValueStr === undefined) {
                    currentValueStr = false;
                } else {
                    currentValueStr = currentValueStr === '1' || currentValueStr === 'true' || currentValueStr === true;
                }
                modesButton.push(
                    <Button
                        key="boost"
                        color={currentValueStr ? 'primary' : 'grey'}
                        onClick={() => {
                            let _currentValueStr = this.state.values[`${this.state.rxData[`boost${index}`]}.val`];
                            if (_currentValueStr === null || _currentValueStr === undefined) {
                                _currentValueStr = false;
                            } else {
                                _currentValueStr =
                                    _currentValueStr === '1' ||
                                    _currentValueStr === 'true' ||
                                    _currentValueStr === true;
                            }
                            const values = JSON.parse(JSON.stringify(this.state.values));
                            values[`${this.state.rxData[`boost${index}`]}.val`] = !_currentValueStr;
                            this.setState(values);
                            this.props.context.setValue(this.state.rxData[`boost${index}`], !_currentValueStr);
                        }}
                        startIcon={<BoostIcon />}
                    >
                        {Generic.t('Boost')}
                    </Button>,
                );
            }
        }
        if (this.thermIsWithPowerButton(index)) {
            modesButton.push(
                <Tooltip
                    key="power"
                    title={Generic.t('power').replace('vis_2_widgets_material_', '')}
                    slotProps={{ popper: { sx: styles.tooltip } }}
                >
                    <IconButton
                        // @ts-expect-error grey is OK
                        color={this.state.values[`${this.state.rxData[`switch${index}`]}.val`] ? 'primary' : 'grey'}
                        onClick={() => {
                            const values = JSON.parse(JSON.stringify(this.state.values));
                            const id = `${this.state.rxData[`switch${index}`]}.val`;
                            values[id] = !values[id];
                            this.setState(values);
                            this.props.context.setValue(this.state.rxData[`switch${index}`], values[id]);
                        }}
                    >
                        <PowerSettingsNewIcon />
                    </IconButton>
                </Tooltip>,
            );
        }

        return (
            <Box
                component="div"
                sx={styles.thermostatCircleDiv}
                style={{ height: '100%' }}
            >
                {/* if no header, draw button here */}
                {size && trueObj ? (
                    <CircularSliderWithChildren
                        minValue={trueObj.common.min}
                        maxValue={trueObj.common.max}
                        size={size}
                        arcColor={arcColor}
                        arcBackgroundColor={this.props.context.themeType === 'dark' ? '#DDD' : '#222'}
                        startAngle={40}
                        handleSize={handleSize}
                        endAngle={320}
                        handle1={{
                            value: tempValue || 0,
                            onChange: value => {
                                const values = JSON.parse(JSON.stringify(this.state.values));
                                if (this.state.rxData[`step${index}`] === '0.5') {
                                    values[`${trueObj._id}.val`] = Math.round(value * 2) / 2;
                                } else {
                                    values[`${trueObj._id}.val`] = Math.round(value);
                                }
                                this.setState({ values });
                            },
                        }}
                        onControlFinished={() =>
                            this.props.context.setValue(trueObj._id, this.state.values[`${trueObj._id}.val`])
                        }
                    >
                        {tempValue !== null ? (
                            <Tooltip
                                title={Generic.t('desired_temperature')}
                                slotProps={{ popper: { sx: styles.tooltip } }}
                            >
                                <div
                                    style={{
                                        ...styles.thermostatDesiredTemp,
                                        fontSize: Math.round(size / 6),
                                        ...this.customStyle,
                                    }}
                                >
                                    <ThermostatIcon style={{ width: size / 8, height: size / 8 }} />
                                    <div style={{ display: 'flex', alignItems: 'top', ...this.customStyle }}>
                                        {this.formatValue(tempValue)}
                                        <span style={{ fontSize: Math.round(size / 12), fontWeight: 'normal' }}>
                                            {this.state.rxData[`unit${index}`] || trueObj.common?.unit}
                                        </span>
                                    </div>
                                </div>
                            </Tooltip>
                        ) : null}
                        {actualTemp !== null ? (
                            <style>
                                {`
@keyframes vis-2-widgets-material-newValueAnimationLight {
    0% {
        color: #00bd00;
    },
    80% {
        color: #008000;
    },
    100% {
        color: #000;
    }
}

@keyframes vis-2-widgets-material-newValueAnimationDark {
    0% {
        color: #008000;
    }
    80% {
        color: #00bd00;
    }
    100% {
        color: #ffffff;
    }
}                          
                            `}
                            </style>
                        ) : null}
                        {actualTemp !== null ? (
                            <Tooltip
                                title={Generic.t('actual_temperature')}
                                slotProps={{ popper: { sx: styles.tooltip } }}
                            >
                                <div
                                    style={{
                                        ...(this.props.context.themeType === 'dark'
                                            ? styles.thermostatNewValueDark
                                            : styles.thermostatNewValueLight),
                                        fontSize: Math.round((size * 0.6) / 6),
                                        opacity: 0.7,
                                        ...this.customStyle,
                                    }}
                                    key={`${actualTemp}valText`}
                                >
                                    {actualTemp}
                                    {this.state.rxData[`unit${index}`] || actualObj?.common?.unit}
                                </div>
                            </Tooltip>
                        ) : null}
                    </CircularSliderWithChildren>
                ) : null}
                <div style={{ ...styles.thermostatButtonsDiv, bottom: 8 }}>{modesButton}</div>
            </Box>
        );
    }

    rgbGetIdMin = (index: number, id: SecondaryNames): number => {
        if (id === 'color_temperature') {
            return (
                parseInt(this.state.rxData[`ct_min${index}`] as string, 10) ||
                this.state.secondaryObjects[index][id]?.common?.min ||
                0
            );
        }
        return this.state.secondaryObjects[index][id]?.common?.min || 0;
    };

    rgbGetIdMax = (index: number, id: SecondaryNames): number => {
        if (id === 'color_temperature') {
            return (
                parseInt(
                    (this.state.rxData[`ct_max${index}`] as string) ||
                        (this.state.secondaryObjects[index][id]?.common?.max as any as string),
                    10,
                ) || 0
            );
        }
        return this.state.secondaryObjects[index][id]?.common?.min || 0;
    };

    rgbSetId = (index: number, id: SecondaryNames, value: number | string | boolean, slider?: boolean): void => {
        if (this.state.secondaryObjects[index][id]) {
            this.timeouts ||= {};
            this.timeouts[index] ||= {};
            // @ts-expect-error ignore it
            const oid: string = this.state.rxData[id + index];

            if (this.timeouts[index][id]) {
                clearTimeout(this.timeouts[index][id]);
            }

            if (slider) {
                this.setState(
                    { controlValue: { id: oid, value: value as number, changed: !!this.state.controlValue?.changed } },
                    () => {
                        this.timeouts[index][id] = setTimeout(
                            () => {
                                this.timeouts[index][id] = null;
                                this.props.context.setValue(oid, value);
                            },
                            parseInt(this.state.rxData[`timeout${index}`] as string, 10) || 200,
                        );
                    },
                );
            } else {
                // control switch directly without timeout
                if (id === 'switch' || id === 'white_mode') {
                    const values: VisRxWidgetStateValues = { ...this.state.values, [`switch${index}.val`]: value };
                    this.setState({ values }, () => {
                        this.props.context.setValue(this.state.rxData[`switch${index}`], value);
                    });
                } else {
                    const values: VisRxWidgetStateValues = { ...this.state.values, [`${oid}.val`]: value };
                    this.setState({ values }, () => {
                        this.timeouts[index][id] = setTimeout(
                            () => {
                                this.timeouts[index][id] = null;
                                this.props.context.setValue(oid, value);
                            },
                            parseInt(this.state.rxData[`timeout${index}`] as string, 10) || 200,
                        );
                    });
                }
            }
        }
    };

    rgbObjectIDs(index: number, ids: string[]): void {
        RGB_NAMES.forEach(name => {
            const attr: `${RGB_NAMES_TYPE}${number}` = `${name}${index}`;

            if (this.state.rxData[attr] && this.state.rxData[attr] !== 'nothing_selected') {
                ids.push(this.state.rxData[attr]);
            }
        });

        ids.push(this.state.rxData[`oid${index}`]);
    }

    rgbReadObjects(
        index: number,
        _objects: Record<string, ioBroker.StateObject>,
        objects: (HelperObject | null | string)[],
        secondaryObjects: Partial<Record<SecondaryNames, ioBroker.StateObject>>[],
    ): void {
        const _rgbObjects: Partial<Record<SecondaryNames, ioBroker.StateObject>> = {};

        RGB_NAMES.forEach(name => {
            const attr: `${RGB_NAMES_TYPE}${number}` = `${name}${index}`;
            const oid: string | undefined = this.state.rxData[attr];
            if (oid) {
                const object = _objects[oid];
                if (object) {
                    _rgbObjects[name] = object;
                }
            }
        });

        _rgbObjects.oid = _objects[this.state.rxData[`oid${index}`]];

        secondaryObjects[index] = _rgbObjects;

        if (_rgbObjects.color_temperature) {
            const colors = [];
            const minCt =
                parseInt(
                    (this.state.rxData[`ct_min${index}`] as string) ||
                        (_rgbObjects.color_temperature?.common?.min as any as string) ||
                        '0',
                    10,
                ) || 2700;
            const maxCt =
                parseInt(
                    (this.state.rxData[`ct_max${index}`] as string) ||
                        (_rgbObjects.color_temperature?.common?.max as any as string) ||
                        '0',
                    10,
                ) || 6000;
            const step = (maxCt - minCt) / 20;
            for (let i = minCt; i <= maxCt; i += step) {
                colors.push(colorTemperatureToRGB(i));
            }
            // @ts-expect-error fix later
            _rgbObjects.color_temperature.colors = colors;
        }

        objects[index] = {
            widgetType: 'rgb',
            common: _rgbObjects.oid?.common,
            _id: this.state.rxData[`oid${index}`],
        };
    }

    rgbDestroy(): void {
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

    rgbIsOnlyHue = (index: number): boolean =>
        this.state.rxData[`rgbType${index}`] === 'hue/sat/lum' &&
        (!this.state.secondaryObjects[index].saturation || !this.state.secondaryObjects[index].luminance);

    rgbGetWheelColor = (index: number): HsvaColor => {
        let result: HsvaColor = {
            h: 0,
            s: 0,
            v: 0,
            a: 1,
        };

        if (this.state.rxData[`rgbType${index}`] === 'hue/sat/lum') {
            result = hslaToHsva({
                h: this.getPropertyValue(`hue${index}`),
                s: this.rgbIsOnlyHue(index) ? 100 : this.getPropertyValue(`saturation${index}`),
                l: this.rgbIsOnlyHue(index) ? 50 : this.getPropertyValue(`luminance${index}`),
                a: 1,
            });
        } else if (
            this.state.rxData[`rgbType${index}`] === 'r/g/b' ||
            this.state.rxData[`rgbType${index}`] === 'r/g/b/w'
        ) {
            result = rgbaToHsva({
                r: this.getPropertyValue(`red${index}`),
                g: this.getPropertyValue(`green${index}`),
                b: this.getPropertyValue(`blue${index}`),
                a: 1,
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

        if (this.state.rxData[`hideBrightness${index}`]) {
            result.v = 100;
        }
        return result;
    };

    rgbSetWheelColor = (index: number, color: HsvaColor): void => {
        if (this.state.rxData[`rgbType${index}`] === 'hue/sat/lum') {
            const _color = hsvaToHsla(color);
            this.rgbSetId(index, 'hue', _color.h);
            if (!this.rgbIsOnlyHue(index)) {
                this.rgbSetId(index, 'saturation', _color.s);
                this.rgbSetId(index, 'luminance', _color.l);
            }
        } else if (
            this.state.rxData[`rgbType${index}`] === 'r/g/b' ||
            this.state.rxData[`rgbType${index}`] === 'r/g/b/w'
        ) {
            const _color = hsvaToRgba(color);
            this.rgbSetId(index, 'red', _color.r);
            this.rgbSetId(index, 'green', _color.g);
            this.rgbSetId(index, 'blue', _color.b);
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

    rgbGetWhite = (index: number): number => {
        if (this.state.rxData[`rgbType${index}`] === 'r/g/b/w') {
            return this.getPropertyValue(`white${index}`);
        }
        if (this.state.rxData[`rgbType${index}`] === 'rgbw') {
            if (this.state.secondaryObjects[index].white) {
                return this.getPropertyValue(`white${index}`) as number;
            }

            const val = this.getPropertyValue(`oid${index}`)?.substring(7);
            return parseInt(val, 16);
        }
        return 0;
    };

    rgbGetWhiteId = (index: number): string => {
        if (this.state.rxData[`rgbType${index}`] === 'r/g/b/w') {
            return this.state.rxData[`white${index}`];
        }
        if (this.state.rxData[`rgbType${index}`] === 'rgbw') {
            if (this.state.secondaryObjects[index].white) {
                return this.state.rxData[`white${index}`];
            }

            return this.state.rxData[`oid${index}`];
        }
        return '';
    };

    rgbSetWhite = (index: number, color: number): void => {
        if (this.state.rxData[`rgbType${index}`] === 'r/g/b/w') {
            this.rgbSetId(index, 'white', color, true);
        } else if (this.state.rxData[`rgbType${index}`] === 'rgbw') {
            if (this.state.secondaryObjects[index].white) {
                this.rgbSetId(index, 'white', color, true);
            } else {
                let val = this.getPropertyValue(`oid${index}`) || '#00000000';
                val = val.substring(0, 7) + color.toString(16).padStart(2, '0');
                this.rgbSetId(index, 'oid', val, true);
            }
        }
    };

    rgbSetWhiteMode = (index: number, value: boolean): void => {
        if (!this.state.rxData[`white_mode${index}`]) {
            this.rgbSetId(index, 'white_mode', !!value);
        }
    };

    rgbGetWhiteMode = (index: number): null | boolean => {
        if (!this.state.rxData[`white_mode${index}`]) {
            return null;
        }
        return this.getPropertyValue(`white_mode${index}`);
    };

    rgbIsRgb = (index: number): boolean => {
        if (
            (this.state.rxData[`rgbType${index}`] === 'rgb' || this.state.rxData[`rgbType${index}`] === 'rgbw') &&
            this.state.rxData[`oid${index}`]
        ) {
            return true;
        }

        return (
            (this.state.rxData[`rgbType${index}`] === 'r/g/b' || this.state.rxData[`rgbType${index}`] === 'r/g/b/w') &&
            !!this.state.secondaryObjects[index].red &&
            !!this.state.secondaryObjects[index].green &&
            !!this.state.secondaryObjects[index].blue
        );
    };

    rgbIsWhite = (index: number): boolean =>
        (this.state.rxData[`rgbType${index}`] === 'rgbw' && !!this.state.rxData[`oid${index}`]) ||
        (this.state.rxData[`rgbType${index}`] === 'r/g/b/w' && !!this.state.secondaryObjects[index].white);

    rgbIsHSL = (index: number): boolean =>
        this.state.rxData[`rgbType${index}`] === 'hue/sat/lum' && !!this.state.secondaryObjects[index].hue;

    rgbRenderSwitch(index: number): React.ReactNode {
        return (
            this.state.secondaryObjects[index].switch && (
                <div
                    style={{
                        ...styles.rgbSliderContainer,
                        justifyContent: 'center',
                    }}
                >
                    {Generic.t('Off')}
                    <Switch
                        checked={this.getPropertyValue(`switch${index}`) || false}
                        onChange={e => this.rgbSetId(index, 'switch', e.target.checked)}
                    />
                    {Generic.t('On')}
                </div>
            )
        );
    }

    rgbRenderBrightness(index: number): React.ReactNode {
        return (
            this.state.secondaryObjects[index].brightness && (
                <div style={styles.rgbSliderContainer}>
                    <Tooltip
                        title={Generic.t('Brightness')}
                        slotProps={{ popper: { sx: styles.tooltip } }}
                    >
                        <Brightness6 />
                    </Tooltip>
                    <Slider
                        min={this.rgbGetIdMin(index, 'brightness') || 0}
                        max={this.rgbGetIdMax(index, 'brightness') || 100}
                        valueLabelDisplay="auto"
                        value={
                            this.state.controlValue?.id === this.state.rxData[`brightness${index}`]
                                ? this.state.controlValue.value
                                : this.getPropertyValue(`brightness${index}`) || 0
                        }
                        onChange={(e, value) => this.rgbSetId(index, 'brightness', value, true)}
                        onChangeCommitted={() => this.finishChanging()}
                    />
                </div>
            )
        );
    }

    rgbRenderSketch(index: number): React.ReactNode {
        return (
            <div
                className="dark"
                style={styles.rgbWheel}
            >
                <Sketch
                    color={this.rgbGetWheelColor(index)}
                    disableAlpha
                    onChange={color => this.rgbSetWheelColor(index, color.hsva)}
                />
            </div>
        );
    }

    rgbRenderWheelTypeSwitch(
        index: number,
        isWheelVisible: boolean,
        twoPanels: boolean,
        whiteMode?: boolean,
    ): React.ReactNode {
        if (!isWheelVisible) {
            return null;
        }
        if (whiteMode === null && this.state.rxData[`noRgbPalette${index}`]) {
            return null;
        }

        return (
            !this.rgbIsOnlyHue(index) && (
                <div style={{ textAlign: twoPanels ? 'right' : undefined }}>
                    {whiteMode !== null ? (
                        <Tooltip
                            title={Generic.t('Switch white mode')}
                            slotProps={{ popper: { sx: styles.tooltip } }}
                        >
                            <IconButton
                                onClick={() => this.rgbSetWhiteMode(index, !whiteMode)}
                                color={whiteMode ? 'primary' : 'default'}
                            >
                                <WbAuto />
                            </IconButton>
                        </Tooltip>
                    ) : null}
                    {!this.state.rxData[`noRgbPalette${index}`] && whiteMode !== true ? (
                        <Tooltip
                            title={Generic.t('Switch color picker')}
                            slotProps={{ popper: { sx: styles.tooltip } }}
                        >
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
                    ) : null}
                </div>
            )
        );
    }

    rgbRenderBrightnessSlider(index: number, isWheelVisible: boolean, whiteMode: boolean): React.ReactNode {
        if (!isWheelVisible || this.state.sketch[index] || whiteMode || this.state.rxData[`hideBrightness${index}`]) {
            return null;
        }
        return (
            !this.rgbIsOnlyHue(index) && (
                <ShadeSlider
                    hsva={this.rgbGetWheelColor(index)}
                    onChange={shade => this.rgbSetWheelColor(index, { ...this.rgbGetWheelColor(index), ...shade })}
                />
            )
        );
    }

    rgbRenderWheel(index: number, isWheelVisible: boolean, whiteMode: boolean): React.ReactNode {
        if (!isWheelVisible || whiteMode === true) {
            return null;
        }
        return this.state.sketch[index] ? (
            this.rgbRenderSketch(index)
        ) : (
            <div style={styles.rgbWheel}>
                <Wheel
                    color={this.rgbGetWheelColor(index)}
                    onChange={color => {
                        color = JSON.parse(JSON.stringify(color));
                        this.rgbSetWheelColor(index, color.hsva);
                    }}
                />
            </div>
        );
    }

    rgbRenderWhite(index: number): React.ReactNode {
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
        const oid = this.rgbGetWhiteId(index);

        return (
            <div style={styles.rgbSliderContainer}>
                <TbSquareLetterW style={{ width: 24, height: 24 }} />
                <Slider
                    min={min}
                    max={max}
                    valueLabelDisplay="auto"
                    value={
                        this.state.controlValue?.id === oid
                            ? this.state.controlValue.value
                            : this.rgbGetWhite(index) || 0
                    }
                    onChange={(e, value) => this.rgbSetWhite(index, value)}
                    onChangeCommitted={() => this.finishChanging()}
                />
            </div>
        );
    }

    rgbRenderColorTemperature(index: number, whiteMode: boolean): React.ReactNode {
        if (this.state.rxData[`rgbType${index}`] !== 'ct' || whiteMode) {
            return null;
        }
        const oid = this.state.rxData[`color_temperature${index}`];

        return (
            <div style={styles.rgbSliderContainer}>
                <Tooltip
                    title={Generic.t('Color temperature')}
                    slotProps={{ popper: { sx: styles.tooltip } }}
                >
                    <Thermostat />
                </Tooltip>
                <div
                    style={{
                        ...styles.rgbSliderContainer,
                        // @ts-expect-error fix later
                        background: `linear-gradient(to right, ${this.state.secondaryObjects[index].color_temperature.colors.map(c => `rgb(${c.red}, ${c.green}, ${c.blue})`).join(', ')})`,
                        flex: '1',
                        borderRadius: 4,
                    }}
                >
                    <Slider
                        valueLabelDisplay="auto"
                        min={this.rgbGetIdMin(index, 'color_temperature') || 2700}
                        max={this.rgbGetIdMax(index, 'color_temperature') || 6000}
                        value={
                            this.state.controlValue?.id === oid
                                ? this.state.controlValue.value
                                : this.state.values[`${oid}.val`] || 0
                        }
                        onChange={(e, value) => this.rgbSetId(index, 'color_temperature', value, true)}
                        onChangeCommitted={() => this.finishChanging()}
                    />
                </div>
            </div>
        );
    }

    rgbRenderDialog(index: number): React.ReactNode {
        const wheelVisible = this.rgbIsRgb(index) || this.rgbIsHSL(index);
        const whiteMode = !!this.rgbGetWhiteMode(index);

        return (
            <div style={styles.rgbDialogContainer}>
                {this.rgbRenderSwitch(index)}
                {this.rgbRenderBrightness(index)}
                {this.rgbRenderWhite(index)}
                {this.rgbRenderWheelTypeSwitch(index, wheelVisible, false, whiteMode)}
                {this.rgbRenderWheel(index, wheelVisible, whiteMode)}
                {this.rgbRenderBrightnessSlider(index, wheelVisible, whiteMode)}
                {this.rgbRenderColorTemperature(index, whiteMode)}
            </div>
        );
    }

    rgbGetColor = (index: number): string => {
        if (this.state.rxData[`rgbType${index}`] === 'ct') {
            const color = colorTemperatureToRGB(this.getPropertyValue(`color_temperature${index}`));
            return rgbaToHex({
                r: color.red,
                g: color.green,
                b: color.blue,
                a: 1,
            });
        }
        return hsvaToHex(this.rgbGetWheelColor(index));
    };

    vacuumObjectIDs(index: number, ids: string[]): void {
        const keys = Object.keys(VACUUM_ID_ROLES) as VACUUM_ID_ROLES_TYPE[];
        for (let k = 0; k < keys.length; k++) {
            const oid = this.state.rxData[`vacuum-${keys[k]}-oid${index}`];
            if (oid) {
                ids.push(oid);
            }
        }
    }

    async vacuumReadObjects(
        index: number,
        _objects: Record<string, ioBroker.StateObject>,
        objects: (HelperObject | null | string)[],
        secondaryObjects: Partial<Record<SecondaryNames, ioBroker.StateObject>>[],
    ): Promise<void> {
        secondaryObjects[index] = {};

        objects[index] = {
            widgetType: 'vacuum',
            common: {
                name: Generic.t('vacuum'),
            } as ioBroker.StateCommon,
            _id: '',
        };

        const keys: VACUUM_ID_ROLES_TYPE[] = Object.keys(VACUUM_ID_ROLES) as VACUUM_ID_ROLES_TYPE[];
        // read all objects at once
        Object.values(_objects).forEach(obj => {
            const oid = keys.find(_oid => this.state.rxData[`vacuum-${_oid}-oid${index}`] === obj._id);
            if (oid) {
                secondaryObjects[index][oid] = obj;
            }
        });

        (secondaryObjects[index] as any).rooms = await this.vacuumLoadRooms(index);
    }

    async vacuumLoadRooms(index: number): Promise<null | { value: string; label: string }[]> {
        if (this.state.rxData[`vacuum-use-rooms${index}`]) {
            // try to detect the `rooms` object according to status OID
            // mihome-vacuum.0.info.state => mihome-vacuum.0.rooms
            if (this.state.rxData[`vacuum-status-oid${index}`]) {
                const parts = this.state.rxData[`vacuum-status-oid${index}`].split('.');
                if (parts.length === 4) {
                    parts.pop();
                    parts.pop();
                    parts.push('rooms');
                    const rooms = await this.props.context.socket.getObjectViewSystem(
                        'channel',
                        `${parts.join('.')}.room`,
                        `${parts.join('.')}.room\u9999`,
                    );
                    const result: { value: string; label: string }[] = [];
                    Object.keys(rooms).forEach(id =>
                        result.push({
                            value: `${id}.roomClean`,
                            label: Generic.getText(rooms[id].common?.name || id.split('.').pop() || ''),
                        }),
                    );
                    result.sort((a, b) => a.label.localeCompare(b.label));
                    return result;
                }
            }
        }

        return null;
    }

    vacuumGetValue(index: number, id: SecondaryNames, numberValue?: boolean): number | null | string {
        const obj = this.vacuumGetObj(index, id);
        if (!obj) {
            return null;
        }
        const value = this.state.values[`${obj._id}.val`];
        if (!numberValue && obj.common?.states) {
            if (
                (obj.common.states as Record<string, string>) !== undefined &&
                (obj.common.states as Record<string, string>)[value] !== null
            ) {
                return (obj.common.states as Record<string, string>)[value];
            }
        }
        return value;
    }

    vacuumGetObj(index: number, id: SecondaryNames): ioBroker.StateObject | undefined {
        if (!this.state.secondaryObjects[index]) {
            return undefined;
        }
        return this.state.secondaryObjects[index][id];
    }

    vacuumRenderBattery(index: number): React.JSX.Element | null {
        return this.vacuumGetObj(index, 'battery') ? (
            <div style={styles.vacuumBattery}>
                {this.vacuumGetObj(index, 'is-charging') && this.vacuumGetValue(index, 'is-charging') ? (
                    <BatteryChargingFull />
                ) : (
                    <BatteryFull />
                )}
                {this.vacuumGetValue(index, 'battery') || 0} {this.vacuumGetObj(index, 'battery')!.common?.unit}
            </div>
        ) : null;
    }

    vacuumRenderSpeed(index: number): React.ReactNode {
        const obj = this.vacuumGetObj(index, 'fan-speed');
        if (!obj) {
            return null;
        }
        let options: Record<string, string> = {};
        if (Array.isArray(obj.common.states)) {
            const result: Record<string, string> = {};
            obj.common.states.forEach(item => (result[item] = item));
            options = result;
        } else {
            options = (obj.common.states as Record<string, string>) || {};
        }

        let value = this.vacuumGetValue(index, 'fan-speed', true);
        if (value === null || value === undefined) {
            value = '';
        }
        value = value.toString();

        return [
            <Button
                key="speed"
                style={styles.vacuumSpeedContainer}
                endIcon={<FanIcon />}
                onClick={e => {
                    e.stopPropagation();
                    this.setState({ showSpeedMenu: e.currentTarget });
                }}
            >
                {options[value] !== undefined && options[value] !== null
                    ? Generic.t(options[value]).replace('vis_2_widgets_material_', '')
                    : value}
            </Button>,
            this.state.showSpeedMenu ? (
                <Menu
                    open={!0}
                    anchorEl={this.state.showSpeedMenu}
                    key="speedMenu"
                    onClose={() => this.setState({ showSpeedMenu: null })}
                >
                    {Object.keys(options).map(state => (
                        <MenuItem
                            key={state}
                            selected={value === state}
                            onClick={() => {
                                const _value = state;
                                this.setState({ showSpeedMenu: null }, () =>
                                    this.props.context.setValue(
                                        this.state.rxData[`vacuum-fan-speed-oid${index}`],
                                        _value,
                                    ),
                                );
                            }}
                        >
                            {Generic.t(options[state]).replace('vis_2_widgets_material_', '')}
                        </MenuItem>
                    ))}
                </Menu>
            ) : null,
        ];
    }

    vacuumRenderRooms(index: number): React.ReactNode {
        const rooms: null | { value: string; label: string }[] = (this.state.secondaryObjects[index] as any)?.rooms;
        if (!rooms?.length) {
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
            this.state.showRoomsMenu ? (
                <Menu
                    onClose={() => this.setState({ showRoomsMenu: null })}
                    open={!0}
                    anchorEl={this.state.showRoomsMenu}
                    key="roomsMenu"
                >
                    {rooms.map(room => (
                        <MenuItem
                            key={room.value}
                            value={room.value}
                            onClick={() => {
                                // build together mihome-vacuum.0.rooms.room1.roomClean
                                const id = room.value;
                                this.setState({ showRoomsMenu: null }, () => this.props.context.setValue(id, true));
                            }}
                        >
                            {room.label}
                        </MenuItem>
                    ))}
                </Menu>
            ) : null,
        ];
    }

    vacuumRenderSensors(index: number): React.ReactNode {
        const sensors: ('filter-left' | 'side-brush-left' | 'main-brush-left' | 'sensors-left' | 'cleaning-count')[] = [
            'filter-left',
            'side-brush-left',
            'main-brush-left',
            'sensors-left',
            'cleaning-count',
        ].filter(sensor => this.vacuumGetObj(index, sensor as SecondaryNames)) as (
            | 'filter-left'
            | 'side-brush-left'
            | 'main-brush-left'
            | 'sensors-left'
            | 'cleaning-count'
        )[];

        return sensors.length ? (
            <div style={styles.vacuumSensorsContainer}>
                <div style={styles.vacuumSensors}>
                    {sensors.map(sensor => {
                        const object = this.vacuumGetObj(index, sensor)!;

                        return (
                            <Card
                                key={sensor}
                                style={styles.vacuumSensorCard}
                            >
                                <CardContent style={{ ...styles.vacuumSensorCardContent, paddingBottom: 2 }}>
                                    <div>
                                        <span style={styles.vacuumSensorBigText}>
                                            {this.vacuumGetValue(index, sensor) || 0}
                                        </span>{' '}
                                        <span style={styles.vacuumSensorSmallText}>{object.common.unit}</span>
                                    </div>
                                    <div>
                                        <span style={styles.vacuumSensorSmallText}>
                                            {Generic.t(sensor.replaceAll('-', '_'))}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        ) : null;
    }

    vacuumRenderButtons(index: number, withDialog?: boolean): React.ReactNode {
        let statusColor;
        const statusObj = this.vacuumGetObj(index, 'status');
        let status: string | undefined;
        let smallStatus;
        if (statusObj) {
            status = this.vacuumGetValue(index, 'status') as string;
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

        return (
            <div
                style={{ ...styles.vacuumButtons, cursor: withDialog ? 'pointer' : undefined }}
                onClick={
                    withDialog
                        ? e => {
                              e.stopPropagation();
                              e.preventDefault();
                              this.setState({ showControlDialog: index });
                          }
                        : undefined
                }
            >
                {this.vacuumGetObj(index, 'start') &&
                    (!smallStatus || !VACUUM_CLEANING_STATES.includes(smallStatus)) && (
                        <Tooltip
                            title={Generic.t('Start')}
                            slotProps={{ popper: { sx: styles.tooltip } }}
                        >
                            <IconButton
                                onClick={
                                    withDialog
                                        ? undefined
                                        : () =>
                                              this.props.context.setValue(
                                                  this.state.rxData[`vacuum-start-oid${index}`],
                                                  true,
                                              )
                                }
                            >
                                <PlayArrow />
                            </IconButton>
                        </Tooltip>
                    )}
                {this.vacuumGetObj(index, 'pause') &&
                    (!smallStatus || !VACUUM_PAUSE_STATES.includes(smallStatus)) &&
                    (!smallStatus || !VACUUM_CHARGING_STATES.includes(smallStatus)) && (
                        <Tooltip
                            title={Generic.t('Pause')}
                            slotProps={{ popper: { sx: styles.tooltip } }}
                        >
                            <IconButton
                                onClick={
                                    withDialog
                                        ? undefined
                                        : () =>
                                              this.props.context.setValue(
                                                  this.state.rxData[`vacuum-pause-oid${index}`],
                                                  true,
                                              )
                                }
                            >
                                <Pause />
                            </IconButton>
                        </Tooltip>
                    )}
                {this.vacuumGetObj(index, 'home') &&
                    (!smallStatus || !VACUUM_CHARGING_STATES.includes(smallStatus)) && (
                        <Tooltip
                            title={Generic.t('Home')}
                            slotProps={{ popper: { sx: styles.tooltip } }}
                        >
                            <IconButton
                                onClick={
                                    withDialog
                                        ? undefined
                                        : () =>
                                              this.props.context.setValue(
                                                  this.state.rxData[`vacuum-home-oid${index}`],
                                                  true,
                                              )
                                }
                            >
                                <Home />
                            </IconButton>
                        </Tooltip>
                    )}
                {statusObj && (
                    <Tooltip
                        title={Generic.t('Status')}
                        slotProps={{ popper: { sx: styles.tooltip } }}
                    >
                        <div style={{ color: statusColor }}>
                            {Generic.t((status || '').toString()).replace('vis_2_widgets_material_', '')}
                        </div>
                    </Tooltip>
                )}
            </div>
        );
    }

    vacuumRenderMap(index: number): React.ReactNode {
        const obj = this.vacuumGetObj(index, 'map64');
        if (!obj) {
            if (this.state.rxData[`vacuum-use-default-picture${index}`]) {
                return <VacuumCleanerIcon style={styles.vacuumImage} />;
            }
            if (this.state.rxData[`vacuum-own-image${index}`]) {
                return (
                    <Icon
                        src={this.state.rxData[`vacuum-own-image${index}`]}
                        style={styles.vacuumImage}
                    />
                );
            }
            return null;
        }

        return (
            <img
                src={this.state.values[`${obj._id}.val`]}
                alt="vacuum"
                style={styles.vacuumImage}
            />
        );
    }

    vacuumRenderDialog(index: number): React.ReactNode {
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

        return (
            <div style={styles.vacuumContent}>
                {battery || rooms ? (
                    <div style={styles.vacuumTopPanel}>
                        {rooms}
                        {battery}
                    </div>
                ) : null}
                {map ? (
                    <div style={{ ...styles.vacuumMapContainer, height: `calc(100% - ${height}px)`, width: '100%' }}>
                        {map}
                    </div>
                ) : null}
                {sensors}
                {buttons || speed ? (
                    <div style={styles.vacuumBottomPanel}>
                        {buttons}
                        {speed}
                    </div>
                ) : null}
            </div>
        );
    }

    checkLineVisibility(index: number): boolean | 'disabled' {
        const oid = this.state.rxData[`visibility-oid${index}`];
        if (!oid) {
            return true;
        }
        const condition = this.state.rxData[`visibility-cond${index}`] || '==';

        let val = this.state.values[`${oid}.val`];

        if (val === undefined || val === null) {
            return condition === 'not exist';
        }

        let value: string | number | boolean = this.state.rxData[`visibility-val${index}`];

        const isHide: boolean | 'disabled' = this.state.rxData[`visibility-no-hide${index}`] ? 'disabled' : false;

        if (value === undefined || value === null) {
            return condition === 'not exist';
        }

        if (val === 'null' && condition !== 'exist' && condition !== 'not exist') {
            return false;
        }

        const t = typeof val;
        if (t === 'boolean' || val === 'false' || val === 'true') {
            // @ts-expect-error could be
            value = value === 'true' || value === true || value === 1 || value === '1';
        } else if (t === 'number') {
            value = parseFloat(value);
        } else if (t === 'object') {
            val = JSON.stringify(val);
        }

        // Take care: return true if the widget is hidden!
        switch (condition) {
            case '==':
                value = value.toString();
                val = val.toString();
                if (val === '1') {
                    val = 'true';
                }
                if (value === '1') {
                    value = 'true';
                }
                if (val === '0') {
                    val = 'false';
                }
                if (value === '0') {
                    value = 'false';
                }
                return value !== val ? true : isHide;
            case '!=':
                value = value.toString();
                val = val.toString();
                if (val === '1') {
                    val = 'true';
                }
                if (value === '1') {
                    value = 'true';
                }
                if (val === '0') {
                    val = 'false';
                }
                if (value === '0') {
                    value = 'false';
                }
                return value === val ? true : isHide;
            case '>=':
                return val < value ? true : isHide;
            case '<=':
                return val > value ? true : isHide;
            case '>':
                return val <= value ? true : isHide;
            case '<':
                return val >= value ? true : isHide;
            case 'consist':
                value = value.toString();
                val = val.toString();
                return !val.toString().includes(value) ? true : isHide;
            case 'not consist':
                value = value.toString();
                val = val.toString();
                return val.toString().includes(value) ? true : isHide;
            case 'exist':
                return val === 'null';
            case 'not exist':
                return val !== 'null' ? true : isHide;
            default:
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                console.log(`[${this.props.id} / Line ${index}] Unknown visibility condition: ${condition}`);
                return false;
        }
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element[] | React.JSX.Element | null {
        super.renderWidgetBody(props);
        this.customStyle = {};
        if (this.state.rxStyle) {
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
        }
        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData !== actualRxData) {
            this.updateTimeout ||= setTimeout(async () => {
                this.updateTimeout = null;
                await this.propertiesUpdate();
            }, 50);
        }
        let allSwitchValue: boolean | null = null;
        let intermediate: boolean | undefined;
        const items: number[] = [];
        for (let idx = 0; idx < this.state.objects.length; idx++) {
            if (this.state.objects[idx] && !this.state.rxData[`hide${idx}`]) {
                items.push(idx);
            }
        }

        if (
            this.state.rxData.type === 'lines' &&
            items
                .filter(index => typeof this.state.objects[index] !== 'string')
                .find(index => (this.state.objects[index] as HelperObject).widgetType === 'switch')
        ) {
            allSwitchValue = items
                .filter(index => (this.state.objects[index] as HelperObject).widgetType === 'switch')
                .every(index => this.isOn(index));

            intermediate = !!items
                .filter(index => (this.state.objects[index] as HelperObject).widgetType === 'switch')
                .find(index => this.isOn(index) !== allSwitchValue);
        }

        const icons: (React.JSX.Element | undefined)[] = items.map(index => this.getStateIcon(index));
        const anyIcon = !!icons.find(icon => icon);

        const content = (
            <>
                {this.lockRenderUnlockDialog()}
                {this.lockRenderConfirmDialog()}
                {this.renderControlDialog()}
                {this.renderBlindsDialog()}
                {this.state.rxData.type === 'lines' ? (
                    // LINES
                    // index from 1, i from 0
                    items.map((index, i) => {
                        const visible = this.checkLineVisibility(index);
                        if (!this.props.editMode && !visible) {
                            return null;
                        }
                        const style: React.CSSProperties = {};
                        if (this.state.rxData[`widget${index}`] && this.state.rxData[`height${index}`]) {
                            style.height = this.state.rxData[`widget${index}`];
                        }
                        if (!visible || visible === 'disabled') {
                            style.opacity = 0.3;
                        }

                        return (
                            <div
                                style={{
                                    ...styles.cardsHolder,
                                    ...style,
                                    ...(visible === 'disabled' ? { pointerEvents: 'none' } : undefined),
                                }}
                                key={index}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                    {anyIcon ? <span style={styles.iconSwitch}>{icons[i]}</span> : null}
                                    {(this.state.objects[index] as HelperObject).widgetType !== 'input' &&
                                    (this.state.objects[index] as HelperObject).widgetType !== 'select' ? (
                                        <span style={{ color: this.getColor(index), paddingLeft: 16 }}>
                                            {this.state.rxData[`title${index}`] ||
                                                Generic.getText(
                                                    (this.state.objects[index] as HelperObject).common?.name,
                                                ) ||
                                                ''}
                                        </span>
                                    ) : null}
                                </span>
                                {this.renderLine(index)}
                                {visible === 'disabled' ? <div style={styles.disabledOverlay} /> : null}
                            </div>
                        );
                    })
                ) : (
                    // BUTTONS
                    <div
                        style={{
                            ...styles.buttonsContainer,
                            flexWrap:
                                this.state.rxData.orientation && this.state.rxData.orientation !== 'h'
                                    ? 'wrap'
                                    : 'nowrap',
                        }}
                    >
                        {items.map((index, i) =>
                            // index from 1, i from 0
                            this.renderButton(index, anyIcon ? icons[i] : undefined),
                        )}
                    </div>
                )}
            </>
        );

        let addToHeader =
            this.state.rxData.allSwitch && items.length > 1 && allSwitchValue !== null ? (
                <Switch
                    checked={allSwitchValue}
                    style={intermediate ? styles.intermediate : undefined}
                    onChange={() => {
                        const values = JSON.parse(JSON.stringify(this.state.values));

                        for (let i = 0; i <= items.length; i++) {
                            const trueObj = this.state.objects[items[i]];
                            if (
                                trueObj &&
                                typeof trueObj === 'object' &&
                                trueObj._id &&
                                trueObj.widgetType === 'switch'
                            ) {
                                const oid = `${trueObj._id}.val`;
                                if (trueObj.common.type === 'boolean') {
                                    values[oid] = !allSwitchValue;
                                    this.props.context.setValue(trueObj._id, values[oid]);
                                } else if (trueObj.common.type === 'number') {
                                    values[oid] = allSwitchValue ? trueObj.common.min : trueObj.common.max;
                                    this.props.context.setValue(trueObj._id, values[oid]);
                                } else {
                                    values[oid] = !allSwitchValue;
                                    this.props.context.setValue(trueObj._id, values[oid] ? 'true' : 'false');
                                }
                            }
                        }

                        this.setState({ values });
                    }}
                />
            ) : null;

        if (this.state.rxData.noCard || props.widget.usedInWidget) {
            return content;
        }

        if (!this.state.rxData.widgetTitle && addToHeader) {
            addToHeader = <div style={{ textAlign: 'right', width: '100%' }}>{addToHeader}</div>;
        }

        return this.wrapContent(content, addToHeader);
    }
}

export default Switches;
