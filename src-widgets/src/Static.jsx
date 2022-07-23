import React from 'react';
import { withStyles } from '@mui/styles';

import {
    Dialog, DialogContent, DialogTitle, IconButton, Switch,
} from '@mui/material';

import Generic from './Generic';
import {Close as IconClose} from "@mui/icons-material";
import ObjectChart from "./ObjectChart";
import {i18n as I18n} from "@iobroker/adapter-react-v5";
import PropTypes from "prop-types";

const styles = theme => ({
    newValueLight: {
        animation: '$newValueAnimationLight 2s ease-in-out'
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
        }
    },
    newValueDark: {
        animation: '$newValueAnimationDark 2s ease-in-out'
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
        }
    },
});

class Static extends Generic {
    constructor(props) {
        super(props);
        this.state.objects = {};
        this.state.showDialog = null;
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Static',
            visSet: 'vis-2-widgets-material',
            visName: 'Static information',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            label: 'vis_2_widgets_material_name',
                            name: 'name',
                        },
                        {
                            name: 'count',
                            type: 'number',
                            default: 2,
                            label: 'vis_2_widgets_material_count',
                        },
                    ],
                },
                {
                    name: 'switch',
                    indexFrom: 1,
                    indexTo: 'count',
                    fields: [
                        {
                            name: 'oid',
                            type: 'id',
                            label: 'vis_2_widgets_material_oid',
                        },
                        {
                            name: 'icon',
                            type: 'image',
                            label: 'vis_2_widgets_material_icon',
                        },
                        {
                            name: 'iconEnabled',
                            type: 'image',
                            label: 'vis_2_widgets_material_icon_active',
                        },
                        {
                            name: 'color',
                            type: 'color',
                            label: 'vis_2_widgets_material_color',
                        },
                        {
                            name: 'colorEnabled',
                            type: 'color',
                            label: 'vis_2_widgets_material_color_active',
                        },
                        {
                            name: 'title',
                            type: 'text',
                            label: 'vis_2_widgets_material_title',
                        },
                    ],
                },
            ],
            visPrev: 'widgets/vis-2-widgets-material/img/prev_static.png',
        };
    }

    async propertiesUpdate() {
        const objects = {};

        // try to find icons for all OIDs
        for (let i = 1; i <= this.state.data.count; i++) {
            if (this.state.data[`oid${i}`]) {
                // read object itself
                const object = await this.props.socket.getObject(this.state.data[`oid${i}`]);
                if (!object) {
                    objects[i] = { common: {} };
                    continue;
                }
                object.common = object.common || {};
                object.isChart = !!(object.common.custom && object.common.custom[this.props.systemConfig?.common?.defaultHistory]);
                if (!this.state.data[`icon${i}`] && !object.common.icon && (object.type === 'state' || object.type === 'channel')) {
                    const idArray = this.state.data[`oid${i}`].split('.');

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
                objects[i] = object;
            }
        }

        this.setState({ objects });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Static.getWidgetInfo();
    }

    componentDidMount() {
        super.componentDidMount();
        this.propertiesUpdate()
            .then(() => {});
    }

    onPropertiesUpdated() {
        super.onPropertiesUpdated();
        this.propertiesUpdate()
            .then(() => {});
    }

    getStateIcon(key) {
        let icon = '';
        const isEnabled = this.state.objects[key].common.type === 'boolean' && this.state.values[`${this.state.data[`oid${key}`]}.val`];
        if (isEnabled) {
            if (this.state.data[`iconEnabled${key}`]) {
                icon = `files/${this.state.data[`iconEnabled${key}`]}`;
            }
        } else if (this.state.data[`icon${key}`]) {
            icon = `files/${this.state.data[`icon${key}`]}`;
        }

        if (!icon) {
            icon = this.state.objects[key].common.icon;
        }

        if (icon) {
            icon = <img
                src={icon}
                alt={isEnabled ? 'activ' : 'inactiv'}
                style={{
                    maxWidth: 40,
                    maxHeight: 40,
                }}
            />;
        } else {
            // icon = <LightbulbIcon color={isEnabled ? 'primary' : undefined} />;
        }

        return icon;
    }

    getColor(key) {
        const isEnabled = this.state.objects[key].common.type === 'boolean' && this.state.values[`${this.state.data[`oid${key}`]}.val`];
        return isEnabled ?
            this.state.data[`colorEnabled${key}`] || this.state.objects[key].common.color
            :
            this.state.data[`color${key}`] || this.state.objects[key].common.color;
    }

    getValue(key, classUpdateVal) {
        const object = this.state.objects[key];
        const state = this.state.values[`${this.state.data[`oid${key}`]}.val`];
        if (state === undefined) {
            return '';
        }
        if (object?.common?.states) {
            if (object.common.states[state?.toString()] !== undefined) {
                return object.common.states[state.toString()];
            }

            return state.toString();
        }

        const onClick = object.isChart ? e => {
            e.preventDefault();
            e.stopPropagation();
            this.setState({ showDialog: object });
        } : undefined;

        if (object?.common?.type === 'boolean') {
            return <Switch
                checked={state}
                onClick={onClick}
                style={{ cursor: onClick ? 'pointer' : 'default' }}
            />;
        }
        let val;

        if (object?.common?.type === 'number') {
            val = `${state}${object.common.unit || ''}`;
        } else {
            val = this.formatValue(state);
        }
        return <span
            key={`${val}valText`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
            className={classUpdateVal}
        >{val}</span>;
    }

    renderDialog() {
        if (!this.state.showDialog) {
            return null
        }
        return <Dialog
            sx={{'& .MuiDialog-paper': {height: '100%'}}}
            maxWidth="lg"
            fullWidth
            open={true}
            onClose={() => this.setState({showDialog: false})}
        >
            <DialogTitle>
                {this.state.data.name}
                <IconButton
                    style={{ float: 'right' }}
                    onClick={() => this.setState({ showDialog: false })}
                >
                    <IconClose/>
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <ObjectChart
                    t={I18n.t}
                    lang={I18n.getLanguage()}
                    socket={this.props.socket}
                    obj={this.state.showDialog}
                    themeType={this.props.themeType}
                    defaultHistory={this.props.systemConfig?.common?.defaultHistory || 'history.0'}
                    noToolbar={false}
                    systemConfig={this.props.systemConfig}
                    dateFormat={this.props.systemConfig.common.dateFormat}
                />
            </DialogContent>
        </Dialog>;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const icons = Object.keys(this.state.objects).map(key => this.getStateIcon(key));
        const anyIcon = icons.find(icon => icon);
        const classUpdateVal = this.props.themeType === 'dark' ? this.props.classes.newValueDark: this.props.classes.newValueLight;

        const content = <>
            {this.renderDialog()}
            {Object.keys(this.state.objects).map((key, i) =>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        alignItems: 'center',
                    }}
                    key={key}
                >
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {anyIcon ? <span style={{
                            width: 40,
                            height: 40,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        >
                            {icons[i]}
                        </span> : null}
                        <span style={{ color: this.getColor(key), paddingLeft: 16 }}>
                            {this.state.data['title' + key] || this.state.objects[key].common.name}
                        </span>
                    </span>

                    {this.getValue(key, classUpdateVal)}
                </div>
            )}
        </>;

        return this.wrapContent(content);
    }
}

Static.propTypes = {
    systemConfig: PropTypes.object,
    socket: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default withStyles(styles)(Static);