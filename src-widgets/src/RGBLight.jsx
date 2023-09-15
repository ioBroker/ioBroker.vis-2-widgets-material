import React from 'react';
import { withStyles } from '@mui/styles';
import {
    Brightness6, Close, ColorLens, Thermostat,
} from '@mui/icons-material';
import { TbSquareLetterW } from 'react-icons/tb';
import {
    Button,
    Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Slider, Switch, Tooltip,
} from '@mui/material';
import {
    Wheel, rgbaToHsva, hsvaToHsla, hsvaToRgba, hexToHsva, hsvaToHex, hslaToHsva, ShadeSlider, rgbaToHex, Sketch,
} from '@uiw/react-color';
import ct, { colorTemperature2rgb } from 'color-temperature';
import Generic from './Generic';
import './sketch.css';

const styles = () => ({
    sliderContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
    },
    dialogContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    wheel: {
        display: 'flex',
        justifyContent: 'center',
    },
    content: {
        width: '100%',
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden',
    },
});

const stateRoles = {
    'switch.light': 'switch',
    switch: 'switch',
    'level.brightness': 'brightness',
    'level.dimmer': 'brightness',
    'level.color.red': 'red',
    'level.color.green': 'green',
    'level.color.blue': 'blue',
    'level.color.white': 'white',
    'level.color.rgb': 'rgb',
    'level.color.hue': 'hue',
    'level.color.saturation': 'saturation',
    'level.color.luminance': 'luminance',
    'level.color.temperature': 'color_temperature',
};

const loadStates = async (field, data, changeData, socket) => {
    if (data[field.name]) {
        const object = await socket.getObject(data[field.name]);
        if (object && object.common) {
            const id = data[field.name].split('.');
            id.pop();
            const states = await socket.getObjectView(`${id.join('.')}.`, `${id.join('.')}.\u9999`, 'state');
            if (states) {
                Object.values(states).forEach(state => {
                    const role = state.common.role;
                    if (role && stateRoles[role] && (!data[role] || data[role] === 'nothing_selected') && field !== role) {
                        data[stateRoles[role]] = state._id;
                    }
                });
                changeData(data);
            }
        }
    }
};

class RGBLight extends Generic {
    constructor(props) {
        super(props);
        this.state.dialog = false;
        this.state.objects = {};
        this.state.colorTemperatures = [];
        this.state.sketch = false;
        this.contentRef = React.createRef();
        this.timeouts = {};
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2RGBLight',
            visSet: 'vis-2-widgets-material',
            visName: 'RGBLight',
            visWidgetLabel: 'rgb_light',
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
                            name: 'fullSize',
                            label: 'fullSize',
                            type: 'checkbox',
                        },
                        {
                            name: 'widgetTitle',
                            label: 'name',
                            hidden: '!!data.noCard',
                        },
                        {
                            name: 'switch',
                            type: 'id',
                            label: 'switch',
                            onChange: loadStates,
                        },
                        {
                            name: 'brightness',
                            type: 'id',
                            label: 'brightness',
                            onChange: loadStates,
                        },
                        {
                            name: 'type',
                            label: 'type',
                            type: 'select',
                            options: [
                                'rgb', 'rgbw', 'r/g/b', 'r/g/b/w', 'hue/sat/lum', 'ct',
                            ],
                            onChange: loadStates,
                        },
                        {
                            name: 'rgb',
                            type: 'id',
                            label: 'rgb',
                            hidden: data => data.type !== 'rgb' && data.type !== 'rgbw',
                            onChange: loadStates,
                        },
                        {
                            name: 'red',
                            type: 'id',
                            label: 'red',
                            hidden: data => data.type !== 'r/g/b' && data.type !== 'r/g/b/w',
                            onChange: loadStates,
                        },
                        {
                            name: 'green',
                            type: 'id',
                            label: 'green',
                            hidden: data => data.type !== 'r/g/b' && data.type !== 'r/g/b/w',
                            onChange: loadStates,
                        },
                        {
                            name: 'blue',
                            type: 'id',
                            label: 'blue',
                            hidden: data => data.type !== 'r/g/b' && data.type !== 'r/g/b/w',
                            onChange: loadStates,
                        },
                        {
                            name: 'white',
                            type: 'id',
                            label: 'white',
                            hidden: data => data.type !== 'r/g/b/w' && data.type !== 'rgbw',
                            onChange: loadStates,
                        },
                        {
                            name: 'color_temperature',
                            type: 'id',
                            label: 'color_temperature',
                            hidden: data => data.type !== 'ct',
                            onChange: loadStates,
                        },
                        {
                            name: 'hue',
                            type: 'id',
                            label: 'hue',
                            hidden: data => data.type !== 'hue/sat/lum',
                            onChange: loadStates,
                        },
                        {
                            name: 'saturation',
                            type: 'id',
                            label: 'saturation',
                            hidden: data => data.type !== 'hue/sat/lum',
                            onChange: loadStates,
                        },
                        {
                            name: 'luminance',
                            type: 'id',
                            label: 'luminance',
                            hidden: data => data.type !== 'hue/sat/lum',
                            onChange: loadStates,
                        },
                        {
                            name: 'timeout',
                            label: 'controlTimeout',
                            help: 'In milliseconds',
                            type: 'number',
                            min: 0,
                            max: 2000,
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 120,
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_rgb_light.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return RGBLight.getWidgetInfo();
    }

