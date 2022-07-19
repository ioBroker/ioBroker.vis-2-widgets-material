import React from 'react';
import { CircularSliderWithChildren } from 'react-circular-slider-svg';
import {
    Card, CardContent, CardHeader, Dialog, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, Tab, Tabs, TextField, Tooltip,
} from '@mui/material';

import {
    WbSunny as WbSunnyIcon,
    PowerSettingsNew as PowerSettingsNewIcon,
    Air as AirIcon,
    ThermostatAuto as ThermostatAutoIcon,
    PanTool as PanToolIcon,
    AcUnit as AcUnitIcon,
    Dry as DryIcon,
    Park as ParkIcon,
    Houseboat as HouseboatIcon,
    MoreVert as MoreVertIcon,
} from '@mui/icons-material';

import { i18n as I18n } from '@iobroker/adapter-react-v5';
import { VisRxWidget } from '@iobroker/vis-widgets-react-dev';

import ObjectChart from './ObjectChart';
import {withStyles} from "@mui/styles";

const Buttons = {
    AUTO: ThermostatAutoIcon,
    MANUAL: PanToolIcon,
    VACATION: HouseboatIcon,
    COOL: AcUnitIcon,
    DRY: DryIcon,
    ECO: ParkIcon,
    FAN_ONLY: AirIcon,
    HEAT: WbSunnyIcon,
    OFF: PowerSettingsNewIcon,
};


const styles = theme => ({
    root: {
        width: 'calc(100% - 8px)',
        height: 'calc(100% - 8px)',
        margin: 4,
    },
});

