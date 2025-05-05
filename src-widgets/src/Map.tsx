import React, { type CSSProperties } from 'react';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet-providers';
import { Popup, TileLayer, MapContainer, Marker, useMap, Polyline, Circle, ZoomControl } from 'react-leaflet';

import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';

import { Close as CloseIcon, Fullscreen as OpenInFullIcon } from '@mui/icons-material';

import Generic from './Generic';
import type {
    RxRenderWidgetProps,
    RxWidgetInfo,
    RxWidgetInfoAttributesField,
    WidgetData,
    WidgetStyleState,
    VisRxWidgetState,
    VisRxWidgetProps,
} from '@iobroker/types-vis-2';
import type { LegacyConnection } from '@iobroker/adapter-react-v5';

// @ts-expect-error ignore
delete L.Icon.Default.prototype._getIconUrl;

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const styles: Record<'mapContainer' | 'dialogTitle', CSSProperties> = {
    mapContainer: {
        width: '100%',
        height: '100%',
    },
    dialogTitle: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
};

interface MapContentProps {
    rxStyle: WidgetStyleState;
    rxData: MapRxData;
    widget: Map;
    markers: { longitude: number; latitude: number }[];
}

function MapContent(props: MapContentProps): React.JSX.Element | null {
    const map = useMap();
    const [oldRxData, setOldRxData] = React.useState('');
    const [oldRxStyle, setOldRxStyle] = React.useState('');
    const [markers, setOldMarkers] = React.useState('');

    if (
        (JSON.stringify(props.rxData) !== oldRxData &&
            props.markers.filter(marker => marker.latitude && marker.longitude).length) ||
        JSON.stringify(props.rxStyle) !== oldRxStyle ||
        JSON.stringify(props.markers) !== markers
    ) {
        let centerLat = 0;
        let centerLng = 0;

        props.markers.forEach(marker => {
            centerLat += marker.latitude || 0;
            centerLng += marker.longitude || 0;
        });

        centerLat /= props.markers.length;
        centerLng /= props.markers.length;

        map.setView([centerLat, centerLng], parseInt(props.rxData.defaultZoom as string) || 18);

        if (!props.markers.every(marker => map.getBounds().contains([marker.latitude || 0, marker.longitude || 0]))) {
            map.fitBounds(props.markers.map(marker => [marker.latitude || 0, marker.longitude || 0]));
        }

        setOldRxData(JSON.stringify(props.rxData));
        setOldRxStyle(JSON.stringify(props.rxStyle));
        setOldMarkers(JSON.stringify(props.markers));
    }

    return null;
}

const mapThemes: Record<
    string,
    {
        url: string;
        attribution: string;
        title: string;
    }
> = {
    default: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        title: 'openstreetmap.de',
    },
    darkmatter: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '<a href="https://carto.com/attributions">CARTO</a>',
        title: 'Dark matter',
    },
    stadiaosmbright: {
        url: 'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
        attribution:
            '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        title: 'Stadia OSM Bright',
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
        attribution:
            'Tiles &copy; Esri &mdash; ' +
            'Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, ' +
            'Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        title: 'Esri World Imagery',
    },
};

async function getParentObject(id: string, socket: LegacyConnection): Promise<ioBroker.Object | null> {
    const parts = id.split('.');
    parts.pop();
    const parentOID = parts.join('.');
    return await socket.getObject(parentOID);
}

function getText(text: ioBroker.StringOrTranslated): string {
    if (typeof text === 'object') {
        return text[Generic.getLanguage()] || text.en;
    }
    return text;
}

