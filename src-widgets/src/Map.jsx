import React from 'react';
import { withStyles } from '@mui/styles';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet-providers';
import {
    Popup, TileLayer, MapContainer, Marker, useMap, Polyline, Circle, CircleMarker,
} from 'react-leaflet';

import {
    Dialog, DialogContent, DialogTitle, IconButton,
} from '@mui/material';

import { Close as CloseIcon, OpenInFull as OpenInFullIcon } from '@mui/icons-material';

import Generic from './Generic';

console.log(L.TileLayer.Provider.providers);

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const styles = theme => ({
    mapContainer: { width: '100%', height: '100%' },
    dialogTitle: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
});

const MapContent = props => {
    const map = useMap();
    const [oldRxData, setOldRxData] = React.useState('');
    if (JSON.stringify(props.rxData) !== oldRxData && props.markers.filter(marker => marker.latitude && marker.longitude).length
    ) {
        map.fitBounds(props.markers.map(marker => [marker.latitude || 0, marker.longitude || 0]));
        setOldRxData(JSON.stringify(props.rxData));
    }
};

class Map extends Generic {
    constructor(props) {
        super(props);
        this.state.dialog = false;
        this.state.history = {};
        this.state.objects = {};
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Map',
            visSet: 'vis-2-widgets-material',
            visName: 'Map',
            visWidgetLabel: 'vis_2_widgets_material_map',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'name',
                            label: 'vis_2_widgets_material_name',
                        },
                        {
                            name: 'markersCount',
                            label: 'vis_2_widgets_material_markers_count',
                            type: 'number',
                            default: 2,
                        },
                    ],
                }, {
                    name: 'markers',
                    indexFrom: 1,
                    indexTo: 'markersCount',
                    fields: [
                        {
                            name: 'oid',
                            type: 'id',
                            label: 'vis_2_widgets_material_oid',
                            onChange: async (field, data, changeData, socket) => {
                                const object = await socket.getObject(data[field.name]);
                                if (object && object.common) {
                                    data[`color${field.index}`] = object.common.color !== undefined ? object.common.color : null;
                                    data[`name${field.index}`] = object.common.name && typeof object.common.name === 'object' ? object.common.name[I18n.getLanguage()] : object.common.name;
                                    changeData(data);
                                }
                            },
                        },
                        {
                            name: 'position',
                            type: 'id',
                            label: 'vis_2_widgets_material_position',
                        },
                        {
                            name: 'longitude',
                            hidden: (data, index) => !!data[`position${index}`],
                            type: 'id',
                            label: 'vis_2_widgets_material_longitude',
                        },
                        {
                            name: 'latitude',
                            hidden: (data, index) => !!data[`position${index}`],
                            type: 'id',
                            label: 'vis_2_widgets_material_latitude',
                        },
                        {
                            name: 'radius',
                            type: 'id',
                            label: 'vis_2_widgets_material_radius',
                        },
                        {
                            name: 'name',
                            label: 'vis_2_widgets_material_name',
                        },
                        {
                            name: 'color',
                            type: 'color',
                            label: 'vis_2_widgets_material_color',
                        },
                        {
                            name: 'icon',
                            type: 'image',
                            label: 'vis_2_widgets_material_icon',
                        },
                        {
                            name: 'useHistory',
                            type: 'checkbox',
                            label: 'vis_2_widgets_material_use_history',
                            default: true,
                        },
                    ],
                }],
            visDefaultStyle: {
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_map.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Map.getWidgetInfo();
    }

    async propertiesUpdate() {
        const options = {
            instance: this.props.systemConfig?.common?.defaultHistory || 'history.0',
            from: false,
            ack: false,
            q: false,
            addID: false,
            end: new Date().getTime(),
            count: 100,
        };

        const newHistory = {};

        for (let i = 1; i <= this.state.rxData.markersCount; i++) {
            if (this.state.rxData[`position${i}`] && this.state.rxData[`useHistory${i}`]) {
                const history = (await this.props.socket.getHistory(this.state.rxData[`position${i}`], options));
                newHistory[i] =                    history
                    .filter(position => position.val)
                    .sort((a, b) => (a.ts > b.ts ? 1 : -1));
            }
        }

        this.setState({ history: newHistory });

        const objects = {};

        // try to find icons for all OIDs
        for (let i = 1; i <= this.state.rxData.markersCount; i++) {
            if (this.state.rxData[`oid${i}`]) {
                // read object itself
                const object = await this.props.socket.getObject(this.state.rxData[`oid${i}`]);
                if (!object) {
                    objects[i] = { common: {} };
                    continue;
                }
                object.common = object.common || {};
                object.isChart = !!(object.common.custom && object.common.custom[this.props.systemConfig?.common?.defaultHistory]);
                if (!this.state.rxData[`icon${i}`] && !object.common.icon && (object.type === 'state' || object.type === 'channel')) {
                    const idArray = this.state.rxData[`oid${i}`].split('.');

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
                objects[i] = { common: object.common, _id: object._id };
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

    async onRxDataChanged(prevRxData) {
        await this.propertiesUpdate();
    }

    async onStateUpdated(id, state) {
        await this.propertiesUpdate();
    }

    renderMap() {
        const markers = [];

        for (let i = 1; i <= this.state.rxData.markersCount; i++) {
            markers.push({
                i,
                longitude: parseFloat(this.getPropertyValue(`position${i}`)?.split(';')[0]) || this.getPropertyValue(`longitude${i}`) || 0,
                latitude: parseFloat(this.getPropertyValue(`position${i}`)?.split(';')[1]) || this.getPropertyValue(`latitude${i}`) || 0,
                radius: parseFloat(this.getPropertyValue(`radius${i}`)) || 0,
                name: this.state.rxData[`name${i}`],
                color: this.state.rxData[`color${i}`],
                icon: this.state.rxData[`icon${i}`] || this.state.objects[i]?.common?.icon,
            });
        }

        const map = <>
            <style>
                {`.leaflet-control-attribution svg {
                    display: none !important;
                }
                .leaflet-div-icon {
                    border-radius: 50%;
                }
                `}
            </style>
            <MapContainer
                className={this.props.classes.mapContainer}
                scrollWheelZoom
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {
                    markers.map((marker, index) => {
                        const history = this.state.history[marker.i]?.map(position => [
                            parseFloat(position.val.split(';')[1] || 0),
                            parseFloat(position.val.split(';')[0] || 0),
                        ]) || [];
                        history.push([marker.latitude, marker.longitude]);

                        const markerIcon = marker.icon ? new L.Icon({
                            iconUrl: marker.icon,
                            iconRetinaUrl: marker.icon,
                            iconAnchor: new L.Point(16, 16),
                            popupAnchor: new L.Point(0, -16),
                            shadowUrl: null,
                            shadowSize: null,
                            shadowAnchor: null,
                            iconSize: new L.Point(32, 32),
                            className: 'leaflet-div-icon',

                        }) : new L.Icon.Default();

                        return <React.Fragment key={index}>
                            <Marker
                                position={[marker.latitude, marker.longitude]}
                                icon={markerIcon}
                                title={marker.name}
                                eventHandlers={{
                                    click: () => {
                                        window.document.querySelectorAll('.leaflet-popup-close-button').forEach(el => el.addEventListener('click', e => {
                                            e.preventDefault();
                                        }));
                                    },
                                }}
                            >
                                <Popup>
                                    {marker.name}
                                </Popup>
                            </Marker>
                            {
                                this.state.history[marker.i] ?
                                    history.map((position, historyIndex) =>
                                        historyIndex < history.length - 1 && <Polyline
                                            key={historyIndex}
                                            pathOptions={{
                                                color: marker.color || 'blue',
                                                opacity: historyIndex + 1 / history.length,
                                            }}
                                            positions={[position, history[historyIndex + 1]]}
                                        />)
                                    : null
                            }
                            {
                                marker.radius ? <Circle
                                    center={[marker.latitude, marker.longitude]}
                                    pathOptions={{
                                        color: marker.color || 'blue',
                                    }}
                                    radius={marker.radius}
                                /> : null
                            }
                        </React.Fragment>;
                    })
                }
                <MapContent widget={this} markers={markers} rxData={this.state.rxData} />
            </MapContainer>
        </>;

        return map;
    }

    renderDialog() {
        return <Dialog
            open={this.state.dialog}
            fullScreen
            onClose={() => this.setState({ dialog: false })}
        >
            <DialogTitle className={this.props.classes.dialogTitle}>
                {this.state.rxData.name}
                <IconButton onClick={() => this.setState({ dialog: false })}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {this.renderMap()}
            </DialogContent>
        </Dialog>;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const content = <>
            {this.renderDialog()}
            {this.renderMap()}
        </>;

        return this.wrapContent(
            content,
            <IconButton onClick={() => this.setState({ dialog: true })}><OpenInFullIcon /></IconButton>,
            {
                boxSizing: 'border-box',
                paddingBottom: 10,
            },
        );
    }
}

export default withStyles(styles)(Map);
