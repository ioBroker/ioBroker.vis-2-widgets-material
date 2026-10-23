import React, { useEffect, useState } from 'react';

import {
    Box,
    ButtonBase,
    Checkbox,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    ListItemText,
    MenuItem,
    Select,
    Slider,
    Tooltip,
} from '@mui/material';

import {
    Add,
    ArrowBack,
    Close,
    FastForward,
    FastRewind,
    Home,
    Info,
    KeyboardArrowDown,
    KeyboardArrowLeft,
    KeyboardArrowRight,
    KeyboardArrowUp,
    Menu,
    Palette,
    Pause,
    PlayArrow,
    PowerSettingsNew,
    Remove,
    SettingsRemote,
    Stop,
    VolumeOff,
    VolumeUp,
    YouTube,
} from '@mui/icons-material';

import { ChannelDetector, Types, TV_KEYS } from '@iobroker/type-detector';
import type { Connection } from '@iobroker/gui-components';
import type {
    RxRenderWidgetProps,
    RxWidgetInfo,
    RxWidgetInfoAttributesField,
    VisRxWidgetProps,
    VisRxWidgetState,
    VisWidgetCommand,
    WidgetData,
} from '@iobroker/types-vis-2';

import Generic from './Generic';

/** Widget field of every state of the type-detector pattern `tv` */
export const TV_FIELDS = {
    POWER: 'oid-power',
    KEY: 'oid-key',
    VOLUME: 'oid-volume',
    VOLUME_ACTUAL: 'oid-volume-actual',
    MUTE: 'oid-mute',
    VOLUME_UP: 'oid-volume-up',
    VOLUME_DOWN: 'oid-volume-down',
    INPUT: 'oid-input',
    APP: 'oid-app',
    ART_MODE: 'oid-art-mode',
    UNREACH: 'oid-unreach',
} as const;

type TvStateName = keyof typeof TV_FIELDS;

const TV_SECTIONS = [
    'showPower',
    'showArtMode',
    'showInputs',
    'showDpad',
    'showNavigation',
    'showVolume',
    'showChannel',
    'showMedia',
    'showNumbers',
    'showApps',
] as const;

type TvSection = (typeof TV_SECTIONS)[number];

/** Brand-like colors of the app pills - text only, no logos */
const APP_COLORS: Record<string, string> = {
    YOUTUBE: '#ff0000',
    YOUTUBE_MUSIC: '#ff0000',
    NETFLIX: '#e50914',
    DISNEY_PLUS: '#113ccf',
    PRIME_VIDEO: '#00a8e1',
    APPLE_TV: '#000000',
    MAX: '#002be7',
    PARAMOUNT_PLUS: '#0064ff',
    DAZN: '#0c161c',
    WOW: '#2b2b2b',
    JOYN: '#e6007e',
    RTL_PLUS: '#000000',
    MAGENTA_TV: '#e20074',
    ARD_MEDIATHEK: '#003480',
    ZDF_MEDIATHEK: '#fa7d19',
    SPOTIFY: '#1db954',
    TWITCH: '#9146ff',
    PLEX: '#e5a00d',
    BROWSER: '#5f6368',
};

const PALETTES = {
    dark: {
        body: 'linear-gradient(180deg, #2b2f36 0%, #1c1f24 100%)',
        bodyShadow: '0 10px 30px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
        key: '#3a3f47',
        keyHover: '#4a505a',
        keyActive: '#5b626e',
        keyShadow: '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        text: '#e8eaed',
        textDim: '#9aa0a6',
        ring: '#30343b',
        ringShadow: 'inset 0 2px 6px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05)',
        ok: '#454b54',
    },
    light: {
        body: 'linear-gradient(180deg, #f8f9fa 0%, #e8eaed 100%)',
        bodyShadow: '0 6px 20px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
        key: '#ffffff',
        keyHover: '#f1f3f4',
        keyActive: '#e2e4e7',
        keyShadow: '0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.9)',
        text: '#202124',
        textDim: '#5f6368',
        ring: '#dadce0',
        ringShadow: 'inset 0 2px 6px rgba(0,0,0,0.15)',
        ok: '#f1f3f4',
    },
};

type TvPalette = (typeof PALETTES)['dark'];

const POWER_COLORS = { color: '#c62828', hover: '#e53935' };
const ART_COLORS = { color: '#8e6c3a', hover: '#a5824c' };