async function detectNameAndColor(
    field: RxWidgetInfoAttributesField,
    data: WidgetData,
    changeData: (newData: WidgetData) => void,
    socket: LegacyConnection,
): Promise<void> {
    if (data[field.name!]) {
        const object = await socket.getObject(data[field.name!]);
        let changed = false;
        let parentChannel: ioBroker.Object | null = null;
        let parentDevice: ioBroker.Object | null = null;

        if (object?.common?.color) {
            data[`color${field.index}`] = object.common.color;
            changed = true;
        } else if (object) {
            // try to detect parent
            parentChannel = await getParentObject(data[field.name!], socket);
            if (parentChannel && (parentChannel.type === 'channel' || parentChannel.type === 'device')) {
                if (parentChannel.common?.color) {
                    data[`name${field.index}`] = parentChannel.common.color;
                    changed = true;
                } else {
                    parentDevice = await getParentObject(data[field.name!], socket);
                    if (parentDevice?.common?.color) {
                        data[`name${field.index}`] = parentDevice.common.color;
                        changed = true;
                    }
                }
            }
        }

        if (object?.common?.name) {
            changed = true;
            data[`name${field.index}`] = getText(object.common.name);
        } else if (object) {
            // try to detect parent
            parentChannel ||= await getParentObject(data[field.name!], socket);
            if (parentChannel && (parentChannel.type === 'channel' || parentChannel.type === 'device')) {
                if (parentChannel.common?.name) {
                    data[`name${field.index}`] = getText(parentChannel.common.name);
                    changed = true;
                } else {
                    parentDevice ||= await getParentObject(data[field.name!], socket);
                    if (parentDevice?.common?.name) {
                        data[`name${field.index}`] = getText(parentDevice.common.name);
                        changed = true;
                    }
                }
            }
        }

        changed && changeData(data);
    }
}

interface MapRxData {
    noCard: boolean;
    widgetTitle: string;
    markersCount: number;
    theme: string;
    themeUrl: string;
    themeAttribution: string;
    defaultZoom: number | string;
    noUserInteractions: boolean;
    hideZoomButtons: boolean;
    hideFullScreenButton: boolean;
    [key: `position${number}`]: string;
    [key: `longitude${number}`]: number;
    [key: `latitude${number}`]: number;
    [key: `radius${number}`]: string;
    [key: `name${number}`]: string;
    [key: `color${number}`]: string;
    [key: `icon${number}`]: string;
    [key: `useHistory${number}`]: boolean;
    [key: `oid${number}`]: string;
}

interface MapState extends VisRxWidgetState {
    dialog: boolean;
    history: { val: string; ts: number }[][];
    objects: { common: ioBroker.StateCommon; _id: string }[];
    forceShowMap: boolean;
}

