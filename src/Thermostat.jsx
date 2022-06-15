import React from 'react';
import { CircularSliderWithChildren } from 'react-circular-slider-svg';
import { i18n } from '@iobroker/adapter-react-v5';
import {
    Card, CardContent, CardHeader, Dialog, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, Tab, Tabs, TextField, Tooltip,
} from '@mui/material';
import ThermostatAutoIcon from '@mui/icons-material/ThermostatAuto';
import PanToolIcon from '@mui/icons-material/PanTool';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import DryIcon from '@mui/icons-material/Dry';
import ParkIcon from '@mui/icons-material/Park';
import HouseboatIcon from '@mui/icons-material/Houseboat';

import WbSunnyIcon from '@mui/icons-material/WbSunny';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import AirIcon from '@mui/icons-material/Air';

import {
    MoreVert as MoreVertIcon,
} from '@mui/icons-material';

import VisRxWidget from './visRxWidget';
import ObjectChart from './ObjectChart';

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

class Thermostat extends (window.visRxWidget || VisRxWidget) {
    constructor(props) {
        super(props);
        this.state.showDialog = false;
        this.state.dialogTab = 0;
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterialDemo',
            visSet: 'material-widgets',
            visName: 'Demo',
            visAttrs: 'name;oid-mode;oid-temp;oid-temp-state;oid-power',
            visAttrsNew: [
                {
                    name: 'name',
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
            visPrev: 'widgets/material-widgets/img/prev_switch.png',
        };
    }

    getSubscribeState = (id, cb) => {
        this.props.socket.getState(id).then(result => cb(result));
        this.props.socket.subscribeState(id, (resultId, result) => cb(result));
    };

    async componentDidMount() {
        super.componentDidMount();
        if (this.state.data['oid-mode']) {
            const modeVal = await this.props.socket.getState(this.state.data['oid-mode']);
            this.setState({ mode: modeVal.val });
            const mode = await this.props.socket.getObject(this.state.data['oid-mode']);
            this.setState({ modes: mode.common.states });
        }
        if (this.state.data['oid-power']) {
            const powerVal = await this.props.socket.getState(this.state.data['oid-power']);
            this.setState({ power: powerVal.val });
        }
        if (this.state.data['oid-temp']) {
            const temp = await this.props.socket.getState(this.state.data['oid-temp']);
            this.setState({ temp: temp.val });
            const tempObject = await this.props.socket.getObject(this.state.data['oid-temp']);
            this.setState({ min: tempObject.common.min, max: tempObject.common.max, tempObject });
        }
        if (this.state.data['oid-temp-state']) {
            const tempStateObject = await this.props.socket.getObject(this.state.data['oid-temp-state']);
            this.setState({ tempStateObject });
            this.getSubscribeState(
                this.state.data['oid-temp-state'],
                tempState => this.setState({ tempState: tempState.val }),
            );
        }
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Thermostat.getWidgetInfo();
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        return <div style={{ textAlign: 'center' }}>
            <Card
                style={{ width: this.state.style?.width, height: this.state.style?.height }}
            >
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
                        handle1={{
                            value: this.state.temp || null,
                            onChange: value => {
                                this.setState({ temp: Math.round(value) });
                                this.props.socket.setState(this.state.data['oid-temp'], Math.round(value));
                            },
                        }}
                    >
                        <h2>
                            {this.state.tempState}
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
                                <Tooltip title={i18n.t(mode)}>
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
                            <Tooltip title={i18n.t('Power')}>
                                <PowerSettingsNewIcon />
                            </Tooltip>
                        </IconButton>}
                    </div>
                </CardContent>
            </Card>
            <Dialog
                sx={{ '& .MuiDialog-paper': { height: '100%' } }}
                fullWidth
                open={!!this.state.showDialog}
                onClose={() => this.setState({ showDialog: false })}
            >
                <DialogTitle>{this.state.data.name}</DialogTitle>
                <DialogContent>
                    <Tabs value={this.state.dialogTab} onChange={(e, value) => this.setState({ dialogTab: value })}>
                        <Tab label={i18n.t('Properties')} value={0} />
                        <Tab label={i18n.t('History')} value={1} />
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
                            label={i18n.t('Temperature')}
                        />
                        <FormControl fullWidth variant="standard">
                            <InputLabel>{i18n.t('Mode')}</InputLabel>
                            <Select
                                value={this.state.mode}
                                onChange={e => {
                                    this.setState({ mode: parseInt(e.target.value) });
                                    this.props.socket.setState(this.state.data['oid-mode'], parseInt(e.target.value));
                                }}
                            >
                                {this.state.modes ? Object.keys(this.state.modes).map(modeIndex => {
                                    const mode = this.state.modes[modeIndex];
                                    return <MenuItem key={modeIndex} value={modeIndex}>{i18n.t(mode)}</MenuItem>;
                                }) : null}
                            </Select>
                        </FormControl>
                    </div>}
                    {this.state.dialogTab === 1 && <div style={{ height: 'calc(100% - 64px)' }}>
                        <ObjectChart
                            t={i18n.t}
                            lang={i18n.lang}
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
            </Dialog>
        </div>;
    }
}

export default Thermostat;
