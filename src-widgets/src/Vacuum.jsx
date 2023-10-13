import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import {
    Button,
    Card, CardContent, IconButton, Menu, MenuItem, Tooltip,
} from '@mui/material';

import {
    BatteryChargingFull, BatteryFull, Home, Pause, PlayArrow,
} from '@mui/icons-material';

import { Icon } from '@iobroker/adapter-react-v5';

import vacuumIcon from './assets/vacuum_icon.svg';

import Generic from './Generic';

const FanIcon = props => <svg
    viewBox="0 0 512 512"
    width={props.width || 20}
    height={props.height || props.width || 20}
    xmlns="http://www.w3.org/2000/svg"
    className={props.className}
    style={props.style}
>
    <path fill="currentColor" d="M352.57 128c-28.09 0-54.09 4.52-77.06 12.86l12.41-123.11C289 7.31 279.81-1.18 269.33.13 189.63 10.13 128 77.64 128 159.43c0 28.09 4.52 54.09 12.86 77.06L17.75 224.08C7.31 223-1.18 232.19.13 242.67c10 79.7 77.51 141.33 159.3 141.33 28.09 0 54.09-4.52 77.06-12.86l-12.41 123.11c-1.05 10.43 8.11 18.93 18.59 17.62 79.7-10 141.33-77.51 141.33-159.3 0-28.09-4.52-54.09-12.86-77.06l123.11 12.41c10.44 1.05 18.93-8.11 17.62-18.59-10-79.7-77.51-141.33-159.3-141.33zM256 288a32 32 0 1 1 32-32 32 32 0 0 1-32 32z" />
</svg>;

const styles = theme => ({
    battery: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    },
    sensorsContainer: {
        overflow: 'auto',
    },
    sensors: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 4,
        minWidth: 'min-content',
    },
    rooms: { display: 'flex', alignItems: 'center' },
    buttons: {
        display: 'flex', alignItems: 'center', gap: 4,
    },
    content: {
        width: '100%',
        height: '100%',
        overflow: 'auto',
    },
    mapContainer: { flex: 1 },
    topPanel: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    bottomPanel: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    speed: { gap: 4, color: theme.palette.text.primary },
    roomIcon: { height: 16 },
    sensorCard: { boxShadow: 'none' },
    sensorCardContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: 2,
        paddingBottom: 2,
    },
    sensorBigText: { fontSize: 20 },
    sensorSmallText: { fontSize: 12 },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
    speedContainer: { gap: 4, display: 'flex', alignItems: 'center' },
});

const ID_ROLES = {
    status: { role: 'value.state' },
    battery: { role: 'value.battery' },
    is_charging: { name: 'is_charging' },
    fan_speed: { role: 'level.suction' },
    sensors_left: { role: 'value.usage.sensors' },
    filter_left: { role: 'value.usage.filter' },
    main_brush_left: { role: 'value.usage.brush' },
    side_brush_left: { role: 'value.usage.brush.side' },
    cleaning_count: { name: 'cleanups' },
    start: { role: 'button', name:'start' },
    home: { role: 'button', name: 'home' },
    pause: { role: 'button', name: 'pause' },
    map64: { role: 'vacuum.map.base64' },
};

const loadStates = async (field, data, changeData, socket) => {
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
                Object.keys(ID_ROLES).forEach(name => {
                    if (!data[`${name}-oid`]) {
                        // try to find state
                        Object.values(states).forEach(state => {
                            const _parts = state._id.split('.');
                            if (_parts.includes('rooms')) {
                                return;
                            }

                            const role = state.common.role;
                            if (ID_ROLES[name].role && !role?.includes(ID_ROLES[name].role)) {
                                return;
                            }
                            if (ID_ROLES[name].name) {
                                const last = state._id.split('.').pop().toLowerCase();
                                if (!last.includes(ID_ROLES[name].name)) {
                                    return;
                                }
                            }

                            changed = true;
                            data[`${name}-oid`] = state._id;
                        });
                    }
                });

                changed && changeData(data);
            }
        }
    }
};

const CLEANING_STATES = [
    'Cleaning',
    'Spot Cleaning',
    'Zone cleaning',
    'Room cleaning',
];

const PAUSE_STATES = [
    'Pause',
    'Waiting',
];

const CHARGING_STATES = [
    'Charging',
    'Charging Erro',
];

const GOING_HOME_STATES = [
    'Back to home',
    'Docking',
];

