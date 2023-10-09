import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import {
    Button, Card, CardContent, IconButton, Tooltip,
} from '@mui/material';

import {
    BatteryChargingFull, BatteryFull, Home, PlayArrow,
} from '@mui/icons-material';
import { FaFan } from 'react-icons/fa';

import { Icon } from '@iobroker/adapter-react-v5';

import vacuumIcon from './assets/vacuum_icon.svg';

import Generic from './Generic';

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
    topPanel: { display: 'flex', alignItems: 'center' },
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

class Vacuum extends Generic {
    constructor(props) {
        super(props);
        this.state.objects = {};
        this.state.rooms = [];
        this.state.currentRoom = '';
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
                            hidden: '!!data.["map64-oid"]',
                        },
                        {
                            label: 'ownImage',
                            name: 'ownImage',
                            type: 'image',
                            hidden: '!!data.["map64-oid"] || !data.useDefaultPicture',
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
    }

    async loadRooms() {
        const rooms = await this.props.context.socket.getObjectView('enum.rooms.', 'enum.rooms.\u9999', 'enum');
        this.setState({ rooms: Object.values(rooms) });
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.propertiesUpdate();
        this.loadRooms();
    }

    async onRxDataChanged(/* prevRxData */) {
        await this.propertiesUpdate();
    }

    getValue(id, isEnum) {
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
        return this.getObj('fan_speed') && <Button
            onClick={() => {
                const states = Object.keys(this.getObj('fan_speed').common.states);
                const index = states.indexOf(this.getValue('fan_speed'));
                const next = index + 1 < states.length ? index + 1 : 0;
                this.props.context.socket.setState(this.state.rxData['fan_speed-oid'], states[next]);
            }}
            className={this.props.classes.speed}
        >
            <FaFan />
            {this.getValue('fan_speed', true)}
        </Button>;
    }

    renderRooms() {
        return <div className={this.props.classes.rooms}>
            {this.state.rooms.map(room => <div key={room._id}>
                <Tooltip title={Generic.getText(room.common.name)}>
                    <Button
                        sx={
                            theme => ({
                                color: this.state.currentRoom === room._id ? undefined : theme.palette.text.primary,
                            })
                        }
                        onClick={() => this.setState({ currentRoom: room._id })}
                    >
                        {room.common.icon ?
                            <Icon
                                src={room.common.icon}
                                alt={room.common.name}
                                className={this.props.classes.roomIcon}
                            />
                            :
                            Generic.getText(room.common.name)}
                    </Button>
                </Tooltip>
            </div>)}
        </div>;
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
        return <div className={this.props.classes.buttons}>
            {this.getObj('start') && <Tooltip title={Generic.t('Start')}>
                <IconButton
                    onClick={() => this.props.context.socket.setState(this.state.rxData['start-oid'], true)}
                >
                    <PlayArrow />
                </IconButton>
            </Tooltip>}
            {this.getObj('home') && <Tooltip title={Generic.t('Home')}>
                <IconButton
                    onClick={() => this.props.context.socket.setState(this.state.rxData['home-oid'], true)}
                >
                    <Home />
                </IconButton>
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
        const speed = this.renderSpeed();
        const battery = this.renderBattery();
        let height = 0;
        if (speed || battery) {
            height += 26;
        }
        const sensors = this.renderSensors();
        if (sensors) {
            height += 52;
        }

        const buttons = this.renderButtons();
        const rooms = this.renderRooms();

        if (buttons || rooms) {
            height += 40;
        }

        const map = this.renderMap();

        const content = <div className={this.props.classes.content}>
            {speed || battery ? <div className={this.props.classes.topPanel}>
                {speed}
                {battery}
            </div> : null}
            {map ? <div className={this.props.classes.mapContainer} style={{ height: `calc(100% - ${height}px)`, width: '100%' }}>
                {map}
            </div> : null}
            {sensors}
            {buttons || rooms ? <div className={this.props.classes.bottomPanel}>
                {buttons}
                {rooms}
            </div> : null}
        </div>;

        return this.wrapContent(content);
    }
}

Vacuum.propTypes = {
    context: PropTypes.object,
};

export default withStyles(styles)(Vacuum);