    rgbGetIdMin = id => this.state.objects[id]?.common?.min || 0;

    rgbGetIdMax = id => this.state.objects[id]?.common?.max || 0;

    rgbSetId = (id, value) => {
        if (this.state.objects[id]) {
            this.timeouts[id] && clearTimeout(this.timeouts[id]);

            // control switch directly without timeout
            if (id === 'switch') {
                this.props.context.socket.setState(this.state.rxData[id], value);
            } else {
                const values = { ...this.state.values, [`${this.state.rxData[id]}.val`]: value };
                this.setState({ values });

                this.timeouts[id] = setTimeout(() => {
                    this.timeouts[id] = null;
                    this.props.context.socket.setState(this.state.rxData[id], value);
                }, parseInt(this.state.rxData.timeout, 10) || 200);
            }
        }
    };

    async rgbReadObjects() {
        const objects = {};
        const ids = ['switch', 'brightness', 'rgb', 'red', 'green', 'blue', 'white', 'color_temperature', 'hue', 'saturation', 'luminance'];
        const idToRead = [];
        for (const k in ids) {
            const id = ids[k];
            if (this.state.rxData[id] && this.state.rxData[id] !== 'nothing_selected') {
                idToRead.push(this.state.rxData[id]);
            }
        }
        const _objects = await this.props.context.socket.getObjectsById(idToRead);
        const newState = {};

        for (const k in ids) {
            const id = ids[k];
            if (this.state.rxData[id]) {
                const object = _objects[this.state.rxData[id]];
                if (object) {
                    objects[id] = object;
                }
            }
        }
        newState.objects = objects;

        if (objects.color_temperature) {
            const colors = [];
            for (let i = (objects.color_temperature?.common?.min || 3000); i <= (objects.color_temperature?.common?.max || 12000); i += 100) {
                colors.push(ct.colorTemperature2rgb(i));
            }
            newState.colorTemperatures = colors;
        } else {
            newState.colorTemperatures = [];
        }

        this.setState(newState);
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.rgbReadObjects();
    }