/** `common.states` as an object, also from an array or the "a:A;b:B" format */
function getStates(obj: ioBroker.Object | null | undefined): Record<string, string> {
    const states = (obj?.common as ioBroker.StateCommon | undefined)?.states;
    const result: Record<string, string> = {};
    if (typeof states === 'string') {
        for (const pair of states.split(';')) {
            const [key, ...label] = pair.split(':');
            if (key.trim()) {
                result[key.trim()] = label.join(':').trim() || key.trim();
            }
        }
    } else if (Array.isArray(states)) {
        states.forEach(key => (result[String(key)] = String(key)));
    } else if (states) {
        Object.entries(states).forEach(([key, label]) => (result[key] = String(label)));
    }
    return result;
}

/** The stored comma-separated keys, empty means all offered */
function getSelected(value: string | undefined, offered: string[]): string[] {
    if (!value) {
        return offered;
    }
    const list = value.split(',');
    return offered.filter(key => list.includes(key));
}

function toBool(value: ioBroker.StateValue | undefined): boolean {
    return value === true || value === 'true' || value === 1 || value === '1' || value === 'on';
}

function isOid(oid: string | undefined): oid is string {
    return !!oid && oid !== 'nothing_selected';
}

/** Fills all state fields from the `tv` device the selected state belongs to */
const tvLoadStates = async (
    field: RxWidgetInfoAttributesField,
    data: WidgetData,
    changeData: (newData: WidgetData) => void,
    socket: Connection,
): Promise<void> => {
    const id: string = data[field.name!];
    if (!isOid(id)) {
        return;
    }
    const obj = await socket.getObject(id);
    if (!obj) {
        return;
    }
    // the detector looks up to two levels above a state for the device
    const parts = id.split('.');
    const levels = obj.type === 'state' ? 2 : obj.type === 'device' ? 0 : 1;
    const root = parts.slice(0, Math.max(2, parts.length - levels)).join('.');
    const objects: Record<string, ioBroker.Object> = {};
    for (const type of ['device', 'channel', 'folder', 'state'] as const) {
        Object.assign(objects, await socket.getObjectViewSystem(type, `${root}.`, `${root}.香`));
    }
    const rootObj = root === id ? obj : await socket.getObject(root);
    if (rootObj) {
        objects[root] = rootObj;
    }
    objects[id] = obj;

    const tv = new ChannelDetector().detect({ objects, id, allowedTypes: [Types.tv], detectParent: true })?.[0];
    if (!tv) {
        return;
    }
    for (const [name, fieldName] of Object.entries(TV_FIELDS)) {
        data[fieldName] = tv.states.find(state => state.name === name && state.id)?.id || '';
    }
    if (!data.widgetTitle && rootObj?.type === 'device') {
        data.widgetTitle = Generic.getText(rootObj.common.name);
    }
    changeData(data);
};

/** Multi-select of the apps or inputs that the state offers */
function TvKeysSelect(props: {
    socket: Connection;
    oid: string | undefined;
    value: string | undefined;
    onChange: (value: string) => void;
}): React.JSX.Element {
    const { socket, oid } = props;
    const [options, setOptions] = useState<Record<string, string>>({});

    useEffect(() => {
        let active = true;
        if (isOid(oid)) {
            void socket
                .getObject(oid)
                .then(obj => active && setOptions(getStates(obj)))
                .catch(() => active && setOptions({}));
        } else {
            setOptions({});
        }
        return () => {
            active = false;
        };
    }, [socket, oid]);

    const keys = Object.keys(options);
    const selected = getSelected(props.value, keys);

    return (
        <Select
            variant="standard"
            fullWidth
            multiple
            disabled={!keys.length}
            value={selected}
            renderValue={() =>
                selected.length === keys.length ? Generic.t('tv_all') : selected.map(key => options[key]).join(', ')
            }
            onChange={event => {
                const value = event.target.value as string[];
                // at least one stays selected, all of them are stored as "all"
                if (value.length) {
                    props.onChange(
                        value.length === keys.length ? '' : keys.filter(key => value.includes(key)).join(','),
                    );
                }
            }}
        >
            {keys.map(key => (
                <MenuItem
                    key={key}
                    value={key}
                    dense
                >
                    <Checkbox
                        size="small"
                        checked={selected.includes(key)}
                    />
                    <ListItemText primary={options[key]} />
                </MenuItem>
            ))}
        </Select>
    );
}

