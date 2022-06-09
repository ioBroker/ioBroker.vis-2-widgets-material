import React from 'react';
import { CircularSliderWithChildren } from 'react-circular-slider-svg';

import {
    Button, Card, CardContent, CardHeader, Dialog, DialogContent, DialogTitle, IconButton, MenuItem, Select, Slider, Tab, Tabs, Tooltip,
} from '@mui/material';
import ThermostatAutoIcon from '@mui/icons-material/ThermostatAuto';
import PanToolIcon from '@mui/icons-material/PanTool';
import ForestIcon from '@mui/icons-material/Forest';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import DryIcon from '@mui/icons-material/Dry';
import ParkIcon from '@mui/icons-material/Park';

import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

import {
    MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import i18n from '@iobroker/adapter-react-v5/i18n';
import VisRxWidget from './visRxWidget';

const Buttons = {
    AUTO: ThermostatAutoIcon,
    MANUAL: PanToolIcon,
    VACATION: ForestIcon,
    COOL: AcUnitIcon,
    DRY: DryIcon,
    ECO: ParkIcon,
    FAN_ONLY: ThermostatAutoIcon,
    HEAT: ThermostatAutoIcon,
    OFF: PowerSettingsNewIcon,
};

class Thermostat extends VisRxWidget {
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
            visPrev: 'widgets/material-widgets/img/prev_switch.png',
        };
    }

    getSubscribeState = (id, cb) => {
        this.props.socket.getState(id).then(result => cb(result));
        this.props.socket.subscribeState(id, (resultId, result) => cb(result));
    };

    async componentDidMount() {
        super.componentDidMount();
        if (this.props.data['oid-mode']) {
            const modeVal = await this.props.socket.getState(this.props.data['oid-mode']);
            this.setState({ mode: modeVal.val });
            const mode = await this.props.socket.getObject(this.props.data['oid-mode']);
            this.setState({ modes: mode.common.states });
        }
        if (this.props.data['oid-temp']) {
            const temp = await this.props.socket.getState(this.props.data['oid-temp']);
            this.setState({ temp: temp.val });
            const tempObject = await this.props.socket.getObject(this.props.data['oid-temp']);
            this.setState({ min: tempObject.common.min, max: tempObject.common.max });
        }
        if (this.props.data['oid-temp-state']) {
            this.getSubscribeState(
                this.props.data['oid-temp-state'],
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

        return <div>
            <Card
                style={{ width: this.state.style?.width, height: this.state.style?.height }}
            >
                <IconButton onClick={() => this.setState({ showDialog: true })}>
                    <MoreVertIcon />
                </IconButton>
                <CardHeader title={this.state.data.name} />
                <CardContent>
                    <CircularSliderWithChildren
                        minValue={this.state.min}
                        maxValue={this.state.max}
                        handle1={{
                            value: this.state.temp || null,
                            onChange: value => {
                                this.setState({ temp: Math.round(value) });
                                this.props.socket.setState(this.props.data['oid-temp'], Math.round(value));
                            },
                        }}
                    >
                        <h2>{this.state.tempState}</h2>
                        <div>{this.state.temp}</div>
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
                                    this.props.socket.setState(this.props.data['oid-mode'], parseInt(modeIndex));
                                }}
                            >
                                <Tooltip title={i18n.t(mode)}>
                                    <ModeButton />
                                </Tooltip>
                            </IconButton>;
                        }) : null}
                    </div>
                </CardContent>
            </Card>
            <Dialog open={!!this.state.showDialog} onClose={() => this.setState({ showDialog: false })}>
                <DialogTitle>{this.state.data.name}</DialogTitle>
                <DialogContent>
                    <Tabs value={this.state.dialogTab} onChange={(e, value) => this.setState({ dialogTab: value })}>
                        <Tab label={i18n.t('Properties')} value={0} />
                        <Tab label={i18n.t('History')} value={1} />
                    </Tabs>
                    {this.state.dialogTab === 0 && <div>
                        <Select
                            fullWidth
                            value={this.state.mode}
                            onChange={e => {
                                this.setState({ mode: parseInt(e.target.value) });
                                this.props.socket.setState(this.props.data['oid-mode'], parseInt(e.target.value));
                            }}
                        >
                            {this.state.modes ? Object.keys(this.state.modes).map(modeIndex => {
                                const mode = this.state.modes[modeIndex];
                                return <MenuItem value={modeIndex}>{i18n.t(mode)}</MenuItem>;
                            }) : null}
                        </Select>
                    </div>}
                </DialogContent>
            </Dialog>
        </div>;
    }
}

export default Thermostat;
