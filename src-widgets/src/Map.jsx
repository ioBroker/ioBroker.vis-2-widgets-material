import React from 'react';
import { withStyles } from '@mui/styles';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet-providers';
import {
    Popup, TileLayer, MapContainer, Marker, useMap, Polyline, Circle, ZoomControl,
} from 'react-leaflet';

import {
    Dialog, DialogContent, DialogTitle, IconButton,
} from '@mui/material';

import { Close as CloseIcon, Fullscreen as OpenInFullIcon } from '@mui/icons-material';

import { I18n } from '@iobroker/adapter-react-v5';

import Generic from './Generic';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const styles = () => ({
    mapContainer: {
        width: '100%',
        height: '100%',
    },
    dialogTitle: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

const MapContent = props => {
    const map = useMap();
    const [oldRxData, setOldRxData] = React.useState('');
    const [oldRxStyle, setOldRxStyle] = React.useState('');
    const [markers, setOldMarkers] = React.useState('');
    if (
        (JSON.stringify(props.rxData) !== oldRxData && props.markers.filter(marker => marker.latitude && marker.longitude).length)
            || JSON.stringify(props.rxStyle) !== oldRxStyle
            || JSON.stringify(props.markers) !== markers) {
        let centerLat = 0;
        let centerLng = 0;
        props.markers.forEach(marker => {
            centerLat += marker.latitude || 0;
            centerLng += marker.longitude || 0;
        });
        centerLat /= props.markers.length;
        centerLng /= props.markers.length;
        map.setView([centerLat, centerLng], parseInt(props.rxData.defaultZoom) || 18);
        if (!props.markers.every(marker => map.getBounds().contains([marker.latitude || 0, marker.longitude || 0]))) {
            map.fitBounds(props.markers.map(marker => [marker.latitude || 0, marker.longitude || 0]));
        }
        setOldRxData(JSON.stringify(props.rxData));
        setOldRxStyle(JSON.stringify(props.rxStyle));
        setOldMarkers(JSON.stringify(props.markers));
    }
};

const mapThemes = {
    '': {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    darkmatter: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '<a href="https://carto.com/attributions">CARTO</a>',
    },
    openstreetmapde: {
        url: 'https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    stadiaosmbright: {
        url: 'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    },
    // jawgstreets: {
    //     url: '',
    //     attribution: '',
    // },
    // jawgdark: {
    //     url: '',
    //     attribution: '',
    // },
    esriworldimagery: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; ' +
            'Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, ' +
            'Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    },
};

async function detectNameAndColor(field, data, changeData, socket) {
    const object = await socket.getObject(data[field.name]);
    let changed = false;
    let parentChannel;
    let parentDevice;
    if (object && object.common && object.common.color) {
        data[`color${field.index}`] = object.common.color;
        changed = true;
    } else if (object) {
        // try to detect parent
        parentChannel = await this.getParentObject(data[field.name]);
        if (parentChannel && (parentChannel.type === 'channel' || parentChannel.type === 'device')) {
            if (parentChannel.common?.color) {
                data[`name${field.index}`] = parentChannel.common.color;
                changed = true;
            } else {
                parentDevice = await this.getParentObject(data[field.name], true);
                if (parentDevice.common?.color) {
                    data[`name${field.index}`] = parentDevice.common.color;
                    changed = true;
                }
            }
        }
    }
    if (object && object.common && object.common.name) {
        changed = true;
        data[`name${field.index}`] = typeof object.common.name === 'object' ? object.common.name[I18n.getLanguage()] : object.common.name;
    } else if (object) {
        // try to detect parent
        parentChannel = parentChannel || (await this.getParentObject(data[field.name]));
        if (parentChannel && (parentChannel.type === 'channel' || parentChannel.type === 'device')) {
            if (parentChannel.common?.name) {
                data[`name${field.index}`] = typeof parentChannel.common.name === 'object' ?
                    parentChannel.common.name[I18n.getLanguage()] : parentChannel.common.name;
                changed = true;
            } else {
                parentDevice = parentDevice || (await this.getParentObject(data[field.name], true));
                if (parentDevice.common?.name) {
                    data[`name${field.index}`] = typeof parentDevice.common.name === 'object' ?
                        parentDevice.common.name[I18n.getLanguage()] : parentDevice.common.name;
                    changed = true;
                }
            }
        }
    }
    changed && changeData(data);
}

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
                            default: 1,
                        },
                        {
                            name: 'theme',
                            label: 'vis_2_widgets_material_theme',
                            type: 'select',
                            options: Object.keys(mapThemes),
                            default: '',
                        },
                        {
                            name: 'themeUrl',
                            label: 'vis_2_widgets_material_theme_url',
                            hidden: data => data.theme,
                        },
                        {
                            name: 'themeAttribution',
                            label: 'vis_2_widgets_material_theme_attribution',
                            hidden: data => data.theme,
                        },
                        {
                            name: 'defaultZoom',
                            label: 'vis_2_widgets_material_default_zoom',
                            default: 15,
                            type: 'slider',
                            min: 1,
                            max: 25,
                        },
                        {
                            name: 'hideZoomButtons',
                            label: 'vis_2_widgets_material_hide_zoom',
                            default: false,
                            type: 'checkbox',
                        },
                    ],
                },
                {
                    name: 'markers',
                    indexFrom: 1,
                    indexTo: 'markersCount',
                    fields: [
                        {
                            name: 'position',
                            type: 'id',
                            label: 'vis_2_widgets_material_position',
                            onChange: detectNameAndColor,
                        },
                        {
                            name: 'longitude',
                            hidden: (data, index) => !!data[`position${index}`],
                            type: 'id',
                            label: 'vis_2_widgets_material_longitude',
                            onChange: detectNameAndColor,
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
                            tooltip: 'vis_2_widgets_material_radius_tooltip',
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
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 240,
                position: 'relative',
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
            if (this.state.rxData[`position${i}`] &&
                this.state.rxData[`useHistory${i}`] &&
                this.state.objects[i]?.common?.custom &&
                this.state.objects[i].common.custom[options.instance]
            ) {
                const history = (await this.props.socket.getHistory(this.state.rxData[`position${i}`], options));
                newHistory[i] = history
                    .filter(position => position.val)
                    .sort((a, b) => (a.ts > b.ts ? 1 : -1));
            }
        }

        this.setState({ history: newHistory });

        const objects = {};

        // try to find icons for all OIDs
        for (let i = 1; i <= this.state.rxData.markersCount; i++) {
            if (this.state.rxData[`position${i}`]) {
                // read object itself
                const object = await this.props.socket.getObject(this.state.rxData[`position${i}`]);
                if (!object) {
                    objects[i] = { common: {} };
                    continue;
                }
                object.common = object.common || {};
                object.isChart = !!(object.common.custom && object.common.custom[this.props.systemConfig?.common?.defaultHistory]);
                if (!this.state.rxData[`icon${i}`] && !object.common.icon && (object.type === 'state' || object.type === 'channel')) {
                    const idArray = this.state.rxData[`position${i}`].split('.');

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

    async onRxDataChanged(/* prevRxData */) {
        await this.propertiesUpdate();
    }

    async onStateUpdated(/* id, state */) {
        await this.propertiesUpdate();
    }

    renderMap() {
        const markers = [];

        for (let i = 1; i <= this.state.rxData.markersCount; i++) {
            const position = this.getPropertyValue(`position${i}`);
            let radius;
            if (isFinite(this.state.rxData[`radius${i}`])) {
                radius = parseFloat(this.state.rxData[`radius${i}`]);
            } else {
                radius = parseFloat(this.getPropertyValue(`radius${i}`)) || 0;
            }
            const mrk = {
                i,
                longitude: parseFloat(position?.split(';')[0]) || this.getPropertyValue(`longitude${i}`) || 0,
                latitude: parseFloat(position?.split(';')[1]) || this.getPropertyValue(`latitude${i}`) || 0,
                radius,
                name: this.state.rxData[`name${i}`],
                color: this.state.rxData[`color${i}`],
                icon: this.state.rxData[`icon${i}`] || this.state.objects[i]?.common?.icon,
            };
            if (mrk.icon && mrk.icon.startsWith('_PRJ_NAME')) {
                mrk.icon = mrk.icon.replace('_PRJ_NAME', `${this.props.adapterName}.${this.props.instance}/${this.props.projectName}/`);
            }

            markers.push(mrk);
        }

        let tilesUrl = mapThemes[''].url;
        let tilesAttribution = mapThemes[''].attribution;
        if (this.state.rxData.theme && mapThemes[this.state.rxData.theme]) {
            tilesUrl = mapThemes[this.state.rxData.theme].url;
            tilesAttribution = mapThemes[this.state.rxData.theme].attribution;
        } else if (this.state.rxData.themeUrl) {
            tilesUrl = this.state.rxData.themeUrl;
            tilesAttribution = this.state.rxData.themeAttribution;
        }

        return <>
            <style>
                {
                    `.leaflet-control-attribution svg {
    display: none !important;
}
.leaflet-div-icon {
    border-radius: 50%;
}`
                }
            </style>
            <MapContainer
                className={this.props.classes.mapContainer}
                scrollWheelZoom
                key={`${tilesUrl}`}
                zoom={this.state.rxData.defaultZoom || 18}
                center={[0, 0]}
                zoomControl={false}
            >
                <TileLayer
                    attribution={tilesAttribution}
                    url={tilesUrl}
                />
                {!this.state.rxData.hideZoomButtons ? <ZoomControl position="bottomright" /> : null}
                {
                    markers.map((marker, index) => {
                        const history = this.state.history[marker.i]?.map(position => {
                            const parts = position.val.split(';');
                            return [
                                parseFloat(parts[1] || 0),
                                parseFloat(parts[0] || 0),
                            ];
                        }) || [];
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
                                        window.document.querySelectorAll('.leaflet-popup-close-button')
                                            .forEach(el => el.addEventListener('click', e =>
                                                e.preventDefault()));
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
                                                opacity: historyIndex + (1 / history.length),
                                            }}
                                            positions={[position, history[historyIndex + 1]]}
                                        />)
                                    : null
                            }
                            {
                                marker.radius ? <Circle
                                    center={[marker.latitude, marker.longitude]}
                                    pathOptions={{ color: marker.color || 'blue' }}
                                    radius={marker.radius}
                                /> : null
                            }
                        </React.Fragment>;
                    })
                }
                <MapContent widget={this} markers={markers} rxData={this.state.rxData} rxStyle={this.state.rxStyle} />
            </MapContainer>
        </>;
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

        const iconFull = <IconButton onClick={() => this.setState({ dialog: true })}><OpenInFullIcon /></IconButton>;

        return this.wrapContent(
            content,
            this.state.rxData.name ? iconFull : <div style={{ display: 'flex', width: '100%' }}>
                <div style={{ flex: 1 }} />
                {iconFull}
            </div>,
            {
                boxSizing: 'border-box',
                paddingBottom: 10,
            },
        );
    }
}

export default withStyles(styles)(Map);