type TvRxData = {
    noCard: boolean | 'true';
    widgetTitle: string;
    displayMode: 'tile' | 'remote';
    oid: string;
    apps: string;
    inputs: string;
} & Record<(typeof TV_FIELDS)[TvStateName], string> &
    Record<TvSection, boolean | 'true' | 'false'>;

interface TvState extends VisRxWidgetState {
    objects: Partial<Record<TvStateName, ioBroker.StateObject>>;
    /** Supported values of KEY, APP and INPUT */
    keys: Record<string, string>;
    apps: Record<string, string>;
    inputs: Record<string, string>;
    dialog: boolean;
    /** Volume while the slider is dragged */
    volume: number | null;
}

interface TvPill {
    id: string;
    label: React.ReactNode;
    title: string;
    color?: string;
    onClick: () => void;
}

class Tv extends Generic<TvRxData, TvState> {
    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = {
            ...this.state,
            objects: {},
            keys: {},
            apps: {},
            inputs: {},
            dialog: false,
            volume: null,
        };
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplMaterial2Tv',
            visSet: 'vis-2-widgets-material',
            visName: 'TV',
            visWidgetLabel: 'tv',
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
                            name: 'displayMode',
                            label: 'tv_display_mode',
                            type: 'select',
                            options: [
                                { value: 'tile', label: 'tv_tile' },
                                { value: 'remote', label: 'tv_remote' },
                            ],
                            default: 'tile',
                        },
                        {
                            name: 'oid',
                            label: 'tv_detect',
                            tooltip: 'tv_detect_tooltip',
                            type: 'id',
                            noSubscribe: true,
                            onChange: tvLoadStates,
                        },
                    ],
                },
                {
                    name: 'states',
                    label: 'tv_states',
                    fields: [
                        { name: TV_FIELDS.POWER, label: 'tv_power', type: 'id' },
                        { name: TV_FIELDS.KEY, label: 'tv_key', type: 'id', noSubscribe: true },
                        { name: TV_FIELDS.VOLUME, label: 'volume', type: 'id' },
                        { name: TV_FIELDS.VOLUME_ACTUAL, label: 'tv_volume_actual', type: 'id' },
                        { name: TV_FIELDS.MUTE, label: 'mute', type: 'id' },
                        { name: TV_FIELDS.VOLUME_UP, label: 'tv_volume_up', type: 'id', noSubscribe: true },
                        { name: TV_FIELDS.VOLUME_DOWN, label: 'tv_volume_down', type: 'id', noSubscribe: true },
                        { name: TV_FIELDS.INPUT, label: 'tv_input', type: 'id' },
                        { name: TV_FIELDS.APP, label: 'tv_app', type: 'id' },
                        { name: TV_FIELDS.ART_MODE, label: 'tv_art_mode', type: 'id' },
                        { name: TV_FIELDS.UNREACH, label: 'tv_unreach', type: 'id' },
                    ],
                },
                {
                    name: 'sections',
                    label: 'tv_sections',
                    fields: [
                        ...TV_SECTIONS.map((section): RxWidgetInfoAttributesField => ({
                            name: section,
                            label: `tv_${section.replace(/[A-Z]/g, char => `_${char.toLowerCase()}`)}`,
                            type: 'checkbox',
                            default: true,
                        })),
                        {
                            name: 'apps',
                            label: 'tv_shown_apps',
                            type: 'custom',
                            hidden: (data: WidgetData) => data.showApps === false || !isOid(data[TV_FIELDS.APP]),
                            component: (_field, data, onDataChange, props) => (
                                <TvKeysSelect
                                    socket={props.context.socket}
                                    oid={data[TV_FIELDS.APP]}
                                    value={data.apps}
                                    onChange={apps => onDataChange({ ...data, apps })}
                                />
                            ),
                        },
                        {
                            name: 'inputs',
                            label: 'tv_shown_inputs',
                            type: 'custom',
                            hidden: (data: WidgetData) => data.showInputs === false || !isOid(data[TV_FIELDS.INPUT]),
                            component: (_field, data, onDataChange, props) => (
                                <TvKeysSelect
                                    socket={props.context.socket}
                                    oid={data[TV_FIELDS.INPUT]}
                                    value={data.inputs}
                                    onChange={inputs => onDataChange({ ...data, inputs })}
                                />
                            ),
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 160,
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_tv.png',
        };
    }

    getWidgetInfo(): RxWidgetInfo {
        return Tv.getWidgetInfo();
    }

    async componentDidMount(): Promise<void> {
        super.componentDidMount();
        await this.tvLoadObjects();
    }

    async onRxDataChanged(): Promise<void> {
        await this.tvLoadObjects();
    }

    async tvLoadObjects(): Promise<void> {
        const names = Object.keys(TV_FIELDS) as TvStateName[];
        const oids = names.map(name => this.tvGetOid(name)).filter(Boolean);
        const loaded = oids.length ? ((await this.props.context.socket.getObjectsById(oids)) ?? {}) : {};
        const objects: TvState['objects'] = {};
        for (const name of names) {
            const obj = loaded[this.tvGetOid(name)];
            if (obj) {
                objects[name] = obj as ioBroker.StateObject;
            }
        }
        let keys: Record<string, string> = {};
        if (this.tvGetOid('KEY')) {
            keys = getStates(objects.KEY);
            // a key state without a list accepts all keys
            if (!Object.keys(keys).length) {
                keys = { ...TV_KEYS };
            }
        }
        this.setState({ objects, keys, apps: getStates(objects.APP), inputs: getStates(objects.INPUT) });
    }

    tvGetOid(name: TvStateName): string {
        const oid = this.state.rxData[TV_FIELDS[name]];
        return isOid(oid) ? oid : '';
    }

    tvGetValue(name: TvStateName): ioBroker.StateValue | undefined {
        const oid = this.tvGetOid(name);
        return oid ? this.state.values[`${oid}.val`] : undefined;
    }

    tvShows(section: TvSection): boolean {
        const value = this.state.rxData[section];
        return value !== false && value !== 'false';
    }

    /** Known to be off or not reachable: only the power key works then */
    tvIsOff(): boolean {
        const power = this.tvGetValue('POWER');
        return (power !== undefined && power !== null && !toBool(power)) || toBool(this.tvGetValue('UNREACH'));
    }

    tvSend(name: TvStateName, value: ioBroker.StateValue): void {
        const oid = this.tvGetOid(name);
        if (oid) {
            this.props.context.setValue(oid, value);
        }
    }

    tvVolumeStep(direction: 1 | -1): void {
        const button = direction > 0 ? 'VOLUME_UP' : 'VOLUME_DOWN';
        if (this.tvGetOid(button)) {
            this.tvSend(button, true);
            return;
        }
        const common = this.state.objects.VOLUME?.common;
        if (common) {
            const current = Number(this.tvGetValue('VOLUME_ACTUAL') ?? this.tvGetValue('VOLUME')) || 0;
            const value = current + direction * (common.step || 1);
            this.tvSend('VOLUME', Math.min(common.max ?? 100, Math.max(common.min ?? 0, value)));
        }
    }

    tvColors(): TvPalette {
        return PALETTES[this.props.context.themeType === 'dark' ? 'dark' : 'light'];
    }

    tvRenderButton(
        id: string,
        content: React.ReactNode,
        title: string,
        onClick: () => void,
        sx: Record<string, unknown> = {},
    ): React.JSX.Element {
        const colors = this.tvColors();
        return (
            <Tooltip
                key={id}
                title={title}
                enterDelay={600}
                slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
            >
                <ButtonBase
                    aria-label={title}
                    onClick={e => {
                        e.stopPropagation();
                        onClick();
                    }}
                    sx={{
                        width: 52,
                        height: 52,
                        flexShrink: 0,
                        borderRadius: '50%',
                        backgroundColor: colors.key,
                        color: colors.text,
                        boxShadow: colors.keyShadow,
                        transition: 'background-color 120ms, transform 80ms',
                        '&:hover': { backgroundColor: colors.keyHover },
                        '&:active': { backgroundColor: colors.keyActive, transform: 'scale(0.95)' },
                        ...sx,
                    }}
                >
                    {content}
                </ButtonBase>
            </Tooltip>
        );
    }

    /** A key of the remote, only if the TV supports it */
    tvRenderKey(
        key: string,
        content: React.ReactNode,
        title: string,
        sx?: Record<string, unknown>,
    ): React.JSX.Element | null {
        return this.state.keys[key]
            ? this.tvRenderButton(key, content, Generic.t(title), () => this.tvSend('KEY', key), sx)
            : null;
    }

    tvRenderPower(size: number): React.JSX.Element | null {
        if (!this.tvShows('showPower') || !this.tvGetOid('POWER')) {
            return null;
        }
        const power = toBool(this.tvGetValue('POWER'));
        return this.tvRenderButton(
            'power',
            <PowerSettingsNew />,
            Generic.t(power ? 'tv_power_off' : 'tv_power_on'),
            () => this.tvSend('POWER', !power),
            {
                width: size,
                height: size,
                color: '#fff',
                backgroundColor: POWER_COLORS.color,
                '&:hover': { backgroundColor: POWER_COLORS.hover },
                '&:active': { backgroundColor: POWER_COLORS.hover, transform: 'scale(0.95)' },
            },
        );
    }

    tvRenderArtMode(size: number): React.JSX.Element | null {
        if (!this.tvShows('showArtMode') || !this.tvGetOid('ART_MODE') || this.tvIsOff()) {
            return null;
        }
        const art = toBool(this.tvGetValue('ART_MODE'));
        return this.tvRenderButton(
            'art',
            <Palette />,
            Generic.t(art ? 'tv_art_off' : 'tv_art_on'),
            () => this.tvSend('ART_MODE', !art),
            {
                width: size,
                height: size,
                color: '#fff',
                backgroundColor: art ? ART_COLORS.hover : ART_COLORS.color,
                '&:hover': { backgroundColor: ART_COLORS.hover },
                '&:active': { backgroundColor: ART_COLORS.hover, transform: 'scale(0.95)' },
            },
        );
    }

    tvRenderStatus(fontSize: number, color?: string): React.JSX.Element {
        const power = this.tvGetValue('POWER');
        let dot = '#5f6368';
        let text = 'Unknown';
        if (toBool(this.tvGetValue('UNREACH'))) {
            text = 'tv_offline';
        } else if (power !== undefined && power !== null && !toBool(power)) {
            dot = '#ea4335';
            text = 'Off';
        } else if (toBool(power) && toBool(this.tvGetValue('ART_MODE'))) {
            dot = '#c49a52';
            text = 'tv_art_mode';
        } else if (toBool(power)) {
            dot = '#34a853';
            text = 'On';
        }
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: dot,
                        boxShadow: toBool(power) ? `0 0 6px ${dot}` : 'none',
                    }}
                />
                <span style={{ fontSize, color, opacity: color ? 1 : 0.7 }}>{Generic.t(text)}</span>
            </div>
        );
    }

    tvRenderPills(items: TvPill[], columns: number): React.JSX.Element | null {
        if (!items.length) {
            return null;
        }
        const colors = this.tvColors();
        return (
            <Box
                sx={
                    columns
                        ? { display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 1, width: '100%' }
                        : { display: 'flex', flexWrap: 'wrap', gap: 0.75 }
                }
            >
                {items.map(item => (
                    <ButtonBase
                        key={item.id}
                        aria-label={item.title}
                        title={item.title}
                        onClick={e => {
                            e.stopPropagation();
                            item.onClick();
                        }}
                        sx={{
                            height: columns ? 34 : 30,
                            px: columns ? 1 : 1.5,
                            borderRadius: '17px',
                            backgroundColor: item.color ?? colors.key,
                            border: item.color ? '1px solid rgba(255,255,255,0.12)' : `1px solid ${colors.textDim}`,
                            color: item.color ? '#fff' : colors.text,
                            fontSize: 12,
                            fontWeight: 'bold',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            boxShadow: item.color ? colors.keyShadow : 'none',
                            transition: 'filter 120ms, transform 80ms',
                            '&:hover': { filter: 'brightness(1.15)' },
                            '&:active': { transform: 'scale(0.96)' },
                        }}
                    >
                        {item.label}
                    </ButtonBase>
                ))}
            </Box>
        );
    }

    tvGetAppPills(): TvPill[] {
        if (!this.tvShows('showApps')) {
            return [];
        }
        const apps = this.state.apps;
        return getSelected(this.state.rxData.apps, Object.keys(apps)).map(key => ({
            id: `app_${key}`,
            title: apps[key],
            label:
                key === 'YOUTUBE' ? (
                    <>
                        <YouTube sx={{ fontSize: 20, mr: 0.5 }} />
                        {apps[key]}
                    </>
                ) : (
                    apps[key]
                ),
            color: APP_COLORS[key],
            onClick: () => this.tvSend('APP', key),
        }));
    }

    tvGetInputPills(): TvPill[] {
        if (!this.tvShows('showInputs')) {
            return [];
        }
        const inputs = this.state.inputs;
        return getSelected(this.state.rxData.inputs, Object.keys(inputs)).map(key => ({
            id: `input_${key}`,
            title: inputs[key],
            label: inputs[key],
            onClick: () => this.tvSend('INPUT', key),
        }));
    }

    /** A vertical rocker like the volume and channel keys of a real remote */
    tvRenderRocker(
        label: string,
        up: { title: string; icon: React.ReactNode; onClick: () => void } | null,
        down: { title: string; icon: React.ReactNode; onClick: () => void } | null,
    ): React.JSX.Element | null {
        if (!up && !down) {
            return null;
        }
        const colors = this.tvColors();
        const half = { width: 52, height: 52, backgroundColor: 'transparent', boxShadow: 'none' };
        return (
            <Box
                key={label}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: '26px',
                    backgroundColor: colors.key,
                    boxShadow: colors.keyShadow,
                }}
            >
                {up ? this.tvRenderButton(`${label}_up`, up.icon, up.title, up.onClick, half) : null}
                <span style={{ fontSize: 11, fontWeight: 'bold', color: colors.textDim, letterSpacing: 1 }}>
                    {label}
                </span>
                {down ? this.tvRenderButton(`${label}_down`, down.icon, down.title, down.onClick, half) : null}
            </Box>
        );
    }

    tvRenderDpad(): React.JSX.Element | null {
        const keys = this.state.keys;
        if (!this.tvShows('showDpad') || !['UP', 'DOWN', 'LEFT', 'RIGHT', 'SELECT'].some(key => keys[key])) {
            return null;
        }
        const colors = this.tvColors();
        const arrow = { position: 'absolute', backgroundColor: 'transparent', boxShadow: 'none' };
        return (
            <Box
                sx={{
                    position: 'relative',
                    width: 190,
                    height: 190,
                    flexShrink: 0,
                    borderRadius: '50%',
                    backgroundColor: colors.ring,
                    boxShadow: colors.ringShadow,
                }}
            >
                {this.tvRenderKey('UP', <KeyboardArrowUp fontSize="large" />, 'tv_up', { ...arrow, top: 4, left: 69 })}
                {this.tvRenderKey('DOWN', <KeyboardArrowDown fontSize="large" />, 'tv_down', {
                    ...arrow,
                    bottom: 4,
                    left: 69,
                })}
                {this.tvRenderKey('LEFT', <KeyboardArrowLeft fontSize="large" />, 'tv_left', {
                    ...arrow,
                    left: 4,
                    top: 69,
                })}
                {this.tvRenderKey('RIGHT', <KeyboardArrowRight fontSize="large" />, 'tv_right', {
                    ...arrow,
                    right: 4,
                    top: 69,
                })}
                {this.tvRenderKey('SELECT', <span style={{ fontWeight: 'bold', fontSize: 16 }}>OK</span>, 'tv_ok', {
                    position: 'absolute',
                    top: 55,
                    left: 55,
                    width: 80,
                    height: 80,
                    backgroundColor: colors.ok,
                })}
            </Box>
        );
    }

    tvRenderNumbers(): React.JSX.Element | null {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, null];
        if (!this.tvShows('showNumbers') || !numbers.some(n => n !== null && this.state.keys[`NUMBER_${n}`])) {
            return null;
        }
        return (
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1,
                    justifyItems: 'center',
                    width: '100%',
                }}
            >
                {numbers.map((n, i) =>
                    n === null || !this.state.keys[`NUMBER_${n}`] ? (
                        <span key={`empty_${i}`} />
                    ) : (
                        this.tvRenderButton(
                            `NUMBER_${n}`,
                            <span style={{ fontSize: 18 }}>{n}</span>,
                            String(n),
                            () => this.tvSend('KEY', `NUMBER_${n}`),
                            { width: 48, height: 48 },
                        )
                    ),
                )}
            </Box>
        );
    }

    tvRenderVolumeSlider(): React.JSX.Element | null {
        const common = this.state.objects.VOLUME?.common;
        if (!common) {
            return null;
        }
        const colors = this.tvColors();
        const value = this.state.volume ?? (Number(this.tvGetValue('VOLUME_ACTUAL') ?? this.tvGetValue('VOLUME')) || 0);
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', color: colors.textDim }}>
                <VolumeUp fontSize="small" />
                <Slider
                    size="small"
                    min={common.min ?? 0}
                    max={common.max ?? 100}
                    step={common.step || 1}
                    value={value}
                    valueLabelDisplay="auto"
                    onClick={e => e.stopPropagation()}
                    onChange={(_e, volume) => this.setState({ volume })}
                    onChangeCommitted={(_e, volume) =>
                        this.setState({ volume: null }, () => this.tvSend('VOLUME', volume))
                    }
                    sx={{ color: colors.text }}
                />
            </Box>
        );
    }

    /** Only the non-empty rows */
    static tvRow(children: (React.JSX.Element | null)[], sx?: Record<string, unknown>): React.JSX.Element | null {
        return children.some(Boolean) ? (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    gap: 1,
                    ...sx,
                }}
            >
                {children}
            </Box>
        ) : null;
    }

    tvRenderRemote(): React.JSX.Element {
        const colors = this.tvColors();
        const off = this.tvIsOff();
        const showVolume = this.tvShows('showVolume');
        const keys = this.state.keys;

        let content: React.ReactNode = null;
        if (!off) {
            const inputs = this.tvGetInputPills();
            const volumeByState = !!this.state.objects.VOLUME;
            const small = { width: 40, height: 40 };
            content = (
                <>
                    {this.tvRenderPills(inputs, Math.min(inputs.length, 3))}
                    {this.tvShows('showNavigation')
                        ? Tv.tvRow([
                              this.tvRenderKey('MENU', <Menu />, 'tv_menu'),
                              this.tvRenderKey('INFO', <Info />, 'tv_info'),
                          ])
                        : null}
                    {this.tvRenderDpad()}
                    {Tv.tvRow([
                        this.tvShows('showNavigation') ? this.tvRenderKey('BACK', <ArrowBack />, 'tv_back') : null,
                        this.tvShows('showNavigation') ? this.tvRenderKey('HOME', <Home />, 'tv_home') : null,
                        showVolume && this.tvGetOid('MUTE')
                            ? this.tvRenderButton(
                                  'mute',
                                  <VolumeOff color={toBool(this.tvGetValue('MUTE')) ? 'error' : undefined} />,
                                  Generic.t('mute'),
                                  () => this.tvSend('MUTE', !toBool(this.tvGetValue('MUTE'))),
                              )
                            : null,
                    ])}
                    {Tv.tvRow(
                        [
                            showVolume
                                ? this.tvRenderRocker(
                                      'VOL',
                                      this.tvGetOid('VOLUME_UP') || volumeByState
                                          ? {
                                                title: Generic.t('tv_volume_up'),
                                                icon: <Add />,
                                                onClick: () => this.tvVolumeStep(1),
                                            }
                                          : null,
                                      this.tvGetOid('VOLUME_DOWN') || volumeByState
                                          ? {
                                                title: Generic.t('tv_volume_down'),
                                                icon: <Remove />,
                                                onClick: () => this.tvVolumeStep(-1),
                                            }
                                          : null,
                                  )
                                : null,
                            this.tvShows('showChannel')
                                ? this.tvRenderRocker(
                                      'CH',
                                      keys.CHANNEL_UP
                                          ? {
                                                title: Generic.t('tv_channel_up'),
                                                icon: <KeyboardArrowUp />,
                                                onClick: () => this.tvSend('KEY', 'CHANNEL_UP'),
                                            }
                                          : null,
                                      keys.CHANNEL_DOWN
                                          ? {
                                                title: Generic.t('tv_channel_down'),
                                                icon: <KeyboardArrowDown />,
                                                onClick: () => this.tvSend('KEY', 'CHANNEL_DOWN'),
                                            }
                                          : null,
                                  )
                                : null,
                        ],
                        { alignItems: 'stretch', justifyContent: 'space-around' },
                    )}
                    {showVolume ? this.tvRenderVolumeSlider() : null}
                    {this.tvRenderNumbers()}
                    {this.tvShows('showMedia')
                        ? Tv.tvRow(
                              [
                                  this.tvRenderKey('REWIND', <FastRewind fontSize="small" />, 'tv_rewind', small),
                                  this.tvRenderKey('PLAY', <PlayArrow fontSize="small" />, 'tv_play', small),
                                  this.tvRenderKey('PAUSE', <Pause fontSize="small" />, 'tv_pause', small),
                                  this.tvRenderKey('STOP', <Stop fontSize="small" />, 'tv_stop', small),
                                  this.tvRenderKey(
                                      'FAST_FORWARD',
                                      <FastForward fontSize="small" />,
                                      'tv_fast_forward',
                                      small,
                                  ),
                              ],
                              { gap: 0.5 },
                          )
                        : null}
                    {this.tvRenderPills(this.tvGetAppPills(), 2)}
                </>
            );
        }

        const power = this.tvRenderPower(52);
        const art = this.tvRenderArtMode(52);

        return (
            <Box
                sx={{
                    width: 260,
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    mx: 'auto',
                    px: 3,
                    py: 3,
                    borderRadius: '44px',
                    background: colors.body,
                    boxShadow: colors.bodyShadow,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                {Tv.tvRow([power, art], art ? undefined : { justifyContent: 'center' })}
                {this.tvRenderStatus(12, colors.textDim)}
                {content}
            </Box>
        );
    }

    tvRenderDialog(): React.JSX.Element | null {
        if (!this.state.dialog) {
            return null;
        }
        return (
            <Dialog
                open={!0}
                onClose={() => this.setState({ dialog: false })}
                // the dialog is a child of the card in React, so its clicks would open it again
                onClick={e => e.stopPropagation()}
            >
                <DialogTitle>
                    {this.state.rxData.widgetTitle}
                    <IconButton
                        style={{ float: 'right', zIndex: 2 }}
                        onClick={() => this.setState({ dialog: false })}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>{this.tvRenderRemote()}</DialogContent>
            </Dialog>
        );
    }

    tvRenderTile(): React.JSX.Element {
        const apps = this.tvIsOff() ? [] : this.tvGetAppPills();
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {this.tvRenderStatus(14)}
                    <div style={{ flex: 1 }} />
                    <Tooltip
                        title={Generic.t('tv_remote')}
                        slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                    >
                        <IconButton
                            onClick={e => {
                                e.stopPropagation();
                                this.setState({ dialog: true });
                            }}
                        >
                            <SettingsRemote />
                        </IconButton>
                    </Tooltip>
                    {this.tvRenderArtMode(40)}
                    {this.tvRenderPower(40)}
                </div>
                {this.tvRenderPills(apps, 0)}
                {this.tvRenderDialog()}
            </div>
        );
    }

    onCommand(command: VisWidgetCommand): any {
        const result = super.onCommand(command);
        if (result === false) {
            if (command === 'openDialog') {
                this.setState({ dialog: true });
                return true;
            }
            if (command === 'closeDialog') {
                this.setState({ dialog: false });
                return true;
            }
        }
        return result;
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element[] | React.JSX.Element | null {
        super.renderWidgetBody(props);

        const tile = this.state.rxData.displayMode !== 'remote';
        let content: React.JSX.Element;
        if (!this.tvGetOid('POWER') && !this.tvGetOid('KEY')) {
            content = <div style={{ opacity: 0.7 }}>{Generic.t('tv_select_device')}</div>;
        } else if (tile) {
            content = this.tvRenderTile();
        } else {
            content = (
                <div style={{ flex: 1, minHeight: 0, width: '100%', overflow: 'auto' }}>{this.tvRenderRemote()}</div>
            );
        }

        if (this.state.rxData.noCard === true || this.state.rxData.noCard === 'true' || props.widget.usedInWidget) {
            return (
                <div
                    style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
                    onClick={tile && !this.props.editMode ? () => this.setState({ dialog: true }) : undefined}
                >
                    {content}
                </div>
            );
        }

        return this.wrapContent(
            content,
            null,
            { boxSizing: 'border-box', height: '100%', display: 'flex', flexDirection: 'column' },
            undefined,
            tile && !this.props.editMode ? () => this.setState({ dialog: true }) : undefined,
        );
    }
}

export default Tv;