    destroy() {
        for (const k in this.timeouts) {
            if (this.timeouts[k]) {
                clearTimeout(this.timeouts[k]);
                this.timeouts[k] = null;
            }
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.destroy();
    }

    async onRxDataChanged() {
        await this.rgbReadObjects();
    }

    rgbIsOnlyHue = () => this.state.rxData.type === 'hue/sat/lum' && (!this.state.objects.saturation || !this.state.objects.luminance);

    rgbGetWheelColor = () => {
        let result = {
            h: undefined,
            s: undefined,
            v: undefined,
            a: undefined,
        };

        if (this.state.rxData.type === 'hue/sat/lum') {
            result = hslaToHsva({
                h: this.getPropertyValue('hue'),
                s: this.rgbIsOnlyHue() ? 100 : this.getPropertyValue('saturation'),
                l: this.rgbIsOnlyHue() ? 50 : this.getPropertyValue('luminance'),
            });
        } else if (this.state.rxData.type === 'r/g/b' || this.state.rxData.type === 'r/g/b/w') {
            result = rgbaToHsva({
                r: this.getPropertyValue('red'),
                g: this.getPropertyValue('green'),
                b: this.getPropertyValue('blue'),
            });
        } else if (this.state.rxData.type === 'rgb') {
            try {
                const val = this.getPropertyValue('rgb') || '';
                if (val && val.length >= 4) {
                    result = hexToHsva(val);
                } else {
                    result = hexToHsva('#000000');
                }
            } catch (e) {
                console.error(e);
            }
        } else if (this.state.rxData.type === 'rgbw') {
            try {
                const val = this.getPropertyValue('rgb') || '';
                if (val && val.length >= 4) {
                    result = hexToHsva(val);
                } else {
                    result = hexToHsva('#000000');
                }
            } catch (e) {
                console.error(e);
            }
        }
        return result;
    };

    rgbSetWheelColor = color => {
        if (this.state.rxData.type === 'hue/sat/lum') {
            color = hsvaToHsla(color);
            this.rgbSetId('hue', color.h);
            if (!this.rgbIsOnlyHue()) {
                this.rgbSetId('saturation', color.s);
                this.rgbSetId('luminance', color.l);
            }
        } else if (this.state.rxData.type === 'r/g/b' || this.state.rxData.type === 'r/g/b/w') {
            color = hsvaToRgba(color);
            this.rgbSetId('red', color.r);
            this.rgbSetId('green', color.g);
            this.rgbSetId('blue', color.b);
        } else if (this.state.rxData.type === 'rgb') {
            this.rgbSetId('rgb', hsvaToHex(color));
        } else if (this.state.rxData.type === 'rgbw') {
            if (this.state.objects.white) {
                this.rgbSetId('rgb', hsvaToHex(color));
            } else {
                let val = this.getPropertyValue('rgb') || '#00000000';
                val = hsvaToHex(color) + val.substring(7);
                this.rgbSetId('rgb', val);
            }
        }
    };

    rgbGetWhite = () => {
        if (this.state.rxData.type === 'r/g/b/w') {
            return this.getPropertyValue('white');
        }
        if (this.state.rxData.type === 'rgbw') {
            if (this.state.objects.white) {
                return this.getPropertyValue('white');
            }

            const val = this.getPropertyValue('rgb')?.substring(7);
            return parseInt(val, 16);
        }
        return 0;
    };

    rgbSetWhite = color => {
        if (this.state.rxData.type === 'r/g/b/w') {
            this.rgbSetId('white', color);
        } else if (this.state.rxData.type === 'rgbw') {
            if (this.state.objects.white) {
                this.rgbSetId('white', color);
            } else {
                let val = this.getPropertyValue('rgb') || '#00000000';
                val = val.substring(0, 7) + color.toString(16).padStart(2, '0');
                this.rgbSetId('rgb', val);
            }
        }
    };

    rgbIsRgb = () => {
        if ((this.state.rxData.type === 'rgb' || this.state.rxData.type === 'rgbw')
        && this.state.rxData.rgb) {
            return true;
        }

        return (this.state.rxData.type === 'r/g/b' || this.state.rxData.type === 'r/g/b/w')
            && this.state.objects.red
            && this.state.objects.green
            && this.state.objects.blue;
    };

    rgbIsWhite = () => (this.state.rxData.type === 'rgbw' && this.state.rxData.rgb)
        || (this.state.rxData.type === 'r/g/b/w' && this.state.objects.white);

    rgbIsHSL = () => this.state.rxData.type === 'hue/sat/lum' && this.state.objects.hue;

    rgbRenderSwitch() {
        return this.state.objects.switch && <div
            className={this.props.classes.sliderContainer}
            style={{
                justifyContent: 'center',
            }}
        >
            {Generic.t('Off')}
            <Switch
                checked={this.getPropertyValue('switch') || false}
                onChange={e => this.rgbSetId('switch', e.target.checked)}
            />
            {Generic.t('On')}
        </div>;
    }

    rgbRenderBrightness() {
        return this.state.objects.brightness && <div className={this.props.classes.sliderContainer}>
            <Tooltip title={Generic.t('Brightness')}>
                <Brightness6 />
            </Tooltip>
            <Slider
                min={this.rgbGetIdMin('brightness') || 0}
                max={this.rgbGetIdMax('brightness') || 100}
                valueLabelDisplay="auto"
                value={this.getPropertyValue('brightness') || 0}
                onChange={(e, value) => this.rgbSetId('brightness', value)}
            />
        </div>;
    }

    rgbRenderSketch() {
        return <div className={`dark ${this.props.classes.wheel}`}>
            <Sketch
                color={this.rgbGetWheelColor()}
                disableAlpha
                onChange={color => this.rgbSetWheelColor(color.hsva)}
            />
        </div>;
    }

    rgbRenderWheelTypeSwitch(isWheelVisible, twoPanels) {
        if (!isWheelVisible) {
            return null;
        }
        return !this.rgbIsOnlyHue() && <div style={{ textAlign: twoPanels ? 'right' : undefined }}>
            <Tooltip title={Generic.t('Switch color picker')}>
                <IconButton onClick={() => this.setState({ sketch: !this.state.sketch })}>
                    <ColorLens />
                </IconButton>
            </Tooltip>
        </div>;
    }

    rgbRenderBrightnessSlider(isWheelVisible) {
        if (!isWheelVisible) {
            return null;
        }
        return !this.rgbIsOnlyHue() && <ShadeSlider
            hsva={this.rgbGetWheelColor()}
            onChange={shade =>
                this.rgbSetWheelColor({ ...this.rgbGetWheelColor(), ...shade })}
        />;
    }

    rgbRenderWheel(isWheelVisible) {
        if (!isWheelVisible) {
            return null;
        }
        return this.state.sketch ? this.rgbRenderSketch() :  <div className={this.props.classes.wheel}>
            <Wheel
                color={this.rgbGetWheelColor()}
                onChange={color => {
                    color = JSON.parse(JSON.stringify(color));
                    this.rgbSetWheelColor(color.hsva);
                }}
            />
        </div>;
    }

    rgbRenderWhite() {
        if (!this.rgbIsWhite()) {
            return null;
        }
        let min;
        let max;
        if (!this.state.objects.white) {
            min = 0;
            max = 255;
        } else {
            min = this.rgbGetIdMin('white') || 0;
            max = this.rgbGetIdMax('white') || 100;
        }

        return <div className={this.props.classes.sliderContainer}>
            <TbSquareLetterW style={{ width: 24, height: 24 }} />
            <Slider
                min={min}
                max={max}
                valueLabelDisplay="auto"
                value={this.rgbGetWhite() || 0}
                onChange={(e, value) => this.rgbSetWhite(value)}
            />
        </div>;
    }

    rgbRenderColorTemperature() {
        return this.state.rxData.type === 'ct' && <div
            className={this.props.classes.sliderContainer}
        >
            <Tooltip title={Generic.t('Color temperature')}>
                <Thermostat />
            </Tooltip>
            <div
                className={this.props.classes.sliderContainer}
                style={{
                    background:
        `linear-gradient(to right, ${this.state.colorTemperatures.map(c => `rgb(${c.red}, ${c.green}, ${c.blue})`).join(', ')})`,
                    flex: '1',
                    borderRadius: 4,
                }}
            >
                <Slider
                    valueLabelDisplay="auto"
                    min={this.rgbGetIdMin('color_temperature') || 3000}
                    max={this.rgbGetIdMax('color_temperature') || 12000}
                    value={this.getPropertyValue('color_temperature') || 0}
                    onChange={(e, value) => this.rgbSetId('color_temperature', value)}
                />
            </div>
        </div>;
    }

    rgbRenderDialog(wheelVisible) {
        if (!this.state.dialog) {
            return null;
        }
        return <Dialog open={!0} onClose={() => this.setState({ dialog: false })}>
            <DialogTitle>{this.state.rxData.widgetTitle}</DialogTitle>
            <DialogContent style={{ maxWidth: 400 }}>
                <div className={this.props.classes.dialogContainer}>
                    {this.rgbRenderSwitch()}
                    {this.rgbRenderBrightness()}
                    {this.rgbRenderWhite()}
                    {this.rgbRenderWheelTypeSwitch(wheelVisible)}
                    {this.rgbRenderWheel(wheelVisible)}
                    {this.rgbRenderBrightnessSlider(wheelVisible)}
                    {this.rgbRenderColorTemperature()}
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    startIcon={<Close />}
                    onClick={() => this.setState({ dialog: false })}
                >
                    {Generic.t('Close')}
                </Button>
            </DialogActions>
        </Dialog>;
    }

    rgbGetColor = () => {
        if (this.state.rxData.type === 'ct') {
            const color = colorTemperature2rgb(this.getPropertyValue('color_temperature'));
            return rgbaToHex({
                r: color.red,
                g: color.green,
                b: color.blue,
            });
        }
        return hsvaToHex(this.rgbGetWheelColor());
    };

    rgbGetTextColor = () => {
        if (this.state.rxData.type === 'ct') {
            const color = colorTemperature2rgb(this.getPropertyValue('color_temperature'));
            return color.red + color.green + color.blue > 3 * 128 ? '#000000' : '#ffffff';
        }
        const color = hsvaToRgba(this.rgbGetWheelColor());
        return color.r + color.g + color.b > 3 * 128 ? '#000000' : '#ffffff';
    };

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        let size = 0;

        if (this.state.rxData.fullSize) {
            size = this.refService?.current?.clientWidth;
        } else if (this.contentRef.current) {
            size = this.contentRef.current.offsetWidth > this.contentRef.current.offsetHeight
                ? this.contentRef.current.offsetHeight : this.contentRef.current.offsetWidth;
        }

        let switchState = null;
        if (this.state.objects.switch) {
            switchState = this.getPropertyValue('switch');
        }
        const wheelVisible = this.rgbIsRgb() || this.rgbIsHSL();

        let content;
        if (this.state.rxData.fullSize) {
            if (wheelVisible && size >= 350) {
                content = <div
                    ref={this.contentRef}
                    className={this.props.classes.dialogContainer}
                    style={{
                        flexDirection: 'row',
                        width: '100%',
                    }}
                >
                    <div
                        style={{
                            flexDirection: 'column',
                            gap: 12,
                            flexGrow: 1,
                            display: 'flex',
                        }}
                    >
                        {this.rgbRenderSwitch()}
                        {this.rgbRenderBrightness()}
                        {this.rgbRenderWhite()}
                        {this.rgbRenderColorTemperature()}
                        {this.rgbRenderBrightnessSlider(wheelVisible)}
                        {this.rgbRenderWheelTypeSwitch(wheelVisible, true)}
                    </div>
                    <div
                        style={{
                            flexDirection: 'column',
                            display: 'flex',
                        }}
                    >
                        {this.rgbRenderWheel(wheelVisible)}
                    </div>
                </div>;
            } else {
                content = <div
                    ref={this.contentRef}
                    className={this.props.classes.dialogContainer}
                >
                    {this.rgbRenderSwitch()}
                    {this.rgbRenderBrightness()}
                    {this.rgbRenderWhite()}
                    {this.rgbRenderWheelTypeSwitch(wheelVisible)}
                    {this.rgbRenderWheel(wheelVisible)}
                    {this.rgbRenderBrightnessSlider(wheelVisible)}
                    {this.rgbRenderColorTemperature()}
                </div>;
            }
        } else {
            content = <>
                <div className={this.props.classes.content} ref={this.contentRef}>
                    <IconButton
                        onClick={() => this.setState({ dialog: true })}
                        style={{
                            backgroundColor: switchState === null || switchState ? this.rgbGetColor() :
                                (this.props.context.themeType === 'dark' ? '#111' : '#eee'),
                            color: this.rgbGetTextColor(),
                            width: size,
                            height: size,
                        }}
                    >
                        <ColorLens
                            style={{
                                color: switchState === null || switchState ? undefined : this.rgbGetColor(),
                                width: '90%',
                                height: '90%',
                            }}
                        />
                    </IconButton>
                </div>
                {this.rgbRenderDialog(wheelVisible)}
            </>;
        }

        if (this.state.rxData.noCard || props.widget.usedInWidget) {
            return content;
        }

        return this.wrapContent(content, null);
    }
}

export default withStyles(styles)(RGBLight);