class Thermostat extends (window.visRxWidget || VisRxWidget) {
    constructor(props) {
        super(props);
        this.state.showDialog = false;
        this.state.dialogTab = 0;
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Thermostat',
            visSet: 'vis-2-widgets-material',
            visName: 'Thermostat',
            visAttrs: [{
                name: 'common',
                fields: [
                    {
                        name: 'name',
                        label: 'vis_2_widgets_material_name',
                    },
                    {
                        name: 'oid-mode',
                        type: 'id',
                    },
                    {
                        name: 'oid-temp',
                        type: 'id',
                    },
                    {
                        name: 'oid-temp-state',
                        type: 'id',
                    },
                    {
                        name: 'oid-power',
                        type: 'id',
                    },
                ],
            },
            ],
            visPrev: 'widgets/material-widgets/img/prev_switches.png',
        };
    }

    async propertiesUpdate() {
        if (this.state.data['oid-mode']) {
            const modeVal = await this.props.socket.getState(this.state.data['oid-mode']);
            this.setState({ mode: modeVal?.val });
            const mode = await this.props.socket.getObject(this.state.data['oid-mode']);
            this.setState({ modes: mode?.common?.states });
        } else {
            this.setState({ mode: null, modes: null });
        }
        if (this.state.data['oid-power']) {
            const powerVal = await this.props.socket.getState(this.state.data['oid-power']);
            this.setState({ power: powerVal?.val });
        } else {
            this.setState({ power: null });
        }
        if (this.state.data['oid-temp']) {
            const temp = await this.props.socket.getState(this.state.data['oid-temp']);
            this.setState({ temp: temp?.val });
            const tempObject = await this.props.socket.getObject(this.state.data['oid-temp']);
            this.setState({ min: tempObject?.common?.min, max: tempObject?.common?.max, tempObject });
        } else {
            this.setState({ tempObject: null, min: null, max: null });
        }
        if (this.state.data['oid-temp-state']) {
            const tempStateObject = await this.props.socket.getObject(this.state.data['oid-temp-state']);
            this.setState({ tempStateObject });
        } else {
            this.setState({ tempState: null });
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.propertiesUpdate();
    }

    onPropertiesUpdated() {
        super.onPropertiesUpdated();
        this.propertiesUpdate();
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Thermostat.getWidgetInfo();
    }

    renderDialog() {
        if (!this.state.showDialog) {
            return null
        }
        return <Dialog
            sx={{ '& .MuiDialog-paper': { height: '100%' } }}
            fullWidth
            open={true}
            onClose={() => this.setState({ showDialog: false })}
        >
            <DialogTitle>{this.state.data.name}</DialogTitle>
            <DialogContent>
                <Tabs value={this.state.dialogTab} onChange={(e, value) => this.setState({ dialogTab: value })}>
                    <Tab label={I18n.t('Properties')} value={0} />
                    <Tab label={I18n.t('History')} value={1} />
                </Tabs>
                {this.state.dialogTab === 0 && <div>
                    <TextField
                        fullWidth
                        value={this.state.temp || null}
                        onChange={e => {
                            this.setState({ temp: Math.round(e.target.value) });
                            this.props.socket.setState(this.state.data['oid-temp'], Math.round(e.target.value));
                        }}
                        variant="standard"
                        type="number"
                        inputProps={{
                            min: this.state.min,
                            max: this.state.max,
                        }}
                        label={I18n.t('Temperature')}
                    />
                    <FormControl fullWidth variant="standard">
                        <InputLabel>{I18n.t('Mode')}</InputLabel>
                        <Select
                            value={this.state.mode}
                            onChange={e => {
                                this.setState({ mode: parseInt(e.target.value) });
                                this.props.socket.setState(this.state.data['oid-mode'], parseInt(e.target.value));
                            }}
                        >
                            {this.state.modes ? Object.keys(this.state.modes).map(modeIndex => {
                                const mode = this.state.modes[modeIndex];
                                return <MenuItem key={modeIndex} value={modeIndex}>{I18n.t(mode)}</MenuItem>;
                            }) : null}
                        </Select>
                    </FormControl>
                </div>}
                {this.state.dialogTab === 1 && <div style={{ height: 'calc(100% - 64px)' }}>
                    <ObjectChart
                        t={I18n.t}
                        lang={I18n.lang}
                        socket={this.props.socket}
                        obj={this.state.tempStateObject}
                        themeType={this.props.themeType}
                        defaultHistory="history.0"
                        noToolbar
                        dateFormat=""
                        customsInstances={[]}
                    />
                </div>}
            </DialogContent>
        </Dialog>;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        return <Card style={{ width: 'calc(100% - 8px)', height: 'calc(100% - 8px)', margin: 4 }}>
            {this.renderDialog()}
            <CardHeader
                title={this.state.data.name}
                action={
                    <IconButton onClick={() => this.setState({ showDialog: true })}>
                        <MoreVertIcon />
                    </IconButton>
                }
            />
            <CardContent style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
            >
                <CircularSliderWithChildren
                    minValue={this.state.min}
                    maxValue={this.state.max}
                    arcColor={this.props.themeType === 'dark' ? '#fff' : '#000'}
                    handle1={{
                        value: this.state.temp || null,
                        onChange: value => {
                            this.setState({ temp: Math.round(value) });
                            this.props.socket.setState(this.state.data['oid-temp'], Math.round(value));
                        },
                    }}
                >
                    <h2>
                        {this.state.values[`${this.state.data['oid-temp-state']}.val`]}
                        {this.state.tempStateObject?.common.unit}
                    </h2>
                    <div>
                        {this.state.temp}
                        {this.state.tempObject?.common.unit}
                    </div>
                </CircularSliderWithChildren>
                <div>
                    {this.state.modes ? Object.keys(this.state.modes).map(modeIndex => {
                        const mode = this.state.modes[modeIndex];
                        const ModeButton = Buttons[mode];
                        return <IconButton
                            key={modeIndex}
                            color={this.state.mode === parseInt(modeIndex) ? 'primary' : 'default'}
                            onClick={e => {
                                this.setState({ mode: parseInt(modeIndex) });
                                this.props.socket.setState(this.state.data['oid-mode'], parseInt(modeIndex));
                            }}
                        >
                            <Tooltip title={I18n.t(mode)}>
                                <ModeButton />
                            </Tooltip>
                        </IconButton>;
                    }) : null}
                    {this.state.data['oid-power'] &&
                    <IconButton
                        color={this.state.power ? 'primary' : 'default'}
                        onClick={e => {
                            this.setState({ power: !this.state.power });
                            this.props.socket.setState(this.state.data['oid-power'], !this.state.power);
                        }}
                    >
                        <Tooltip title={I18n.t('Power')}>
                            <PowerSettingsNewIcon />
                        </Tooltip>
                    </IconButton>}
                </div>
            </CardContent>
        </Card>;
    }
}

export default withStyles(styles)(Thermostat);