export default class Map extends Generic<MapRxData, MapState> {
    fillDataTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = { ...this.state, dialog: false, history: [], objects: [] };
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplMaterial2Map',
            visSet: 'vis-2-widgets-material',
            visName: 'Map',
            visWidgetLabel: 'map',
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
                        },
                        {
                            name: 'markersCount',
                            label: 'markers_count',
                            type: 'number',
                            default: 1,
                        },
                        {
                            name: 'theme',
                            label: 'theme',
                            type: 'select',
                            options: Object.keys(mapThemes).map(theme => ({
                                value: theme,
                                label: mapThemes[theme].title,
                            })),
                            default: 'default',
                            noTranslation: true,
                        },
                        {
                            name: 'themeUrl',
                            label: 'theme_url',
                            hidden: (data: WidgetData) => data.theme && data.theme !== 'default',
                        },
                        {
                            name: 'themeAttribution',
                            label: 'theme_attribution',
                            hidden: (data: WidgetData) => data.theme && data.theme !== 'default',
                        },
                        {
                            name: 'defaultZoom',
                            label: 'default_zoom',
                            default: 12,
                            type: 'slider',
                            min: 1,
                            max: 25,
                        },
                        {
                            name: 'noUserInteractions',
                            label: 'no_user_interactions',
                            default: false,
                            type: 'checkbox',
                        },
                        {
                            name: 'hideZoomButtons',
                            label: 'hide_zoom',
                            default: false,
                            type: 'checkbox',
                            hidden: 'data["noUserInteractions"]',
                        },
                        {
                            name: 'hideFullScreenButton',
                            label: 'hide_full',
                            default: false,
                            type: 'checkbox',
                        },
                    ],
                },
                {
                    name: 'markers',
                    label: 'markers',
                    indexFrom: 1,
                    indexTo: 'markersCount',
                    fields: [
                        {
                            name: 'position',
                            type: 'id',
                            label: 'position',
                            onChange: detectNameAndColor,
                            tooltip: 'position_help',
                        },
                        {
                            name: 'longitude',
                            hidden: (data, index) => !!data[`position${index}`],
                            type: 'id',
                            label: 'longitude',
                            onChange: detectNameAndColor,
                        },
                        {
                            name: 'latitude',
                            hidden: (data, index) => !!data[`position${index}`],
                            type: 'id',
                            label: 'latitude',
                        },
                        {
                            name: 'radius',
                            type: 'id',
                            label: 'radius',
                            tooltip: 'radius_tooltip',
                        },
                        {
                            name: 'name',
                            label: 'name',
                        },
                        {
                            name: 'color',
                            type: 'color',
                            label: 'color',
                        },
                        {
                            name: 'icon',
                            type: 'image',
                            label: 'icon',
                        },
                        {
                            name: 'useHistory',
                            type: 'checkbox',
                            label: 'use_history',
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

    getWidgetInfo(): RxWidgetInfo {
        return Map.getWidgetInfo();
    }

    async propertiesUpdate(): Promise<void> {
        const defaultHistory = this.props.context.systemConfig?.common?.defaultHistory || 'history.0';
        const options = {
            instance: this.props.context.systemConfig?.common?.defaultHistory || 'history.0',
            from: false,
            ack: false,
            q: false,
            addID: false,
            end: new Date().getTime(),
            count: 100,
        };
        const newHistory: { val: string; ts: number }[][] = [];

        for (let i = 1; i <= this.state.rxData.markersCount; i++) {
            const historyInstance = Generic.getHistoryInstance(this.state.objects[i], defaultHistory);

            if (this.state.rxData[`position${i}`] && this.state.rxData[`useHistory${i}`] && historyInstance) {
                options.instance = historyInstance;

                const history: ioBroker.GetHistoryResult = await this.props.context.socket.getHistory(
                    this.state.rxData[`position${i}`],
                    options,
                );
                newHistory[i] = history
                    .filter(entry => entry.val)
                    .sort((a, b) => (a.ts > b.ts ? 1 : -1))
                    .map(entry => ({ val: entry.val as string, ts: entry.ts }));
            }
        }

        this.setState({ history: newHistory });

        const objects: { common: ioBroker.StateCommon; _id: string }[] = [];

        const ids = [];
        for (let index = 1; index <= this.state.rxData.markersCount; index++) {
            if (this.state.rxData[`position${index}`] && this.state.rxData[`position${index}`] !== 'nothing_selected') {
                ids.push(this.state.rxData[`oid${index}`]);
            }
        }
        const _objects = ids.length ? await this.props.context.socket.getObjectsById(ids) : {};

        // try to find icons for all OIDs
        for (let index = 1; index <= this.state.rxData.markersCount; index++) {
            if (this.state.rxData[`position${index}`] && this.state.rxData[`position${index}`] !== 'nothing_selected') {
                // read object itself
                const object = _objects[this.state.rxData[`position${index}`]];
                if (!object) {
                    objects[index] = { common: {} as ioBroker.StateCommon, _id: this.state.rxData[`position${index}`] };
                    continue;
                }
                object.common ||= {} as ioBroker.StateCommon;

                if (
                    !this.state.rxData[`icon${index}`] &&
                    !object.common.icon &&
                    (object.type === 'state' || object.type === 'channel')
                ) {
                    const idArray = this.state.rxData[`position${index}`].split('.');

                    // read channel
                    const parentObject = await this.props.context.socket.getObject(idArray.slice(0, -1).join('.'));
                    if (!parentObject?.common?.icon && (object.type === 'state' || object.type === 'channel')) {
                        const grandParentObject = await this.props.context.socket.getObject(
                            idArray.slice(0, -2).join('.'),
                        );
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
                objects[index] = { common: object.common as ioBroker.StateCommon, _id: object._id };
            }
        }

        if (JSON.stringify(objects) !== JSON.stringify(this.state.objects)) {
            this.setState({ objects });
        }
    }

    async componentDidMount(): Promise<void> {
        super.componentDidMount();
        await this.propertiesUpdate();
        this.fillDataTimer = setTimeout(() => {
            this.fillDataTimer = null;
            this.setState({ forceShowMap: true });
        }, 2000);
    }

    componentWillUnmount(): void {
        if (this.fillDataTimer) {
            clearTimeout(this.fillDataTimer);
            this.fillDataTimer = null;
        }
    }

    async onRxDataChanged(/* prevRxData */): Promise<void> {
        await this.propertiesUpdate();
    }

    async onStateUpdated(/* id, state */): Promise<void> {
        await this.propertiesUpdate();
    }

    renderMap(): React.ReactNode {
        const markers = [];

        for (let i = 1; i <= this.state.rxData.markersCount; i++) {
            const position = this.getPropertyValue(`position${i}`);
            let radius;

            if (window.isFinite(this.state.rxData[`radius${i}`] as any as number)) {
                radius = parseFloat(this.state.rxData[`radius${i}`]);
            } else {
                radius = parseFloat(this.getPropertyValue(`radius${i}`)) || 0;
            }
            const parts = position?.toString().split(';');
            let longitude;
            let latitude;
            if (parts?.length === 2) {
                longitude = parseFloat(parts[0]) || 0;
                latitude = parseFloat(parts[1]) || 0;
            } else {
                longitude = parseFloat(this.getPropertyValue(`longitude${i}`)) || 0;
                latitude = parseFloat(this.getPropertyValue(`latitude${i}`)) || 0;
            }
            const mrk = {
                i,
                longitude,
                latitude,
                radius,
                name: this.state.rxData[`name${i}`],
                color: this.state.rxData[`color${i}`],
                icon: this.state.rxData[`icon${i}`] || this.state.objects[i]?.common?.icon,
            };
            if (mrk.icon?.startsWith('_PRJ_NAME')) {
                mrk.icon = mrk.icon.replace(
                    '_PRJ_NAME',
                    `${this.props.context.adapterName}.${this.props.context.instance}/${this.props.context.projectName}/`,
                );
            }
            if (mrk.longitude || mrk.latitude) {
                // mrk.longitude = 8.40435;
                // mrk.latitude  = 49.013506;
                markers.push(mrk);
            }
        }

        if (!markers.length) {
            return null;
        }

        if (this.fillDataTimer) {
            clearTimeout(this.fillDataTimer);
            this.fillDataTimer = null;
        }

        let tilesUrl;
        let tilesAttribution;
        if (this.state.rxData.theme && mapThemes[this.state.rxData.theme]) {
            tilesUrl = mapThemes[this.state.rxData.theme].url;
            tilesAttribution = mapThemes[this.state.rxData.theme].attribution;
        } else if (this.state.rxData.themeUrl) {
            tilesUrl = this.state.rxData.themeUrl;
            tilesAttribution = this.state.rxData.themeAttribution;
        }

        tilesUrl = tilesUrl || mapThemes.default.url;
        tilesAttribution = tilesAttribution || mapThemes.default.attribution;

        const noInteractions = this.state.rxData.noUserInteractions
            ? {
                  doubleClickZoom: false,
                  closePopupOnClick: false,
                  dragging: false,
                  zoomSnap: 1,
                  zoomDelta: 1,
                  trackResize: false,
                  touchZoom: false,
                  scrollWheelZoom: false,
              }
            : {};

        return (
            <>
                <style>
                    {`.leaflet-control-attribution {
    display: none !important;
}
/*.leaflet-div-icon {
    border-radius: 50%;
}*/`}
                </style>
                <MapContainer
                    style={styles.mapContainer}
                    scrollWheelZoom
                    key={`${tilesUrl}_${!!this.state.rxData.noUserInteractions}`}
                    zoom={parseFloat(this.state.rxData.defaultZoom as string) || 18}
                    center={[0, 0]}
                    zoomControl={false}
                    {...noInteractions}
                >
                    <TileLayer
                        attribution={tilesAttribution}
                        url={tilesUrl}
                    />
                    {!this.state.rxData.hideZoomButtons && !this.state.rxData.noUserInteractions ? (
                        <ZoomControl position="bottomright" />
                    ) : null}
                    {markers.map((marker, index) => {
                        const history =
                            this.state.history[marker.i]?.map(position => {
                                const parts = position.val.split(';');
                                return [parseFloat(parts[1] || '0'), parseFloat(parts[0] || '0')];
                            }) || [];

                        history.push([marker.latitude, marker.longitude]);

                        const markerIcon = marker.icon
                            ? new L.Icon({
                                  iconUrl: marker.icon,
                                  iconRetinaUrl: marker.icon,
                                  iconAnchor: new L.Point(16, 16),
                                  popupAnchor: new L.Point(0, -16),
                                  shadowUrl: undefined,
                                  shadowSize: undefined,
                                  shadowAnchor: undefined,
                                  iconSize: new L.Point(32, 32),
                                  className: 'leaflet-div-icon',
                              })
                            : new L.Icon.Default();

                        return (
                            <React.Fragment key={index}>
                                <Marker
                                    position={[marker.latitude, marker.longitude]}
                                    icon={markerIcon}
                                    title={marker.name}
                                    eventHandlers={{
                                        click: () => {
                                            window.document
                                                .querySelectorAll('.leaflet-popup-close-button')
                                                .forEach(el => el.addEventListener('click', e => e.preventDefault()));
                                        },
                                    }}
                                >
                                    <Popup>{marker.name}</Popup>
                                </Marker>
                                {this.state.history[marker.i]
                                    ? history.map(
                                          (position, historyIndex) =>
                                              historyIndex < history.length - 1 && (
                                                  <Polyline
                                                      key={historyIndex}
                                                      pathOptions={{
                                                          color: marker.color || 'blue',
                                                          opacity: historyIndex + 1 / history.length,
                                                      }}
                                                      // @ts-expect-error fix later
                                                      positions={[position, history[historyIndex + 1]]}
                                                  />
                                              ),
                                      )
                                    : null}
                                {marker.radius ? (
                                    <Circle
                                        center={[marker.latitude, marker.longitude]}
                                        pathOptions={{ color: marker.color || 'blue' }}
                                        radius={marker.radius}
                                    />
                                ) : null}
                            </React.Fragment>
                        );
                    })}
                    <MapContent
                        widget={this}
                        markers={markers}
                        rxData={this.state.rxData}
                        rxStyle={this.state.rxStyle!}
                    />
                </MapContainer>
            </>
        );
    }

    renderDialog(): React.ReactNode {
        return (
            <Dialog
                open={!!this.state.dialog}
                fullScreen
                onClose={() => this.setState({ dialog: false })}
            >
                <DialogTitle style={styles.dialogTitle}>
                    {this.state.rxData.widgetTitle}
                    <IconButton onClick={() => this.setState({ dialog: false })}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>{this.renderMap()}</DialogContent>
            </Dialog>
        );
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element[] | React.JSX.Element | null {
        super.renderWidgetBody(props);

        const content = (
            <>
                {this.renderDialog()}
                {this.renderMap()}
            </>
        );

        const iconFull = this.state.rxData.hideFullScreenButton ? null : (
            <IconButton onClick={() => this.setState({ dialog: true })}>
                <OpenInFullIcon
                    style={{
                        color:
                            (this.state.rxData.noCard || props.widget.usedInWidget) &&
                            (!this.state.rxData.theme ||
                                this.state.rxData.theme === 'default' ||
                                this.state.rxData.theme === 'stadiaosmbright')
                                ? '#111'
                                : undefined,
                    }}
                />
            </IconButton>
        );

        if (this.state.rxData.noCard || props.widget.usedInWidget) {
            return (
                <div style={{ width: '100%', height: '100%' }}>
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            zIndex: 500,
                        }}
                    >
                        {iconFull}
                    </div>
                    {content}
                </div>
            );
        }

        return this.wrapContent(
            content,
            this.state.rxData.widgetTitle ? (
                iconFull
            ) : (
                <div style={{ display: 'flex', width: '100%' }}>
                    <div style={{ flex: 1 }} />
                    {iconFull}
                </div>
            ),
            {
                boxSizing: 'border-box',
                paddingBottom: 10,
                height: '100%',
            },
        );
    }
}
