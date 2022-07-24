import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { CircularSliderWithChildren } from 'react-circular-slider-svg';

import {
    Button, Dialog, DialogContent, DialogTitle, IconButton, Tooltip,
} from '@mui/material';

// import { FormControl, InputLabel, MenuItem, Select, Tab, Tabs, TextField } from '@mui/material';

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
    Close as IconClose,
} from '@mui/icons-material';

import { i18n as I18n } from '@iobroker/adapter-react-v5';

import ObjectChart from './ObjectChart';
import Generic from './Generic';

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
    circleDiv: {
        width: '100%',
        height: '100%',
        '& svg circle': {
            cursor: 'pointer',
        },
        '&>div': {
            margin: 'auto',
            '&>div': {
                transform: 'translate(-40%, -50%) !important',
                top: '45% !important',
            }
        },
    },
    moreButton: {
        position: 'absolute',
        top: 4,
        right: 4,
    },
    buttonsDiv: {
        textAlign: 'center',
    },
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

class Thermostat extends Generic {
    constructor(props) {
        super(props);
        this.state.showDialog = false;
        this.state.dialogTab = 1;
        this.state.size = 0;
        this.refContainer = React.createRef();
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
                        label: 'vis_2_widgets_material_mode_oid',
                    },
                    {
                        name: 'oid-temp-set',
                        type: 'id',
                        label: 'vis_2_widgets_material_temperature_oid',
                    },
                    {
                        name: 'oid-temp-actual',
                        type: 'id',
                        label: 'vis_2_widgets_material_actual_oid',
                    },
                    {
                        name: 'oid-power',
                        type: 'id',
                        label: 'vis_2_widgets_material_power_oid',
                    },
                    {
                        name: 'oid-step',
                        type: 'select',
                        label: 'vis_2_widgets_material_step',
                        options: ['0.5', '1'],
                        default: '1',
                    },
                ],
            }],
            visPrev: 'widgets/vis-2-widgets-material/img/prev_thermostat.png',
        };
    }

    async propertiesUpdate() {
        const newState = {};

        if (this.state.data['oid-mode'] && this.state.data['oid-mode'] !== 'nothing_selected') {
            const mode = await this.props.socket.getObject(this.state.data['oid-mode']);
            newState.modes = mode?.common?.states;
            newState.modeObject = mode;
            if (Array.isArray(newState.modes)) {
                const result = {};
                newState.modes.forEach(m => result[m] = m);
                newState.modes = result;
            }
        } else {
            newState.modes = null;
            newState.mode = null;
        }

        if (this.state.data['oid-temp-set'] && this.state.data['oid-temp-set'] !== 'nothing_selected') {
            const tempObject = await this.props.socket.getObject(this.state.data['oid-temp-set']);
            newState.min = tempObject?.common?.min === undefined ? 12 : tempObject.common.min;
            newState.max = tempObject?.common?.max === undefined ? 30 : tempObject.common.max;
            newState.tempObject = tempObject;
        } else {
            newState.tempObject = null;
            newState.temp = null;
            newState.max = null;
            newState.min = null;
        }

        if (this.state.data['oid-temp-actual'] && this.state.data['oid-temp-actual'] !== 'nothing_selected') {
            newState.tempStateObject = await this.props.socket.getObject(this.state.data['oid-temp-actual']);
        } else {
            newState.tempStateObject = null;
        }

        newState.isChart = (newState.tempObject?.common?.custom && newState.tempObject.common.custom[this.props.systemConfig.common.defaultHistory]) ||
            (newState.tempStateObject?.common?.custom && newState.tempStateObject.common.custom[this.props.systemConfig.common.defaultHistory]);

        this.setState(newState);
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

    formatValue(value, round) {
        if (typeof value === 'number') {
            if (round === 0) {
                value = Math.round(value);
            } else {
                value = Math.round(value * 100) / 100;
            }
            if (this.props.systemConfig?.common) {
                if (this.props.systemConfig.common.isFloatComma) {
                    value = value.toString().replace('.', ',');
                }
            }
        }

        return value === undefined || value === null ? '' : value.toString();
    }

    renderDialog() {
        if (!this.state.showDialog) {
            return null
        }
        return <Dialog
            sx={{ '& .MuiDialog-paper': { height: '100%' } }}
            maxWidth="lg"
            fullWidth
            open={true}
            onClose={() => this.setState({ showDialog: false })}
        >
            <DialogTitle>
                {this.state.data.name}
                <IconButton style={{ float: 'right' }} onClick={() => this.setState({ showDialog: false })}><IconClose /></IconButton>
            </DialogTitle>
            <DialogContent>
                {/*<Tabs value={this.state.dialogTab} onChange={(e, value) => this.setState({ dialogTab: value })}>
                    <Tab label={I18n.t('Properties')} value={0} />
                    <Tab label={I18n.t('History')} value={1} />
                </Tabs>
                {this.state.dialogTab === 0 && <div>
                    <TextField
                        fullWidth
                        value={this.state.temp || null}
                        onChange={e => {
                            this.setState({ temp: Math.round(e.target.value) });
                            this.props.socket.setState(this.state.data['oid-temp-set'], Math.round(e.target.value));
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
                </div>*/}
                {this.state.dialogTab === 1 && <div style={{ height: '100%' }}>
                    <ObjectChart
                        t={I18n.t}
                        lang={I18n.getLanguage()}
                        socket={this.props.socket}
                        obj={this.state.tempStateObject || this.state.tempObject}
                        obj2={!this.state.tempStateObject ? null : this.state.tempObject}
                        objLineType={this.state.tempStateObject ? 'line' : 'step'}
                        obj2LineType="step"
                        themeType={this.props.themeType}
                        defaultHistory={this.props.systemConfig?.common?.defaultHistory || 'history.0'}
                        noToolbar={false}
                        systemConfig={this.props.systemConfig}
                        dateFormat={this.props.systemConfig.common.dateFormat}
                    />
                </div>}
            </DialogContent>
        </Dialog>;
    }

    componentDidUpdate() {
        if (super.componentDidUpdate) {
            super.componentDidUpdate();
        }
        if (this.refContainer.current) {
            let size = this.refContainer.current.clientWidth;
            if (size > this.refContainer.current.clientHeight) {
                size = this.refContainer.current.clientHeight;
            }
            if (this.state.data.name) {
                size -= 64; // header
            }
            size -= 20; // mode buttons

            if (size !== this.state.width) {
                this.setState({ width: size });
            }
        }
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        let tempValue = this.state.values[this.state.data['oid-temp-set'] + '.val'];
        if (tempValue === undefined) {
            tempValue = null;
        }
        if (tempValue !== null && tempValue < this.state.min) {
            tempValue = this.state.min;
        } else
        if (tempValue !== null && tempValue > this.state.max) {
            tempValue = this.state.max;
        }

        if (tempValue === null) {
            tempValue = (this.state.max - this.state.min) / 2 + this.state.min;
        }

        let actualTemp = this.state.values[this.state.data['oid-temp-actual'] + '.val'];
        if (actualTemp === undefined) {
            actualTemp = null;
        }

        let handleSize = Math.round(this.state.width / 25);
        if (handleSize < 8) {
            handleSize = 8;
        }

        console.log(this.state.min, this.state.max, tempValue);

        const chartButton = this.state.isChart ? <IconButton
            className={this.state.data.name ? '' : this.props.classes.moreButton}
            onClick={() => this.setState({ showDialog: true })}
        >
            <MoreVertIcon />
        </IconButton> : null;

        actualTemp = actualTemp !== null ? this.formatValue(actualTemp) : null;

        const content = <div ref={this.refContainer} style={{ width: '100%', height: '100%' }} className={this.props.classes.circleDiv}>
            {this.state.data.name ? null : chartButton}
            {this.state.width && this.state.tempObject ?
                <CircularSliderWithChildren
                    minValue={this.state.min}
                    maxValue={this.state.max}
                    size={this.state.width}
                    arcColor={this.props.themeType === 'dark' ? '#fff' : '#000'}
                    startAngle={40}
                    step={0.5}
                    handleSize={handleSize}
                    endAngle={320}
                    handle1={{
                        value: tempValue,
                        onChange: value => {
                            const values = JSON.parse(JSON.stringify(this.state.values));
                            if (this.state.data['oid-step'] === '0.5') {
                                values[this.state.data['oid-temp-set'] + '.val'] = Math.round(value * 2) / 2;
                            } else {
                                values[this.state.data['oid-temp-set'] + '.val'] = Math.round(value);
                            }
                            this.setState({ values });
                        },
                    }}
                    onControlFinished={() =>
                        this.props.socket.setState(this.state.data['oid-temp-set'], this.state.values[this.state.data['oid-temp-set'] + '.val'])}
                >
                    {actualTemp !== null ? <Tooltip title={I18n.t('vis_2_widgets_material_actual_temperature')}>
                        <div
                            key={`${actualTemp}valText`}
                            style={{ fontSize: Math.round(this.state.width / 10), fontWeight: 'bold' }}
                            className={this.props.themeType === 'dark' ? this.props.classes.newValueDark: this.props.classes.newValueLight}
                        >
                            {actualTemp}
                            {this.state.tempStateObject?.common?.unit}
                        </div>
                    </Tooltip> : null}
                    {tempValue !== null ? <Tooltip title={I18n.t('vis_2_widgets_material_desired_temperature')}>
                        <div style={{ fontSize: Math.round(this.state.width * 0.6 / 10) }}>
                            {this.formatValue(tempValue)}
                            {this.state.tempObject?.common?.unit}
                        </div>
                    </Tooltip> : null}
                </CircularSliderWithChildren>
                : null}
            <div className={this.props.classes.buttonsDiv}>
                {this.state.modes && (!this.state.data['oid-power'] || this.state.values[this.state.data['oid-power'] + '.val']) ?
                    Object.keys(this.state.modes).map((modeIndex, i) => {
                        const mode = this.state.modes[modeIndex];
                        const MyButtonIcon = Buttons[mode] || null;
                        let currentValueStr = this.state.values[this.state.data['oid-mode'] + '.val'];
                        if (currentValueStr === null || currentValueStr === undefined) {
                            currentValueStr = 'null';
                        } else {
                            currentValueStr = currentValueStr.toString()
                        }

                        return MyButtonIcon ?
                            <Tooltip key={i} title={I18n.t('vis_2_widgets_material_' + mode).replace('vis_2_widgets_material_', '')}>
                                <IconButton
                                    color={currentValueStr === modeIndex ? 'primary' : 'grey'}
                                    onClick={() => {
                                        let value = modeIndex;
                                        if (this.state.modeObject?.common?.type === 'number') {
                                            value = parseFloat(value);
                                        }
                                        const values = JSON.parse(JSON.stringify(this.state.values));
                                        values[this.state.data['oid-mode'] + '.val'] = value;
                                        this.setState(values);
                                        this.props.socket.setState(this.state.data['oid-mode'], value);
                                    }}
                                >
                                    <MyButtonIcon />
                                </IconButton>
                            </Tooltip>
                            :
                            <Button
                                key={i}
                                color={currentValueStr === modeIndex ? 'primary' : 'grey'}
                                onClick={() => {
                                    let value = modeIndex;
                                    if (this.state.modeObject?.common?.type === 'number') {
                                        value = parseFloat(value);
                                    }
                                    const values = JSON.parse(JSON.stringify(this.state.values));
                                    values[this.state.data['oid-mode'] + '.val'] = value;
                                    this.setState(values);
                                    this.props.socket.setState(this.state.data['oid-mode'], value);
                                }}
                            >{this.state.modes[modeIndex]}</Button>;
                    }) : null}
                {this.state.data['oid-power'] && this.state.data['oid-power'] !== 'nothing_selected' ?
                    <Tooltip title={I18n.t('vis_2_widgets_material_power').replace('vis_2_widgets_material_', '')}>
                        <IconButton
                            color={this.state.values[this.state.data['oid-power'] + '.val'] ? 'primary' : 'grey'}
                            onClick={() => {
                                const values = JSON.parse(JSON.stringify(this.state.values));
                                values[this.state.data['oid-power'] + '.val'] = !values[this.state.data['oid-power'] + '.val'];
                                this.setState(values);
                                this.props.socket.setState(this.state.data['oid-power'], values[this.state.data['oid-power'] + '.val']);
                            }}
                        >
                            <PowerSettingsNewIcon />
                        </IconButton>
                    </Tooltip> : null}
            </div>
            {this.renderDialog()}
        </div>;

        return this.wrapContent(content, this.state.data.name ? chartButton : null, { textAlign: 'center' });
    }
}

Thermostat.propTypes = {
    systemConfig: PropTypes.object,
    socket: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default withStyles(styles)(Thermostat);
