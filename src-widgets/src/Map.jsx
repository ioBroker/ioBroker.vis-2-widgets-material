import React from 'react';
import { withStyles } from '@mui/styles';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import {
    Popup, TileLayer, MapContainer, Marker, useMap,
} from 'react-leaflet';

import {
    Dialog, DialogContent, DialogTitle, IconButton,
} from '@mui/material';

import { Close as CloseIcon, OpenInFull as OpenInFullIcon } from '@mui/icons-material';

import Generic from './Generic';

// L.Popup.include({
//     _originalInitLayout: L.Popup.prototype._initLayout, // Keep a reference to super method

//     _initLayout() {
//         this._originalInitLayout();
//         this._closeButton.addEventListener('click', e => e.preventDefault());
//     },
// });

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const styles = theme => ({

});

const MapContent = props => {
    const map = useMap();
    map.fitBounds(props.markers.map(marker => [marker.latitude || 0, marker.longitude || 0]));
};

class Map extends Generic {
    constructor(props) {
        super(props);
        this.state.dialog = false;
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

    }

    async componentDidMount() {
        super.componentDidMount();
        await this.propertiesUpdate();
    }

    async onPropertiesUpdated() {
        super.onPropertiesUpdated();
        await this.propertiesUpdate();
    }

    renderMap() {
        const markers = [];

        for (let i = 1; i <= this.state.rxData.markersCount; i++) {
            markers.push({
                longitude: this.getPropertyValue(`position${i}`)?.split(';')[0] || this.getPropertyValue(`longitude${i}`),
                latitude: this.getPropertyValue(`position${i}`)?.split(';')[1] || this.getPropertyValue(`latitude${i}`),
                name: this.state.rxData[`name${i}`],
                color: this.state.rxData[`color${i}`],
                icon: this.state.rxData[`icon${i}`],
            });
        }

        console.log(markers);

        const map = <>
            <style>
                {`.leaflet-control-attribution svg {
                    display: none !important;
                }`}
            </style>
            <MapContainer
                style={{ width: '100%', height: '100%' }}
                center={[51.505, -0.09]}
                zoom={13}
                scrollWheelZoom
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[51.505, -0.09]}>
                    <Popup>
      A pretty CSS3 popup.
                        {' '}
                        <br />
                        {' '}
Easily customizable.
                    </Popup>
                </Marker>
                {
                    markers.map((marker, index) => (
                        <Marker key={index} position={[parseFloat(marker.latitude) || 0, parseFloat(marker.longitude) || 0]}>
                            <Popup>
                                {marker.name}
                            </Popup>
                        </Marker>
                    ))
                }
                <MapContent widget={this} markers={markers} />
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
            <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
