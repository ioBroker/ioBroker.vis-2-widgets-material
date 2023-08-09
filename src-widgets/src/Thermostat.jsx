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
    Thermostat as ThermostatIcon,
} from '@mui/icons-material';

import { Icon } from '@iobroker/adapter-react-v5';

import ObjectChart from './ObjectChart';
import Generic from './Generic';

const BUTTONS = {
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

const styles = () => ({
    circleDiv: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        '& svg circle': {
            cursor: 'pointer',
        },
        '&>div': {
            margin: 'auto',
            '&>div': {
                top: '35% !important',
            },
        },
    },
    moreButton: {
        position: 'absolute',
        top: 4,
        right: 4,
    },
    buttonsDiv: {
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        position: 'absolute',
        bottom: 8,
        left: 0,
    },
    newValueLight: {
        animation: '$newValueAnimationLight 2s ease-in-out',
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
        },
    },
    newValueDark: {
        animation: '$newValueAnimationDark 2s ease-in-out',
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
        },
    },
    desiredTemp: {
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        left: 0,
        transform: 'none',
    },
});

class Thermostat extends Generic {
    constructor(props) {
        super(props);
        this.state.showDialog = false;
        this.state.dialogTab = 1;
        this.state.size = 0;
        this.state.horizontal = false;
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Thermostat',
            visSet: 'vis-2-widgets-material',
            visWidgetLabel: 'thermostat',  // Label of widget
            visName: 'Thermostat',
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
                        {
                            name: 'oid-temp-set',
                            type: 'id',
                            label: 'temperature_oid',
                        },
                        {
                            name: 'oid-temp-actual',
                            type: 'id',
                            label: 'actual_oid',
                        },
                        {
                            name: 'unit',
                            label: 'unit',
                        },
                        {
                            name: 'oid-power',
                            type: 'id',
                            label: 'power_oid',
                        },
                        {
                            name: 'oid-mode',
                            type: 'id',
                            label: 'mode_oid',
                        },
                        {
                            name: 'oid-step',
                            type: 'select',
                            disabled: '!data["oid-temp-set"]',
                            label: 'step',
                            options: ['0.5', '1'],
                            default: '1',
                        },
                        {
                            name: 'count',
                            type: 'slider',
                            min: 1,
                            max: 9,
                            label: 'modes_count',
                            default: 5,
                            hidden: '!data["oid-mode"]',
                        },
                    ],
                },
                {
                    name: 'modes',
                    label: 'group_modes',
                    indexFrom: 1,
                    indexTo: 'count',
                    hidden: '!data["oid-mode"]',
                    fields: [
                        {
                            name: 'hide',
                            type: 'checkbox',
                            label: 'hide',
                        },
                        {
                            name: 'title',
                            label: 'title',
                            hidden: '!!data["hide" + index]',
                        },
                        {
                            name: 'tooltip',
                            label: 'tooltip',
                            hidden: '!!data["hide" + index] || !!data["title" + index]',
                        },
                        {
                            name: 'icon',
                            type: 'image',
                            label: 'icon',
                            hidden: '!!data["hide" + index] || !!data["iconSmall" + index]',
                        },
                        {
                            name: 'iconSmall',
                            type: 'icon64',
                            label: 'small_icon',
                            hidden: '!!data["hide" + index] || !!data["icon" + index]',
                        },
                        {
                            name: 'color',
                            type: 'color',
                            label: 'color',
                            hidden: '!!data["hide" + index]',
                        },
                        {
                            name: 'noText',
                            type: 'checkbox',
                            label: 'no_text',
                            hidden: '!!data["title" + index] || !!data["hide" + index] || (!data["icon" + index] && !data["iconSmall" + index])',
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 120,
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_thermostat.png',
        };
    }

    async propertiesUpdate() {
        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData === actualRxData) {
            return;
        }

        const newState = {};
        this.lastRxData = actualRxData;

        if (this.state.rxData['oid-mode'] && this.state.rxData['oid-mode'] !== 'nothing_selected') {
            const modeObj = await this.props.context.socket.getObject(this.state.rxData['oid-mode']);
            let modes = modeObj?.common?.states;
            newState.modeObject = { common: modeObj.common, _id: modeObj._id };
            // convert the array to the object
            if (Array.isArray(modes)) {
                const result = {};
                modes.forEach(m => result[m] = m);
                modes = result;
            }
            newState.modes = [];
            const max = parseInt(this.state.rxData.count, 10) || 10;
            Object.keys(modes).forEach((m, i) => {
                if (this.state.rxData[`hide${i + 1}`] || i >= max) {
                    return;
                }
                const mode = { value: m, label: modes[m] };
                mode.tooltip = this.state.rxData[`tooltip${i + 1}`] || modes.label;
                mode.icon = this.state.rxData[`icon${i + 1}`] || this.state.rxData[`iconSmall${i + 1}`] || !!BUTTONS[modes[m]];
                mode.label = mode.icon && this.state.rxData[`noText${i + 1}`] && !this.state.rxData[`title${i + 1}`] ? null : (this.state.rxData[`title${i + 1}`] || mode.label);
                // if icon present, and it is a standard icon and no title provided
                if (!this.state.rxData[`noText${i + 1}`] && mode.icon === true && !this.state.rxData[`title${i + 1}`]) {
                    mode.label = null;
                }
                mode.color = this.state.rxData[`color${i + 1}`];
                mode.original = modes[m];
                newState.modes.push(mode);
            });
        } else {
            newState.modes = null;
            newState.mode = null;
        }

        if (this.state.rxData['oid-temp-set'] && this.state.rxData['oid-temp-set'] !== 'nothing_selected') {
            const tempObj = await this.props.context.socket.getObject(this.state.rxData['oid-temp-set']);
            newState.min = tempObj?.common?.min === undefined ? 12 : tempObj.common.min;
            newState.max = tempObj?.common?.max === undefined ? 30 : tempObj.common.max;
            newState.tempObject = { common: tempObj.common, _id: tempObj._id };
        } else {
            newState.tempObject = null;
            newState.temp = null;
            newState.max = null;
            newState.min = null;
        }

        if (this.state.rxData['oid-temp-actual'] && this.state.rxData['oid-temp-actual'] !== 'nothing_selected') {
            const tempStateObj = await this.props.context.socket.getObject(this.state.rxData['oid-temp-actual']);
            newState.tempStateObject = { common: tempStateObj.common, _id: tempStateObj._id };
        } else {
            newState.tempStateObject = null;
        }

        newState.isChart = (newState.tempObject?.common?.custom && newState.tempObject.common.custom[this.props.context.systemConfig.common.defaultHistory]) ||
            (newState.tempStateObject?.common?.custom && newState.tempStateObject.common.custom[this.props.context.systemConfig.common.defaultHistory]);

        Object.keys(newState).find(key => JSON.stringify(this.state[key]) !== JSON.stringify(newState[key])) && this.setState(newState);
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.propertiesUpdate();
    }

    async onRxDataChanged() {
        await this.propertiesUpdate();
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
            if (this.props.context.systemConfig?.common) {
                if (this.props.context.systemConfig.common.isFloatComma) {
                    value = value.toString().replace('.', ',');
                }
            }
        }

        return value === undefined || value === null ? '' : value.toString();
    }

    renderDialog() {
        if (!this.state.showDialog) {
            return null;
        }
        return <Dialog
            sx={{ '& .MuiDialog-paper': { height: '100%' } }}
            maxWidth="lg"
            fullWidth
            open={!0}
            onClose={() => this.setState({ showDialog: false })}
        >
            <DialogTitle>
                {this.state.rxData.widgetTitle}
                <IconButton style={{ float: 'right' }} onClick={() => this.setState({ showDialog: false })}>
                    <IconClose />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {/* <Tabs value={this.state.dialogTab} onChange={(e, value) => this.setState({ dialogTab: value })}>
                    <Tab label={Generic.t('Properties')} value={0} />
                    <Tab label={Generic.t('History')} value={1} />
                </Tabs>
                {this.state.dialogTab === 0 && <div>
                    <TextField
                        fullWidth
                        value={this.state.temp || null}
                        onChange={e => {
                            this.setState({ temp: Math.round(e.target.value) });
                            this.props.context.socket.setState(this.state.rxData['oid-temp-set'], Math.round(e.target.value));
                        }}
                        variant="standard"
                        type="number"
                        inputProps={{
                            min: this.state.min,
                            max: this.state.max,
                        }}
                        label={Generic.t('Temperature')}
                    />
                    <FormControl fullWidth variant="standard">
                        <InputLabel>{Generic.t('Mode')}</InputLabel>
                        <Select
                            value={this.state.mode}
                            onChange={e => {
                                this.setState({ mode: parseInt(e.target.value) });
                                this.props.context.socket.setState(this.state.rxData['oid-mode'], parseInt(e.target.value));
                            }}
                        >
                            {this.state.modes ? Object.keys(this.state.modes).map(modeIndex => {
                                const mode = this.state.modes[modeIndex];
                                return <MenuItem key={modeIndex} value={modeIndex}>{Generic.t(mode)}</MenuItem>;
                            }) : null}
                        </Select>
                    </FormControl>
                </div> */}
                {this.state.dialogTab === 1 && <div style={{ height: '100%' }}>
                    <ObjectChart
                        t={Generic.t}
                        lang={Generic.getLanguage()}
                        socket={this.props.context.socket}
                        obj={this.state.tempStateObject || this.state.tempObject}
                        obj2={!this.state.tempStateObject ? null : this.state.tempObject}
                        objLineType={this.state.tempStateObject ? 'line' : 'step'}
                        obj2LineType="step"
                        themeType={this.props.themeType}
                        defaultHistory={this.props.context.systemConfig?.common?.defaultHistory || 'history.0'}
                        noToolbar={false}
                        systemConfig={this.props.context.systemConfig}
                        dateFormat={this.props.context.systemConfig.common.dateFormat}
                    />
                </div>}
            </DialogContent>
        </Dialog>;
    }

    componentDidUpdate() {
        if (super.componentDidUpdate) {
            super.componentDidUpdate();
        }
        if (this.refService?.current) {
            let w = this.refService.current.clientWidth;
            let h = this.refService.current.clientHeight;
            let size = w;
            const widget = this.props.context.views[this.props.view].widgets[this.props.id];
            if (!this.state.rxData.noCard && !widget.usedInWidget) {
                h -= 32; // padding
                w -= 32; // padding
            }

            const withTitle = this.state.rxData.widgetTitle && !this.state.rxData.noCard && !widget.usedInWidget;
            const withModes = this.isWithModeButtons() || this.isWithPowerButton();

            if (withTitle && withModes) {
                h -= 36 + 28; // title and mode buttons
            } else if (withTitle) {
                h -= 36; // title
            } else if (withModes) {
                h -= 28; // title
            }

            if (h < 0) {
                h = 0;
            }

            // with title and with modes
            if (w > h) {
                size = h;
            } else {
                size = w;
            }

            if (size < 80) {
                size = 0;
            }

            if (size !== this.state.size) {
                this.setState({ size });
            }
        }
    }

    isWithPowerButton() {
        return this.state.rxData['oid-power'] && this.state.rxData['oid-power'] !== 'nothing_selected';
    }

    isWithModeButtons() {
        return this.state.modes?.length &&
            // if no power button or power is on
            (!this.state.rxData['oid-power'] || this.state.values[`${this.state.rxData['oid-power']}.val`]);
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        this.customStyle = {};
        if (this.state.rxStyle['font-weight']) {
            this.customStyle.fontWeight = this.state.rxStyle['font-weight'];
        }
        if (this.state.rxStyle['font-size']) {
            this.customStyle.fontSize = this.state.rxStyle['font-size'];
        }
        if (this.state.rxStyle['font-family']) {
            this.customStyle.fontFamily = this.state.rxStyle['font-family'];
        }
        if (this.state.rxStyle['font-style']) {
            this.customStyle.fontStyle = this.state.rxStyle['font-style'];
        }
        if (this.state.rxStyle['word-spacing']) {
            this.customStyle.wordSpacing = this.state.rxStyle['word-spacing'];
        }
        if (this.state.rxStyle['letter-spacing']) {
            this.customStyle.letterSpacing = this.state.rxStyle['letter-spacing'];
        }

        const withCard = !this.state.rxData.noCard && !props.widget.usedInWidget;
        const withTitle = this.state.rxData.widgetTitle && withCard;

        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData !== actualRxData) {
            this.updateTimeout = this.updateTimeout || setTimeout(async () => {
                this.updateTimeout = null;
                await this.propertiesUpdate();
            }, 50);
        }

        let tempValue = this.state.values[`${this.state.rxData['oid-temp-set']}.val`];
        if (tempValue === undefined) {
            tempValue = null;
        }
        if (tempValue !== null && tempValue < this.state.min) {
            tempValue = this.state.min;
        } else if (tempValue !== null && tempValue > this.state.max) {
            tempValue = this.state.max;
        }

        if (tempValue === null) {
            tempValue = (this.state.max - this.state.min) / 2 + this.state.min;
        }

        let actualTemp = this.state.values[`${this.state.rxData['oid-temp-actual']}.val`];
        if (actualTemp === undefined) {
            actualTemp = null;
        }

        let handleSize = Math.round(this.state.size / 25);
        if (handleSize < 8) {
            handleSize = 8;
        }

        // console.log(this.state.min, this.state.max, tempValue);

        const chartButton = this.state.isChart ? <IconButton
            className={withTitle ? '' : this.props.classes.moreButton}
            onClick={() => this.setState({ showDialog: true })}
        >
            <MoreVertIcon />
        </IconButton> : null;

        actualTemp = actualTemp !== null ? this.formatValue(actualTemp) : null;

        const isWithModeButtons = this.isWithModeButtons();
        const isWithPowerButton = this.isWithPowerButton();
        const arcColor = this.props.customSettings?.viewStyle?.overrides?.palette?.primary?.main || this.props.context.theme.palette.primary.main;

        const content = <div
            className={this.props.classes.circleDiv}
            style={{ height: withTitle ? 'calc(100% - 36px)' : '100%' }}
        >
            {/* if no header, draw button here */}
            {withTitle ? null : chartButton}
            {this.state.size && this.state.tempObject ?
                <CircularSliderWithChildren
                    minValue={this.state.min}
                    maxValue={this.state.max}
                    size={this.state.size}
                    arcColor={arcColor}
                    arcBackgroundColor={this.props.themeType === 'dark' ? '#DDD' : '#222'}
                    startAngle={40}
                    step={0.5}
                    handleSize={handleSize}
                    endAngle={320}
                    handle1={{
                        value: tempValue,
                        onChange: value => {
                            const values = JSON.parse(JSON.stringify(this.state.values));
                            if (this.state.rxData['oid-step'] === '0.5') {
                                values[`${this.state.rxData['oid-temp-set']}.val`] = Math.round(value * 2) / 2;
                            } else {
                                values[`${this.state.rxData['oid-temp-set']}.val`] = Math.round(value);
                            }
                            this.setState({ values });
                        },
                    }}
                    onControlFinished={() =>
                        this.props.context.socket.setState(this.state.rxData['oid-temp-set'], this.state.values[`${this.state.rxData['oid-temp-set']}.val`])}
                >
                    {tempValue !== null ? <Tooltip title={Generic.t('desired_temperature')}>
                        <div
                            className={this.props.classes.desiredTemp}
                            style={{ fontSize: Math.round(this.state.size / 6), ...this.customStyle }}
                        >
                            <ThermostatIcon style={{ width: this.state.size / 8, height: this.state.size / 8 }} />
                            <div style={{ display: 'flex', alignItems: 'top', ...this.customStyle }}>
                                {this.formatValue(tempValue)}
                                <span style={{ fontSize: Math.round(this.state.size / 12), fontWeight: 'normal' }}>{this.state.rxData.unit || this.state.tempObject?.common?.unit}</span>
                            </div>
                        </div>
                    </Tooltip> : null}
                    {actualTemp !== null ? <Tooltip title={Generic.t('actual_temperature')}>
                        <div
                            style={{ fontSize: Math.round((this.state.size * 0.6) / 6), opacity: 0.7, ...this.customStyle }}
                            key={`${actualTemp}valText`}
                            className={this.props.themeType === 'dark' ? this.props.classes.newValueDark : this.props.classes.newValueLight}
                        >
                            {actualTemp}
                            {this.state.rxData.unit || this.state.tempStateObject?.common?.unit}
                        </div>
                    </Tooltip> : null}
                </CircularSliderWithChildren>
                : null}
            <div
                className={this.props.classes.buttonsDiv}
                style={{ bottom: 8 }}
            >
                {isWithModeButtons ?
                    this.state.modes.map(mode => {
                        const icon = mode.icon === true && BUTTONS[mode.original] ? true : (mode.icon ? <Icon src={mode.icon} style={{ width: 24, height: 24 }} /> : null);
                        const MyIcon = icon === true ? BUTTONS[mode.original] : null;
                        let currentValueStr = this.state.values[`${this.state.rxData['oid-mode']}.val`];
                        if (currentValueStr === null || currentValueStr === undefined) {
                            currentValueStr = 'null';
                        } else {
                            currentValueStr = currentValueStr.toString();
                        }

                        return icon && !mode.label ?
                            <Tooltip key={mode.value} title={mode.tooltip}>
                                <IconButton
                                    color={currentValueStr === mode.value ? 'primary' : 'grey'}
                                    style={currentValueStr === mode.value || !mode.color ? undefined : { color: mode.color }}
                                    onClick={() => {
                                        let value = mode.value;
                                        if (this.state.modeObject?.common?.type === 'number') {
                                            value = parseFloat(value);
                                        }
                                        const values = JSON.parse(JSON.stringify(this.state.values));
                                        values[`${this.state.rxData['oid-mode']}.val`] = value;
                                        this.setState(values);
                                        this.props.context.socket.setState(this.state.rxData['oid-mode'], value);
                                    }}
                                >
                                    {icon === true ? <MyIcon /> : icon}
                                </IconButton>
                            </Tooltip>
                            :
                            <Button
                                key={mode.value}
                                color={currentValueStr === mode.value ? 'primary' : 'grey'}
                                style={currentValueStr === mode.value || !mode.color ? undefined : { color: mode.color }}
                                onClick={() => {
                                    let value = mode.value;
                                    if (this.state.modeObject?.common?.type === 'number') {
                                        value = parseFloat(value);
                                    }
                                    const values = JSON.parse(JSON.stringify(this.state.values));
                                    values[`${this.state.rxData['oid-mode']}.val`] = value;
                                    this.setState(values);
                                    this.props.context.socket.setState(this.state.rxData['oid-mode'], value);
                                }}
                                startIcon={icon === true ? <MyIcon /> : icon}
                            >
                                {mode.label}
                            </Button>;
                    }) : null}
                {isWithPowerButton ?
                    <Tooltip title={Generic.t('power').replace('vis_2_widgets_material_', '')}>
                        <IconButton
                            color={this.state.values[`${this.state.rxData['oid-power']}.val`] ? 'primary' : 'grey'}
                            onClick={() => {
                                const values = JSON.parse(JSON.stringify(this.state.values));
                                const id = `${this.state.rxData['oid-power']}.val`;
                                values[id] = !values[id];
                                this.setState(values);
                                this.props.context.socket.setState(this.state.rxData['oid-power'], values[id]);
                            }}
                        >
                            <PowerSettingsNewIcon />
                        </IconButton>
                    </Tooltip> : null}
            </div>
            {this.renderDialog()}
        </div>;

        if (!withCard) {
            return content;
        }

        return this.wrapContent(content, withTitle ? chartButton : null, { textAlign: 'center' });
    }
}

Thermostat.propTypes = {
    context: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default withStyles(styles)(Thermostat);
