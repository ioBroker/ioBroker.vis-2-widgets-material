import {
    Button, Card, CardContent, IconButton,
} from '@mui/material';
import { Home, PlayArrow } from '@mui/icons-material';
import { Icon } from '@iobroker/adapter-react-v5';
import Generic from './Generic';

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

            visSetLabel: 'set_label', // Label of this widget set
            visSetColor: '#0783ff', // Color of this widget set

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
                }, {
                    name: 'sensors',
                    fields: [
                        {
                            label: 'status',
                            name: 'status-oid',
                            type: 'id',
                        },
                        {
                            label: 'battery',
                            name: 'battery-oid',
                            type: 'id',
                        },
                        {
                            label: 'fan_speed',
                            name: 'fan_speed-oid',
                            type: 'id',
                        },
                        {
                            label: 'sensors_left',
                            name: 'sensors_left-oid',
                            type: 'id',
                        },
                        {
                            label: 'filter_left',
                            name: 'filter_left-oid',
                            type: 'id',
                        },
                        {
                            label: 'main_brush_left',
                            name: 'main_brush_left-oid',
                            type: 'id',
                        },
                        {
                            label: 'side_brush_left',
                            name: 'side_brush_left-oid',
                            type: 'id',
                        },
                        {
                            label: 'cleaning_count',
                            name: 'cleaning_count-oid',
                            type: 'id',
                        },
                    ],
                },
                {
                    name: 'actions',
                    fields: [
                        {
                            label: 'start-oid',
                            name: 'start',
                            type: 'id',
                        },
                        {
                            label: 'home-oid',
                            name: 'home',
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
            visPrev: 'widgets/vis-2-widgets-material/img/prev_actual.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Vacuum.getWidgetInfo();
    }

    async propertiesUpdate() {
        const objects = {};
        const oids = ['status', 'battery', 'fan_speed', 'sensors_left', 'filter_left', 'main_brush_left', 'side_brush_left', 'cleaning_count',
            'start', 'home'];
        for (const k in oids) {
            const oid = this.state.rxData[`${oids[k]}-oid`];
            if (oid) {
                const object = await this.props.context.socket.getObject(oid);
                if (object) {
                    objects[oids[k]] = object;
                }
            }
        }
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

    getValue(id) {
        return this.state.values[`${this.state.rxData[`${id}-oid`]}.val`];
    }

    getObj(id) {
        return this.state.objects[id];
    }

    renderBattery() {

    }

    renderSpeed() {

    }

    renderRooms() {
        return <div style={{ display: 'flex', alignItems: 'center' }}>
            {
                this.state.rooms.map(room => <div key={room._id}>
                    <Button sx={
                        theme => ({
                            color: theme.palette.text.primary,
                        })
                    }
                    >
                        {room.common.icon ?
                            <Icon
                                src={room.common.icon}
                                alt={room.common.name}
                                style={{
                                    height: 16,
                                }}
                            />
                            :
                            room.common.name}
                    </Button>
                </div>)
            }
        </div>;
    }

    renderSensors() {
        const sensors = [];

        ['filter_left', 'side_brush_left', 'main_brush_left', 'sensors_left', 'cleaning_count'].forEach(sensor => {
            if (this.getObj(sensor)) {
                sensors.push(sensor);
            }
        });

        return <div style={{ overflow: 'auto' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 4,
                minWidth: 'min-content',
            }}
            >
                {sensors.map(sensor => {
                    const object = this.getObj(sensor);

                    return <Card key={sensor}>
                        <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div>
                                {this.getValue(sensor)}
                                {' '}
                                {object.common.unit}
                            </div>
                            <div>
                                {Generic.t(sensor)}
                            </div>
                        </CardContent>
                    </Card>;
                })}
            </div>
        </div>;
    }

    renderButtons() {
        return <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
        }}
        >
            {this.getObj('start') && <IconButton
                onClick={() => this.props.context.socket.setState(this.state.rxData['start-oid'], true)}
            >
                <PlayArrow />
            </IconButton>}
            {this.getObj('home') && <IconButton
                onClick={() => this.props.context.socket.setState(this.state.rxData['home-oid'], true)}
            >
                <Home />
            </IconButton>}
        </div>;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        console.log(this.state);

        const content = <div style={{ width: '100%', overflow: 'auto' }}>
            {this.renderSensors()}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {this.renderButtons()}
                {this.renderRooms()}
            </div>
        </div>;

        return this.wrapContent(
            content,
        );
    }
}

export default Vacuum;