class Vacuum extends Generic {
    constructor(props) {
        super(props);
        this.state.objects = {};
        this.state.rooms = [];
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Vacuum',
            visSet: 'vis-2-widgets-material',
            visWidgetLabel: 'vacuum',  // Label of widget
            visName: 'Vacuum',
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
                    ],
                },
                {
                    name: 'sensors',
                    label: 'sensors',
                    fields: [
                        {
                            label: 'status',
                            name: 'status-oid',
                            type: 'id',
                            onChange: loadStates,
                        },
                        {
                            label: 'battery',
                            name: 'battery-oid',
                            type: 'id',
                            onChange: loadStates,
                        },
                        {
                            label: 'is_charging',
                            name: 'is_charging-oid',
                            type: 'id',
                            onChange: loadStates,
                        },
                        {
                            label: 'fan_speed',
                            name: 'fan_speed-oid',
                            type: 'id',
                            onChange: loadStates,
                        },
                        {
                            label: 'sensors_left',
                            name: 'sensors_left-oid',
                            type: 'id',
                            onChange: loadStates,
                        },
                        {
                            label: 'filter_left',
                            name: 'filter_left-oid',
                            type: 'id',
                            onChange: loadStates,
                        },
                        {
                            label: 'main_brush_left',
                            name: 'main_brush_left-oid',
                            type: 'id',
                            onChange: loadStates,
                        },
                        {
                            label: 'side_brush_left',
                            name: 'side_brush_left-oid',
                            type: 'id',
                            onChange: loadStates,
                        },
                        {
                            label: 'cleaning_count',
                            name: 'cleaning_count-oid',
                            type: 'id',
                            onChange: loadStates,
                        },
                    ],
                },
                {
                    name: 'map',
                    label: 'map',
                    fields: [
                        {
                            label: 'rooms',
                            name: 'useRooms',
                            type: 'checkbox',
                            tooltip: 'rooms_tooltip',
                        },
                        {
                            label: 'map64',
                            name: 'map64-oid',
                            type: 'id',
                            onChange: loadStates,
                        },
                        {
                            label: 'useDefaultPicture',
                            name: 'useDefaultPicture',
                            type: 'checkbox',
                            default: true,
                            hidden: '!!data["map64-oid"]',
                        },
                        {
                            label: 'ownImage',
                            name: 'ownImage',
                            type: 'image',
                            hidden: '!!data["map64-oid"] || !data.useDefaultPicture',
                        },
                    ],
                },
                {
                    name: 'actions',
                    label: 'actions',
                    fields: [
                        {
                            label: 'start',
                            name: 'start-oid',
                            type: 'id',
                        },
                        {
                            label: 'home',
                            name: 'home-oid',
                            type: 'id',
                        },
                        {
                            label: 'pause',
                            name: 'pause-oid',
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
            visPrev: 'widgets/vis-2-widgets-material/img/prev_vacuum.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Vacuum.getWidgetInfo();
    }

    async propertiesUpdate() {
        const objects = {};
        const oids = [];
        const keys = Object.keys(ID_ROLES);
        for (let k = 0; k < keys.length; k++) {
            const oid = this.state.rxData[`${keys[k]}-oid`];
            if (oid) {
                oids.push(oid);
            }
        }
        const _objects = await this.props.context.socket.getObjects(oids);

        // read all objects at once
        Object.values(_objects).forEach(obj => {
            const oid = keys.find(_oid => this.state.rxData[`${_oid}-oid`] === obj._id);
            if (oid) {
                objects[oid] = obj;
            }
        });

        this.setState({ objects });
        await this.loadRooms();
    }

    async loadRooms() {
        if (this.state.rxData.useRooms) {
            // try to detect the `rooms` object according to status OID
            // mihome-vacuum.0.info.state => mihome-vacuum.0.rooms
            if (this.state.rxData['status-oid']) {
                const parts = this.state.rxData['status-oid'].split('.');
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
                    this.setState({ rooms: result });
                }
            }
        }
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.propertiesUpdate();
    }

    async onRxDataChanged(/* prevRxData */) {
        await this.propertiesUpdate();
    }

    getValue(id, isEnum) {
        if (!this.getObj(id)) {
            return null;
        }
        if (isEnum) {
            return this.getObj(id).common.states[this.state.values[`${this.state.rxData[`${id}-oid`]}.val`]];
        }
        return this.state.values[`${this.state.rxData[`${id}-oid`]}.val`];
    }

    getObj(id) {
        return this.state.objects[id];
    }

    renderBattery() {
        return this.getObj('battery') && <div className={this.props.classes.battery}>
            {this.getObj('is_charging') && this.getValue('is_charging') ? <BatteryChargingFull /> : <BatteryFull />}
            {this.getValue('battery') || 0}
            {' '}
            {this.getObj('battery').common.unit}
        </div>;
    }

    renderSpeed() {
        if (!this.getObj('fan_speed')) {
            return null;
        }
        let options = null;
        options = this.getObj('fan_speed').common.states;
        if (Array.isArray(options)) {
            const result = {};
            options.forEach(item => result[item] = item);
            options = result;
        }

        let value = this.getValue('fan_speed');
        if (value === null || value === undefined) {
            value = '';
        }
        value = value.toString();

        return [
            <Button
                variant="standard"
                key="speed"
                className={this.props.classes.speedContainer}
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
            >
                {Object.keys(options).map(state => <MenuItem
                    key={state}
                    value={state}
                    selected={value === state}
                    onClick={e => {
                        const _value = e.target.value;
                        this.setState({ showSpeedMenu: null }, () =>
                            this.props.context.socket.setState(this.state.rxData['fan_speed-oid'], _value));
                    }}
                >
                    {Generic.t(options[state]).replace('vis_2_widgets_material_', '')}
                </MenuItem>)}
            </Menu> : null,
        ];
    }

    renderRooms() {
        if (!this.state.rooms?.length) {
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
                open={!0}
                anchorEl={this.state.showRoomsMenu}
                key="roomsMenu"
            >
                {this.state.rooms.map(room => <MenuItem
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

    renderSensors() {
        const sensors = ['filter_left', 'side_brush_left', 'main_brush_left', 'sensors_left', 'cleaning_count'].filter(sensor =>
            this.getObj(sensor));

        return sensors.length ? <div className={this.props.classes.sensorsContainer}>
            <div className={this.props.classes.sensors}>
                {sensors.map(sensor => {
                    const object = this.getObj(sensor);

                    return <Card
                        key={sensor}
                        className={this.props.classes.sensorCard}
                    >
                        <CardContent
                            className={this.props.classes.sensorCardContent}
                            style={{ paddingBottom: 2 }}
                        >
                            <div>
                                <span className={this.props.classes.sensorBigText}>
                                    {this.getValue(sensor) || 0}
                                </span>
                                {' '}
                                <span className={this.props.classes.sensorSmallText}>
                                    {object.common.unit}
                                </span>
                            </div>
                            <div>
                                <span className={this.props.classes.sensorSmallText}>
                                    {Generic.t(sensor)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>;
                })}
            </div>
        </div> : null;
    }

    renderButtons() {
        let statusColor;
        if (CLEANING_STATES.includes(this.getValue('status', true))) {
            statusColor = 'green';
        }
        if (PAUSE_STATES.includes(this.getValue('status', true))) {
            statusColor = 'yellow';
        }
        if (CHARGING_STATES.includes(this.getValue('status', true))) {
            statusColor = 'gray';
        }
        if (GOING_HOME_STATES.includes(this.getValue('status', true))) {
            statusColor = 'blue';
        }

        return <div className={this.props.classes.buttons}>
            {this.getObj('start') && !CLEANING_STATES.includes(this.getValue('status', true)) &&
            <Tooltip title={Generic.t('Start')}>
                <IconButton
                    onClick={() => this.props.context.socket.setState(this.state.rxData['start-oid'], true)}
                >
                    <PlayArrow />
                </IconButton>
            </Tooltip>}
            {this.getObj('pause') && !PAUSE_STATES.includes(this.getValue('status', true)) && !CHARGING_STATES.includes(this.getValue('status', true)) &&
            <Tooltip title={Generic.t('Pause')}>
                <IconButton
                    onClick={() => this.props.context.socket.setState(this.state.rxData['pause-oid'], true)}
                >
                    <Pause />
                </IconButton>
            </Tooltip>}
            {this.getObj('home') && !CHARGING_STATES.includes(this.getValue('status', true)) &&
            <Tooltip title={Generic.t('Home')}>
                <IconButton
                    onClick={() => this.props.context.socket.setState(this.state.rxData['home-oid'], true)}
                >
                    <Home />
                </IconButton>
            </Tooltip>}
            {this.getObj('status') && <Tooltip title={Generic.t('Status')}>
                <div style={{ color: statusColor }}>
                    {Generic.t(this.getValue('status', true)).replace('vis_2_widgets_material_', '')}
                </div>
            </Tooltip>}
        </div>;
    }

    renderMap() {
        const obj = this.getObj('map64');
        if (!obj) {
            if (this.state.rxData.useDefaultPicture) {
                return <img src={vacuumIcon} alt="vacuum" className={this.props.classes.image} />;
            }
            if (this.state.rxData.ownImage) {
                return <Icon src={this.state.rxData.ownImage} className={this.props.classes.image} />;
            }
            return null;
        }

        return <img src={this.state.values[`${obj._id}.val`]} alt="vacuum" className={this.props.classes.image} />;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);
        const rooms = this.renderRooms();
        const battery = this.renderBattery();
        let height = 0;
        if (rooms) {
            height += 36;
        } else if (battery) {
            height += 24;
        }
        const sensors = this.renderSensors();
        if (sensors) {
            height += 46;
        }

        const buttons = this.renderButtons();
        const speed = this.renderSpeed();

        if (buttons || rooms) {
            height += 40;
        }

        const map = this.renderMap();

        const content = <div className={this.props.classes.content}>
            {battery || rooms ? <div className={this.props.classes.topPanel}>
                {rooms}
                {battery}
            </div> : null}
            {map ? <div className={this.props.classes.mapContainer} style={{ height: `calc(100% - ${height}px)`, width: '100%' }}>
                {map}
            </div> : null}
            {sensors}
            {buttons || speed ? <div className={this.props.classes.bottomPanel}>
                {buttons}
                {speed}
            </div> : null}
        </div>;

        return this.wrapContent(content);
    }
}

Vacuum.propTypes = {
    context: PropTypes.object,
};

export default withStyles(styles)(Vacuum);
