// ------------------- deprecated, use Switches.jsx instead -------------------
import React from 'react';
import { withStyles } from '@mui/styles';

import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Slider,
    IconButton,
} from '@mui/material';

import {
    Lightbulb as LightbulbIconOn,
    LightbulbOutlined as LightbulbIconOff,
    Close as CloseIcon,
} from '@mui/icons-material';

import { Icon, Utils } from '@iobroker/adapter-react-v5';

import { CircularSliderWithChildren } from 'react-circular-slider-svg';
import Generic from './Generic';

const styles = theme => ({
    intermediate: {
        opacity: 0.2,
    },
    text: {
        textTransform: 'none',
    },
    button: {
        display: 'block',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        padding: 0,
    },
    buttonInactive: {
        opacity: 0.6,
    },
    topButton: {
        display: 'flex',
        alignItems: 'center',
    },
    iconButton: {
        width: '50%',
        height: 40,
        display: 'flex',
        textAlign: 'left',
        alignItems: 'center',
    },
    iconButtonCenter: {
        width: '100%',
        height: 40,
        display: 'flex',
        textAlign: 'center',
        justifyContent: 'center',
    },
    rightButton: {
        width: '50%',
        textAlign: 'right',
        position: 'relative',
        marginTop: '-20px',
        marginBottom: '-20px',
        left: '20px',
        display: 'flex',
        justifyContent: 'right',
        color: theme.palette.mode === 'light' ? '#000' : '#fff',
        '&>div': {
            margin: 'auto',
            '&>div': {
                transform: 'translate(-50%, -50%) !important',
                top: '50% !important',
            },
        },
    },
    iconSwitch: {
        width: 40,
        height: 40,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardsHolder: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
    },
    allButtonsTitle:{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        width: '100%',
        alignItems: 'center',
    },
    buttonDiv: {
        display: 'inline-block',
        width: 120,
        height: 80,
        textAlign: 'center',
    },
    iconCustom: {
        maxWidth: 40,
        maxHeight: 40,
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
});

class SimpleState extends Generic {
    constructor(props) {
        super(props);
        this.state.showDimmerDialog = null;
        this.refDiv = React.createRef();
        this.state.object = { common: {} };
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2SimpleState',
            visSet: 'vis-2-widgets-material',
            visName: 'SimpleState',
            visWidgetLabel: 'simple_state',
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
                            name: 'values_count',
                            type: 'number',
                            hidden: '!data.withStates',
                            default: 2,
                            label: 'values_count',
                        },
                        {
                            name: 'oid',
                            type: 'id',
                            label: 'oid',
                            onChange: async (field, data, changeData, socket) => {
                                if (data.oid) {
                                    const object = await socket.getObject(data.oid);
                                    if (object && object.common.states) {
                                        if (Array.isArray(object.common.states)) {
                                            // convert to {'state1': 'state1', 'state2': 'state2', ...}
                                            const states = {};
                                            object.common.states.forEach(state => states[state] = state);
                                            object.common.states = states;
                                        }
                                        data.values_count = Object.keys(object.common.states).length;
                                        data.withStates = true;
                                        data.withNumber = false;
                                        Object.keys(object.common.states).forEach((state, index) =>
                                            data[`value${index + 1}`] = object.common.states[state]);
                                        changeData(data);
                                    } else {
                                        data.withNumber = object.common.type === 'number';
                                        data.withStates = false;
                                        data.values_count = 0;
                                        changeData(data);
                                    }
                                }
                            },
                        },
                        {
                            name: 'noIcon',
                            type: 'checkbox',
                            label: 'no_icon',
                        },
                        {
                            name: 'icon',
                            type: 'image',
                            hidden: '!!data.noIcon || !!data.iconSmall',
                            label: 'icon',
                        },
                        {
                            name: 'iconSmall',
                            type: 'icon64',
                            label: 'small_icon',
                            hidden: '!!data.noIcon || !!data.icon',
                        },
                        {
                            name: 'iconEnabled',
                            hidden: '!!data.noIcon || !!data.iconEnabledSmall',
                            type: 'image',
                            label: 'icon_active',
                        },
                        {
                            name: 'iconEnabledSmall',
                            type: 'icon64',
                            label: 'small_icon_active',
                            hidden: '!!data.noIcon || !!data.iconEnabled',
                        },                        {
                            name: 'color',
                            type: 'color',
                            label: 'color',
                        },
                        {
                            name: 'colorEnabled',
                            type: 'color',
                            label: 'color_active',
                        },
                        {
                            name: 'title',
                            label: 'title',
                        },
                        {
                            name: 'circleSize',
                            label: 'circle_size',
                            type: 'slider',
                            min: 0,
                            max: 200,
                            default: 0,
                            hidden: '!data.withNumber',
                        },
                        {
                            name: 'readOnly',
                            type: 'checkbox',
                            label: 'read_only',
                        },
                        {
                            name: 'unit',
                            label: 'unit',
                        },
                    ],
                },
                {
                    name: 'values',
                    indexFrom: 1,
                    indexTo: 'values_count',
                    label: 'values',
                    fields: [
                        {
                            name: 'value',
                            label: 'value',
                        },
                        {
                            name: 'icon',
                            type: 'image',
                            label: 'icon',
                            hidden: (data, i) => !!data[`iconSmall${i}`],
                        },
                        {
                            name: 'iconSmall',
                            type: 'icon64',
                            label: 'small_icon',
                            hidden: (data, i) => !!data[`icon${i}`],
                        },
                        {
                            name: 'color',
                            type: 'color',
                            label: 'color',
                        },
                        {
                            name: 'title',
                            label: 'title',
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 120,
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_simple_state.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return SimpleState.getWidgetInfo();
    }

    async propertiesUpdate() {
        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData === actualRxData) {
            return;
        }

        this.lastRxData = actualRxData;
        if (!this.state.rxData.oid || this.state.rxData.oid === 'nothing_selected') {
            this.setState({ object: { common: {} } });
            return;
        }
        // read object itself
        let object = await this.props.context.socket.getObject(this.state.rxData.oid);
        if (!object) {
            object = { common: {} };
        } else {
            object = { common: object.common, _id: object._id };
        }
        object.common = object.common || {};
        if (object.common.type === 'number') {
            if (object.common.max === undefined) {
                object.common.max = 100;
            }
            if (object.common.min === undefined) {
                object.common.min = 0;
            }
        }
        if (object.common.states && Array.isArray(object.common.states)) {
            // convert to {'state1': 'state1', 'state2': 'state2', ...}
            const states = {};
            object.common.states.forEach(state => states[state] = state);
            object.common.states = states;
        }

        if (!object.common.icon && (object.type === 'state' || object.type === 'channel')) {
            const idArray = this.state.rxData.oid.split('.');

            // read channel
            const parentObject = await this.props.context.socket.getObject(idArray.slice(0, -1).join('.'));
            if (!parentObject?.common?.icon && (object.type === 'state' || object.type === 'channel')) {
                const grandParentObject = await this.props.context.socket.getObject(idArray.slice(0, -2).join('.'));
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

        if (JSON.stringify(this.state.object) !== JSON.stringify(object)) {
            this.setState({ object });
        }
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.propertiesUpdate();
    }

    async onRxDataChanged() {
        await this.propertiesUpdate();
    }

    getValueData() {
        const valueId = this.state.values[`${this.state.rxData.oid}.val`];
        const value = this.state.object.common?.states[valueId];
        for (let i = 1; i <= this.state.rxData.values_count; i++) {
            if (this.state.rxData[`value${i}`] === value) {
                return {
                    color: this.state.rxData[`color${i}`],
                    icon: this.state.rxData[`icon${i}`] || this.state.rxData[`iconSmall${i}`],
                    title: this.state.rxData[`title${i}`],
                };
            }
        }

        return null;
    }

    isOn(values) {
        values = values || this.state.values;
        if (this.state.object.common.type === 'number') {
            return values[`${this.state.object._id}.val`] !== this.state.object.common.min;
        }
        return !!values[`${this.state.object._id}.val`];
    }

    getStateIcon() {
        let icon = '';
        if (this.state.rxData.noIcon) {
            return null;
        }
        if (this.state.object.common.states) {
            icon = this.getValueData()?.icon;
        }
        if (!icon) {
            if (this.isOn()) {
                icon = this.state.rxData.iconEnabled || this.state.rxData.iconEnabledSmall;
            }
        }

        icon = icon || this.state.rxData.icon || this.state.rxData.iconSmall;
        icon = icon || this.state.object.common.icon;
        const isOn = this.isOn();
        const color = this.getColor(isOn);

        if (icon) {
            icon = <Icon
                src={icon}
                style={{ width: 40, height: 40, color }}
                className={this.props.classes.iconCustom}
            />;
        } else if (isOn) {
            icon = <LightbulbIconOn color="primary" style={{ color }} />;
        } else {
            icon = <LightbulbIconOff style={{ color }} />;
        }

        return icon;
    }

    getColor(isOn) {
        if (this.state.object.common.states) {
            return this.getValueData()?.color;
        }
        if (isOn === undefined) {
            isOn = this.isOn();
        }

        return isOn ?
            this.state.rxData.colorEnabled || this.state.object.common.color
            : this.state.rxData.color || this.state.object.common.color;
    }

    changeSwitch = () => {
        if (this.state.object.common.type === 'number' || this.state.object.common.states) {
            this.setState({ showDimmerDialog: true });
        } else {
            const values = JSON.parse(JSON.stringify(this.state.values));
            const oid = `${this.state.object._id}.val`;
            if (this.state.object.common.type === 'number') {
                values[oid] = values[oid] === this.state.object.common.max ? this.state.object.common.min : this.state.object.common.max;
            } else {
                values[oid] = !values[oid];
            }
            this.setState({ values });
            this.props.context.setValue(this.state.rxData.oid, values[oid]);
        }
    };

    setOnOff(isOn) {
        const values = JSON.parse(JSON.stringify(this.state.values));
        const oid = `${this.state.object._id}.val`;
        values[oid] = isOn ? this.state.object.common.max : this.state.object.common.min;
        this.setState({ values });
        this.props.context.setValue(this.state.rxData.oid, values[oid]);
    }

    controlSpecificState(value) {
        const values = JSON.parse(JSON.stringify(this.state.values));
        const oid = `${this.state.object._id}.val`;
        values[oid] = value;
        this.setState({ values });
        this.props.context.setValue(this.state.rxData.oid, values[oid]);
    }

    renderDimmerDialog() {
        if (this.state.showDimmerDialog) {
            const isLamp = this.state.object.common.min === 0 && (this.state.object.common.max === 100 || this.state.object.common.max === 1);

            return <Dialog
                fullWidth
                maxWidth="sm"
                open={!0}
                onClose={() => this.setState({ showDimmerDialog: null })}
            >
                <DialogTitle>
                    {this.state.rxData.title || this.state.object.common.name}
                    <IconButton style={{ float: 'right' }} onClick={() => this.setState({ showDimmerDialog: null })}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {this.state.object.common.states ?
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            {Object.keys(this.state.object.common.states).map((state, i) =>
                                <Button
                                    key={`${state}_${i}`}
                                    className={this.state.values[`${this.state.object._id}.val`] !== state ? this.props.classes.buttonInactive : ''}
                                    color={this.state.values[`${this.state.object._id}.val`] === state ? 'primary' : 'grey'}
                                    onClick={() => this.controlSpecificState(state)}
                                >
                                    {this.state.object.common.states[state]}
                                </Button>)}
                        </div>
                        :
                        <>
                            <div style={{ width: '100%', marginBottom: 20 }}>
                                <Button
                                    style={{ width: '50%' }}
                                    color="grey"
                                    className={this.state.values[`${this.state.object._id}.val`] === this.state.object.common.min ? '' : this.props.classes.buttonInactive}
                                    onClick={() => this.setOnOff(false)}
                                    startIcon={isLamp ? <LightbulbIconOff /> : null}
                                >
                                    {isLamp ? Generic.t('OFF').replace('vis_2_widgets_material_', '') : this.state.object.common.min + (this.state.rxData.unit || this.state.object.common.unit || '') }
                                </Button>
                                <Button
                                    style={{ width: '50%' }}
                                    className={this.state.values[`${this.state.object._id}.val`] === this.state.object.common.max ? '' : this.props.classes.buttonInactive}
                                    color="primary"
                                    onClick={() => this.setOnOff(true)}
                                    startIcon={isLamp ? <LightbulbIconOn color="primary" /> : null}
                                >
                                    {isLamp ? Generic.t('ON').replace('vis_2_widgets_material_', '') : this.state.object.common.max + (this.state.rxData.unit || this.state.object.common.unit || '')}
                                </Button>
                            </div>
                            <div style={{ width: '100%' }}>
                                <Slider
                                    size="small"
                                    value={this.state.values[`${this.state.object._id}.val`]}
                                    valueLabelDisplay="auto"
                                    min={this.state.object.common.min}
                                    max={this.state.object.common.max}
                                    onChange={(event, value) => {
                                        const values = JSON.parse(JSON.stringify(this.state.values));
                                        const oid = `${this.state.object._id}.val`;
                                        values[oid] = value;
                                        this.setState({ values });
                                        this.props.context.setValue(this.state.rxData.oid, values[oid]);
                                    }}
                                />
                            </div>
                        </>}
                </DialogContent>
            </Dialog>;
        }
        return null;
    }

    renderCircular() {
        const value = this.state.values[`${this.state.object._id}.val`];
        const object = this.state.object;
        if (value === undefined || value === null) {
            return null;
        }
        if (value < object.common.min || value > object.common.max) {
            return value + (this.state.rxData.unit || this.state.object.common?.unit || '');
        }

        let size = this.state.rxData.circleSize;
        if (!size) {
            size = this.refDiv.current?.offsetHeight;
            if (size > this.refDiv.current?.offsetWidth) {
                size = this.refDiv.current?.offsetWidth;
            }
        }
        size = size || 80;
        if (size < 60) {
            return null;
        }

        if (!this.refDiv.current) {
            this.updateTimer1 = this.updateTimer1 || setTimeout(() => {
                this.updateTimer1 = null;
                this.forceUpdate();
            }, 50);
        }

        return <CircularSliderWithChildren
            minValue={object.common.min}
            maxValue={object.common.max}
            size={size * 1.1}
            arcColor={this.props.context.theme.palette.primary.main}
            arcBackgroundColor={this.props.context.themeType === 'dark' ? '#DDD' : '#222'}
            startAngle={0}
            step={1}
            endAngle={360}
            handle1={{ value }}
        >
            <div
                key={`_${value}`}
                style={{ fontSize: Math.round(size / 8), fontWeight: 'bold' }}
                className={this.props.context.themeType === 'dark' ? this.props.classes.newValueDark : this.props.classes.newValueLight}
            >
                {value + (this.state.rxData.unit || this.state.object.common?.unit || '')}
            </div>
        </CircularSliderWithChildren>;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData !== actualRxData) {
            this.updateTimeout = this.updateTimeout || setTimeout(async () => {
                this.updateTimeout = null;
                await this.propertiesUpdate();
            }, 50);
        }

        const icon = this.getStateIcon();
        const color = this.getColor();
        const stateTitle = this.state.object.common.states && this.getValueData()?.title;

        let value;
        if (this.state.object._id && (this.state.object.common.type === 'number' || this.state.object.common.states)) {
            value = this.state.values[`${this.state.object._id}.val`];
            if (this.state.object.common.states && this.state.object.common.states[value] !== undefined) {
                value = this.state.object.common.states[value];
            } else {
                value = this.formatValue(value);
            }
        }

        const height = !this.state.rxData.noCard && !props.widget.usedInWidget && this.state.rxData.widgetTitle ? 'calc(100% - 36px)' : '100%';

        const content = <>
            {this.renderDimmerDialog()}
            <div
                style={{
                    width: '100%',
                    height,
                }}
                ref={this.refDiv}
            >
                <div
                    className={this.props.classes.buttonDiv}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                >
                    <Button
                        onClick={() => this.changeSwitch()}
                        disabled={this.state.rxData.readOnly}
                        color={!this.state.object.common.states && this.isOn() ? 'primary' : 'grey'}
                        className={Utils.clsx(this.props.classes.button, !this.isOn() && this.props.classes.buttonInactive)}
                    >
                        <div className={this.props.classes.topButton}>
                            {icon ? <div className={
                                !this.state.object.common.states && value !== undefined && value !== null ?
                                    this.props.classes.iconButton :
                                    this.props.classes.iconButtonCenter
                            }
                            >
                                {icon}
                            </div> : null}
                            {!this.state.object.common.states && value !== undefined && value !== null ?
                                <div className={this.props.classes.rightButton} style={icon ? {} : { width: '100%', left: 0, justifyContent: 'center' }}>
                                    {this.renderCircular()}
                                </div>
                                : null}
                        </div>
                        <div className={this.props.classes.text} style={{ color }}>
                            {this.state.rxData.title || this.state.object.common.name}
                        </div>
                        {this.state.object.common.states && value !== undefined && value !== null ?
                            <div
                                key={` ${stateTitle || value}`}
                                className={Utils.clsx(
                                    this.props.classes.value,
                                    !color ? (this.props.context.themeType === 'dark' ? this.props.classes.newValueDark : this.props.classes.newValueLight) : null,
                                )}
                                style={{ color }}
                            >
                                {stateTitle || value}
                            </div> : null}
                    </Button>
                </div>
            </div>
        </>;

        if (this.state.rxData.noCard || props.widget.usedInWidget) {
            return content;
        }

        return this.wrapContent(content, null);
    }
}

export default withStyles(styles)(SimpleState);
