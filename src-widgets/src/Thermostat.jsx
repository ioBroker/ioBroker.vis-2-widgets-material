import React from 'react';
import PropTypes from 'prop-types';
import { CircularSliderWithChildren } from 'react-circular-slider-svg';

import {
    Box,
    Button, Dialog, DialogContent, DialogTitle, IconButton, Slider, Tooltip,
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
    Celebration as CelebrationIcon,
    ElectricBolt as BoostIcon,
    Close,
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

const styles = {
    thermostatCircleDiv: {
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
    thermostatButtonsDiv: {
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        position: 'absolute',
        bottom: 8,
        left: 0,
    },
    thermostatNewValueLight: {
        animation: 'vis-2-widgets-material-newValueAnimationLight 2s ease-in-out',
    },
    thermostatNewValueDark: {
        animation: 'vis-2-widgets-material-newValueAnimationDark 2s ease-in-out',
    },
    thermostatDesiredTemp: {
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        left: 0,
        transform: 'none',
    },
    tooltip: {
        pointerEvents: 'none',
    },
};

function getModes(modeObj) {
    let modes = modeObj?.common?.states;
    if (Array.isArray(modes)) {
        const result = {};
        modes.forEach(m => result[m] = m);
        modes = result;
    }
    const result = [];
    if (modes) {
        Object.keys(modes).forEach(m => {
            const mode = { value: m, label: modes[m] };
            mode.icon = BUTTONS[modes[m]];
            result.push(mode);
        });
    }

    return result.length ? result : null;
}

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
                            name: 'externalDialog',
                            label: 'use_as_dialog',
                            type: 'checkbox',
                        },
                        {
                            name: 'noCard',
                            label: 'without_card',
                            type: 'checkbox',
                            hidden: '!!data.externalDialog',
                        },
                        {
                            name: 'widgetTitle',
                            label: 'name',
                            hidden: '!!data.noCard || !!data.externalDialog',
                        },
                        {
                            name: 'oid-temp-set',
                            type: 'id',
                            label: 'temperature_oid',
                            onChange: async (field, data, changeData, socket) => {
                                if (data[field.name]) {
                                    const object = await socket.getObject(data[field.name]);
                                    if (object?.common) {
                                        const id = data[field.name].split('.');
                                        id.pop();
                                        const states = await socket.getObjectView(`${id.join('.')}.`, `${id.join('.')}.\u9999`, 'state');
                                        if (states) {
                                            let changed = false;
                                            Object.values(states).forEach(state => {
                                                const role = state.common.role;
                                                if (role && role.includes('value.temperature')) {
                                                    data['oid-temp-actual'] = state._id;
                                                    changed = true;
                                                } else if (role && role.includes('power')) {
                                                    data['oid-power'] = state._id;
                                                    changed = true;
                                                } else if (role && role.includes('boost')) {
                                                    data['oid-boost'] = state._id;
                                                    changed = true;
                                                } else if (role && role.includes('party')) {
                                                    data['oid-party'] = state._id;
                                                    changed = true;
                                                }
                                            });
                                            changed && changeData(data);
                                        }
                                    }
                                }
                            },
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
                            onChange: async (field, data, changeData, socket) => {
                                if (data[field.name]) {
                                    const object = await socket.getObject(data[field.name]);
                                    const modes = getModes(object);
                                    if (modes) {
                                        let changed = false;

                                        modes.forEach((mode, i) => {
                                            if (!data[`title${i + 1}`] || i + 1 > data.count) {
                                                changed = true;
                                                data[`title${i + 1}`] = mode.label;
                                            }
                                            if (!data[`value${i + 1}`] || i + 1 > data.count) {
                                                data[`value${i + 1}`] = mode.value;
                                                changed = true;
                                            }
                                        });
                                        if (data.count !== modes.length) {
                                            changed = true;
                                            data.count = modes.length;
                                        }
                                        changed && changeData(data);
                                    }
                                }
                            },
                        },
                        {
                            name: 'oid-boost',
                            type: 'id',
                            label: 'mode_boost',
                        },
                        {
                            name: 'oid-party',
                            type: 'id',
                            label: 'mode_party',
                        },
                        {
                            name: 'step',
                            type: 'select',
                            disabled: '!data["oid-temp-set"]',
                            label: 'step',
                            noTranslation: true,
                            options: ['0.5', '1'],
                            default: '1',
                        },
                        {
                            name: 'timeout',
                            label: 'controlTimeout',
                            tooltip: 'timeout_tooltip',
                            type: 'slider',
                            min: 0,
                            max: 2000,
                            default: 500,
                        },
                        {
                            name: 'count',
                            type: 'slider',
                            min: 1,
                            max: 9,
                            label: 'modes_count',
                            default: 2,
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
                            hidden: '!!data["hide" + index]',
                        },
                        {
                            name: 'value',
                            type: 'text',
                            label: 'value',
                            hidden: '!!data["hide" + index]',
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

    async thermostatReadObjects() {
        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData === actualRxData) {
            return;
        }

        const newState = {};
        this.lastRxData = actualRxData;
        const ids = [];
        if (this.state.rxData['oid-mode'] && this.state.rxData['oid-mode'] !== 'nothing_selected') {
            ids.push(this.state.rxData['oid-mode']);
        }
        if (this.state.rxData['oid-temp-set'] && this.state.rxData['oid-temp-set'] !== 'nothing_selected') {
            ids.push(this.state.rxData['oid-temp-set']);
        }
        if (this.state.rxData['oid-temp-actual'] && this.state.rxData['oid-temp-actual'] !== 'nothing_selected') {
            ids.push(this.state.rxData['oid-temp-actual']);
        }
        const _objects = ids.length ? (await this.props.context.socket.getObjectsById(ids)) : {};

        if (this.state.rxData['oid-mode'] && this.state.rxData['oid-mode'] !== 'nothing_selected') {
            const modeObj = _objects[this.state.rxData['oid-mode']];
            newState.modeObject = { common: modeObj.common, _id: modeObj._id };
            // convert the array to the object
            const modes = getModes(modeObj);
            newState.modes = [];
            const max = parseInt(this.state.rxData.count, 10) || 10;
            modes?.forEach((m, i) => {
                if (this.state.rxData[`hide${i + 1}`] || i >= max) {
                    return;
                }
                const mode = m;
                mode.tooltip = this.state.rxData[`tooltip${i + 1}`] || m.label;
                mode.icon = this.state.rxData[`icon${i + 1}`] || this.state.rxData[`iconSmall${i + 1}`] || !!BUTTONS[m.label];
                mode.original = m.label;
                mode.label = mode.icon && this.state.rxData[`noText${i + 1}`] ? null : (this.state.rxData[`title${i + 1}`] || mode.label);
                // if icon present, and it is a standard icon and no title provided
                if (mode.label && !this.state.rxData[`noText${i + 1}`] && mode.icon === true && !this.state.rxData[`title${i + 1}`]) {
                    mode.label = null;
                }
                mode.color = this.state.rxData[`color${i + 1}`];
                mode.value = this.state.rxData[`value${i + 1}`] || m.value;
                newState.modes.push(mode);
            });
        } else {
            newState.modes = null;
            newState.mode = null;
        }

        if (this.state.rxData['oid-temp-set'] && this.state.rxData['oid-temp-set'] !== 'nothing_selected') {
            const tempObj = _objects[this.state.rxData['oid-temp-set']];
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
            const tempStateObj = _objects[this.state.rxData['oid-temp-actual']];
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
        await this.thermostatReadObjects();
    }

    async onRxDataChanged() {
        await this.thermostatReadObjects();
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

    renderChartDialog() {
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
                {this.state.dialogTab === 1 && <div style={{ height: '100%' }}>
                    <ObjectChart
                        t={Generic.t}
                        lang={Generic.getLanguage()}
                        socket={this.props.context.socket}
                        obj={this.state.tempStateObject || this.state.tempObject}
                        obj2={!this.state.tempStateObject ? null : this.state.tempObject}
                        objLineType={this.state.tempStateObject ? 'line' : 'step'}
                        obj2LineType="step"
                        themeType={this.props.context.themeType}
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
            const withModes = this.thermIsWithModeButtons() || this.thermIsWithPowerButton();

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

    thermIsWithPowerButton() {
        return this.state.rxData['oid-power'] && this.state.rxData['oid-power'] !== 'nothing_selected';
    }

    thermIsWithModeButtons() {
        return (this.state.modes?.length || this.state.rxData['oid-party'] || this.state.rxData['oid-boost']) &&
            // if no power button or power is on
            (!this.state.rxData['oid-power'] || this.state.values[`${this.state.rxData['oid-power']}.val`]);
    }

    onCommand(command) {
        const result = super.onCommand(command);
        if (result === false) {
            if (command === 'openDialog') {
                this.setState({ dialog: true });
                return true;
            }
            if (command === 'closeDialog') {
                this.setState({ dialog: false });
                return true;
            }
        }

        return result;
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
                await this.thermostatReadObjects();
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
            style={withTitle ? undefined : styles.moreButton}
            onClick={() => this.setState({ showDialog: true })}
        >
            <MoreVertIcon />
        </IconButton> : null;

        actualTemp = actualTemp !== null ? this.formatValue(actualTemp) : null;

        const thermIsWithModeButtons = this.thermIsWithModeButtons();
        const thermIsWithPowerButton = this.thermIsWithPowerButton();
        const arcColor = this.props.customSettings?.viewStyle?.overrides?.palette?.primary?.main || this.props.context.theme?.palette.primary.main || '#448aff';

        let modesButton = [];
        if (thermIsWithModeButtons) {
            if (this.state.modes?.length) {
                modesButton = this.state.modes.map(mode => {
                    const icon = mode.icon === true && BUTTONS[mode.original] ? true : (mode.icon ? <Icon src={mode.icon} style={{ width: 24, height: 24 }} /> : null);
                    const MyIcon = icon === true ? BUTTONS[mode.original] : null;
                    let currentValueStr = this.state.values[`${this.state.rxData['oid-mode']}.val`];
                    if (currentValueStr === null || currentValueStr === undefined) {
                        currentValueStr = 'null';
                    } else {
                        currentValueStr = currentValueStr.toString();
                    }

                    return icon && !mode.label ?
                        <Tooltip
                            key={mode.value}
                            title={mode.tooltip}
                            componentsProps={{ popper: { sx: styles.tooltip } }}
                        >
                            <IconButton
                                color={currentValueStr === mode.value ? 'primary' : undefined}
                                style={currentValueStr === mode.value || !mode.color ? undefined : { color: mode.color }}
                                onClick={() => {
                                    let value = mode.value;
                                    if (this.state.modeObject?.common?.type === 'number') {
                                        value = parseFloat(value);
                                    } else if (this.state.modeObject?.common?.type === 'boolean') {
                                        value = value === 'true' || value === true || value === '1' || value === 1;
                                    }
                                    const values = JSON.parse(JSON.stringify(this.state.values));
                                    values[`${this.state.rxData['oid-mode']}.val`] = value;
                                    this.setState(values);
                                    this.props.context.setValue(this.state.rxData['oid-mode'], value);
                                }}
                            >
                                {icon === true ? <MyIcon /> : icon}
                            </IconButton>
                        </Tooltip>
                        :
                        <Button
                            key={mode.value}
                            color={currentValueStr === mode.value ? 'primary' : undefined}
                            style={currentValueStr === mode.value || !mode.color ? undefined : { color: mode.color }}
                            onClick={() => {
                                let value = mode.value;
                                if (this.state.modeObject?.common?.type === 'number') {
                                    value = parseFloat(value);
                                } else if (this.state.modeObject?.common?.type === 'boolean') {
                                    value = value === 'true' || value === true || value === '1' || value === 1;
                                }
                                const values = JSON.parse(JSON.stringify(this.state.values));
                                values[`${this.state.rxData['oid-mode']}.val`] = value;
                                this.setState(values);
                                this.props.context.setValue(this.state.rxData['oid-mode'], value);
                            }}
                            startIcon={icon === true ? <MyIcon /> : icon}
                        >
                            {mode.label}
                        </Button>;
                });
            }

            if (this.state.rxData['oid-party']) {
                let currentValueStr = this.state.values[`${this.state.rxData['oid-party']}.val`];
                if (currentValueStr === null || currentValueStr === undefined) {
                    currentValueStr = false;
                } else {
                    currentValueStr = currentValueStr === '1' || currentValueStr === 'true' || currentValueStr === true;
                }
                modesButton.push(<Button
                    key="party"
                    color={currentValueStr ? 'primary' : undefined}
                    onClick={() => {
                        let _currentValueStr = this.state.values[`${this.state.rxData['oid-party']}.val`];
                        if (_currentValueStr === null || _currentValueStr === undefined) {
                            _currentValueStr = false;
                        } else {
                            _currentValueStr = _currentValueStr === '1' || _currentValueStr === 'true' || _currentValueStr === true;
                        }
                        const values = JSON.parse(JSON.stringify(this.state.values));
                        values[`${this.state.rxData['oid-party']}.val`] = !_currentValueStr;
                        this.setState(values);
                        this.props.context.setValue(this.state.rxData['oid-party'], !_currentValueStr);
                    }}
                    startIcon={<CelebrationIcon />}
                >
                    {Generic.t('Party')}
                </Button>);
            }
            if (this.state.rxData['oid-boost']) {
                let currentValueStr = this.state.values[`${this.state.rxData['oid-boost']}.val`];
                if (currentValueStr === null || currentValueStr === undefined) {
                    currentValueStr = false;
                } else {
                    currentValueStr = currentValueStr === '1' || currentValueStr === 'true' || currentValueStr === true;
                }
                modesButton.push(<Button
                    key="boost"
                    color={currentValueStr ? 'primary' : undefined}
                    onClick={() => {
                        let _currentValueStr = this.state.values[`${this.state.rxData['oid-boost']}.val`];
                        if (_currentValueStr === null || _currentValueStr === undefined) {
                            _currentValueStr = false;
                        } else {
                            _currentValueStr = _currentValueStr === '1' || _currentValueStr === 'true' || _currentValueStr === true;
                        }
                        const values = JSON.parse(JSON.stringify(this.state.values));
                        values[`${this.state.rxData['oid-boost']}.val`] = !_currentValueStr;
                        this.setState(values);
                        this.props.context.setValue(this.state.rxData['oid-boost'], !_currentValueStr);
                    }}
                    startIcon={<BoostIcon />}
                >
                    {Generic.t('Boost')}
                </Button>);
            }
        }

        if (thermIsWithPowerButton) {
            modesButton.push(<Tooltip
                key="power"
                title={Generic.t('power').replace('vis_2_widgets_material_', '')}
                componentsProps={{ popper: { sx: styles.tooltip } }}
            >
                <IconButton
                    color={this.state.values[`${this.state.rxData['oid-power']}.val`] ? 'primary' : undefined}
                    onClick={() => {
                        const values = JSON.parse(JSON.stringify(this.state.values));
                        const id = `${this.state.rxData['oid-power']}.val`;
                        values[id] = !values[id];
                        this.setState(values);
                        this.props.context.setValue(this.state.rxData['oid-power'], values[id]);
                    }}
                >
                    <PowerSettingsNewIcon />
                </IconButton>
            </Tooltip>);
        }

        const content = <Box
            component="div"
            sx={styles.thermostatCircleDiv}
            style={{ height: withTitle ? 'calc(100% - 36px)' : '100%' }}
        >
            <style>
                {`
@keyframes vis-2-widgets-material-newValueAnimationLight {
    0% {
        color: #00bd00;
    },
    80% {
        color: #008000;
    },
    100% {
        color: #000;
    }
}

@keyframes vis-2-widgets-material-newValueAnimationDark {
    0% {
        color: #008000;
    }
    80% {
        color: #00bd00;
    }
    100% {
        color: #ffffff;
    }
}                          
                            `}
            </style>
            {/* if no header, draw button here */}
            {withTitle ? null : chartButton}
            {this.state.size && this.state.tempObject ?
                <CircularSliderWithChildren
                    minValue={this.state.min}
                    maxValue={this.state.max}
                    size={this.state.size}
                    arcColor={arcColor}
                    arcBackgroundColor={this.props.context.themeType === 'dark' ? '#DDD' : '#222'}
                    startAngle={40}
                    step={0.5}
                    handleSize={handleSize}
                    endAngle={320}
                    handle1={{
                        value: tempValue,
                        onChange: value => {
                            const values = JSON.parse(JSON.stringify(this.state.values));
                            if (this.state.rxData.step === '0.5') {
                                values[`${this.state.rxData['oid-temp-set']}.val`] = Math.round(value * 2) / 2;
                            } else {
                                values[`${this.state.rxData['oid-temp-set']}.val`] = Math.round(value);
                            }
                            this.setState({ values });
                        },
                    }}
                    onControlFinished={() =>
                        this.props.context.setValue(this.state.rxData['oid-temp-set'], this.state.values[`${this.state.rxData['oid-temp-set']}.val`])}
                >
                    {tempValue !== null ? <Tooltip
                        title={Generic.t('desired_temperature')}
                        componentsProps={{ popper: { sx: styles.tooltip } }}
                    >
                        <div
                            style={{
                                ...styles.thermostatDesiredTemp,
                                fontSize: Math.round(this.state.size / 6),
                                ...this.customStyle,
                            }}
                        >
                            <ThermostatIcon style={{ width: this.state.size / 8, height: this.state.size / 8 }} />
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'top',
                                    ...this.customStyle,
                                }}
                            >
                                {this.formatValue(tempValue)}
                                <span
                                    style={{
                                        fontSize: Math.round(this.state.size / 12),
                                        fontWeight: 'normal',
                                    }}
                                >
                                    {this.state.rxData.unit || this.state.tempObject?.common?.unit}
                                </span>
                            </div>
                        </div>
                    </Tooltip> : null}
                    {actualTemp !== null ? <Tooltip
                        title={Generic.t('actual_temperature')}
                        componentsProps={{ popper: { sx: styles.tooltip } }}
                    >
                        <div
                            style={{
                                ...(this.props.context.themeType === 'dark' ? styles.thermostatNewValueDark : styles.thermostatNewValueLight),
                                fontSize: Math.round((this.state.size * 0.6) / 6),
                                opacity: 0.7,
                                ...this.customStyle,
                            }}
                            key={`${actualTemp}valText`}
                        >
                            {actualTemp}
                            {this.state.rxData.unit || this.state.tempStateObject?.common?.unit}
                        </div>
                    </Tooltip> : null}
                </CircularSliderWithChildren>
                : (this.state.tempObject ? <div style={{ width: '100%' }}>
                    <Slider
                        style={{ width: 'calc(100% - 50px)', display: 'inline-block' }}
                        min={this.state.min}
                        max={this.state.max}
                        step={this.state.step || 0.5}
                        value={tempValue}
                        valueLabelDisplay="auto"
                        onChange={(e, value) => {
                            const values = JSON.parse(JSON.stringify(this.state.values));
                            if (this.state.rxData.step === '0.5') {
                                values[`${this.state.rxData['oid-temp-set']}.val`] = Math.round(value * 2) / 2;
                            } else {
                                values[`${this.state.rxData['oid-temp-set']}.val`] = Math.round(value);
                            }
                            this.setState({ values });
                        }}
                    />
                    <div
                        style={{
                            textAlign: 'center',
                            display: 'inline-block',
                            flexDirection: 'column',
                            width: 50,
                        }}
                    >
                        {tempValue !== null ? <Tooltip
                            title={Generic.t('desired_temperature')}
                            componentsProps={{ popper: { sx: styles.tooltip } }}
                        >
                            <div
                                style={{
                                    ...styles.thermostatDesiredTemp,
                                    fontSize: 12,
                                    ...this.customStyle,
                                }}
                            >
                                <ThermostatIcon style={{ width: 24, height: 24 }} />
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'top',
                                        ...this.customStyle,
                                    }}
                                >
                                    {this.formatValue(tempValue)}
                                    <span
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 'normal',
                                        }}
                                    >
                                        {this.state.rxData.unit || this.state.tempObject?.common?.unit}
                                    </span>
                                </div>
                            </div>
                        </Tooltip> : null}
                        {actualTemp !== null ? <Tooltip
                            title={Generic.t('actual_temperature')}
                            componentsProps={{ popper: { sx: styles.tooltip } }}
                        >
                            <div
                                style={{
                                    ...(this.props.context.themeType === 'dark' ? styles.thermostatNewValueDark : styles.thermostatNewValueLight),
                                    fontSize: Math.round(10),
                                    opacity: 0.7,
                                    ...this.customStyle,
                                }}
                                key={`${actualTemp}valText`}
                            >
                                {actualTemp}
                                {this.state.rxData.unit || this.state.tempStateObject?.common?.unit}
                            </div>
                        </Tooltip> : null}
                    </div>
                </div> : null)}
            <div style={{ ...styles.thermostatButtonsDiv, bottom: 8 }}>
                {modesButton}
            </div>
            {this.renderChartDialog()}
        </Box>;

        if (this.state.rxData.externalDialog && !this.props.editMode) {
            return <Dialog open={this.state.dialog} onClose={() => this.setState({ dialog: null })}>
                <DialogTitle>
                    {this.state.rxData.widgetTitle}
                    <IconButton
                        style={{ float: 'right' }}
                        onClick={() => this.setState({ dialog: null })}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>{content}</DialogContent>
            </Dialog>;
        }

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

export default Thermostat;
