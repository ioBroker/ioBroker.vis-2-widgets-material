import React from 'react';
import { withStyles } from '@mui/styles';
import {
    Wheel, rgbaToHsva, hsvaToHsla, hsvaToRgba, hexToHsva, hsvaToHex, hslaToHsva, ShadeSlider, rgbaToHex, Sketch,
} from '@uiw/react-color';

import {
    Dialog, DialogContent, DialogTitle, IconButton, Slider, Switch, Tooltip,
} from '@mui/material';

import {
    Brightness6,
    Close,
    ColorLens,
    Thermostat,
    WbAuto,
} from '@mui/icons-material';
import { TbSquareLetterW } from 'react-icons/tb';

import Generic from './Generic';
import './sketch.css';

/**
 * Determine if we are on a mobile device
 */
function mobileCheck() {
    let check = false;
    const userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera;
    if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series([46])0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br([ev])w|bumb|bw-([nu])|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do([cp])o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly([-_])|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-([mpt])|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c([- _agpst])|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac([ \-/])|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja([tv])a|jbro|jemu|jigs|kddi|keji|kgt([ /])|klon|kpt |kwc-|kyo([ck])|le(no|xi)|lg( g|\/([klu])|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t([- ov])|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30([02])|n50([025])|n7(0([01])|10)|ne(([cm])-|on|tf|wf|wg|wt)|nok([6i])|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan([adt])|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c([-01])|47|mc|nd|ri)|sgh-|shar|sie([-m])|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel([im])|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c([- ])|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i
            .test(userAgent.substr(0, 4))
    ) {
        check = true;
    }
    return check;
}
/**
 * Determine if the device supports touch input
 */
function isTouchDevice() {
    if (!mobileCheck()) {
        return false;
    }
    return (('ontouchstart' in window)
        || (navigator.maxTouchPoints > 0)
        // @ts-expect-error this is only for Internet Explorer 10, if unsupported remove it.
        || (navigator.msMaxTouchPoints > 0));
}

const styles = () => ({
    rgbDialog: {
        maxWidth: 400,
    },
    rgbSliderContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
    },
    rgbDialogContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: 'calc(100% - 20px)', // handler of slider is 20px
    },
    rgbWheel: {
        display: 'flex',
        justifyContent: 'center',
    },
    rgbContent: {
        width: '100%',
        height: '100%',
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden',
        alignItems: 'center',
    },
});

export const RGB_ROLES = {
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

// From http://www.tannerhelland.com/4435/convert-temperature-rgb-algorithm-code/

// Start with a temperature, in Kelvin, somewhere between 1000 and 40000.  (Other values may work,
//  but I can't make any promises about the quality of the algorithm's estimates above 40000 K.)
function limit(x, min, max) {
    if (x < min) {
        return min;
    }
    if (x > max) {
        return max;
    }

    return x;
}

export const colorTemperatureToRGB = kelvin => {
    const temp = kelvin / 100;

    let red;
    let green;
    let blue;

    if (temp <= 66) {
        red = 255;

        green = temp;
        green = 99.4708025861 * Math.log(green) - 161.1195681661;

        if (temp <= 19) {
            blue = 0;
        } else {
            blue = temp - 10;
            blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
        }
    } else {
        red = temp - 60;
        red = 329.698727446 * (red ** (-0.1332047592));

        green = temp - 60;
        green = 288.1221695283 * (green ** (-0.0755148492));

        blue = 255;
    }

    return {
        red: limit(red,   0, 255),
        green: limit(green, 0, 255),
        blue: limit(blue,  0, 255),
    };
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
                    if (role && RGB_ROLES[role] && (!data[role] || data[role] === 'nothing_selected') && field !== role) {
                        data[RGB_ROLES[role]] = state._id;
                        if (RGB_ROLES[role] === 'color_temperature') {
                            if (!data.ct_min && state.common.min) {
                                data.ct_min = state.common.min;
                            }
                            if (!data.ct_max && state.common.max) {
                                data.ct_max = state.common.max;
                            }
                        }
                    }
                });
                changeData(data);
            }
        }
    }
};

export const RGB_NAMES = ['switch', 'brightness', 'rgb', 'red', 'green', 'blue', 'white', 'color_temperature', 'hue', 'saturation', 'luminance', 'white_mode'];

class RGBLight extends Generic {
    constructor(props) {
        super(props);
        this.state.dialog = false;
        this.state.rgbObjects = {};
        this.state.colorTemperatures = [];
        this.state.sketch = false;
        this.contentRef = React.createRef();
        this.timeouts = {};
        this.isTouch = isTouchDevice();
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
                            name: 'fullSize',
                            label: 'fullSize',
                            type: 'checkbox',
                            hidden: '!!data.externalDialog',
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
                            name: 'rgbType',
                            label: 'type',
                            type: 'select',
                            noTranslation: true,
                            options: [
                                'rgb', 'rgbw', 'r/g/b', 'r/g/b/w', 'hue/sat/lum', 'ct',
                            ],
                            onChange: loadStates,
                        },
                        {
                            name: 'rgb',
                            type: 'id',
                            label: 'rgb',
                            hidden: data => data.rgbType !== 'rgb' && data.rgbType !== 'rgbw',
                            onChange: loadStates,
                        },
                        {
                            name: 'red',
                            type: 'id',
                            label: 'red',
                            hidden: data => data.rgbType !== 'r/g/b' && data.rgbType !== 'r/g/b/w',
                            onChange: loadStates,
                        },
                        {
                            name: 'green',
                            type: 'id',
                            label: 'green',
                            hidden: data => data.rgbType !== 'r/g/b' && data.rgbType !== 'r/g/b/w',
                            onChange: loadStates,
                        },
                        {
                            name: 'blue',
                            type: 'id',
                            label: 'blue',
                            hidden: data => data.rgbType !== 'r/g/b' && data.rgbType !== 'r/g/b/w',
                            onChange: loadStates,
                        },
                        {
                            name: 'white',
                            type: 'id',
                            label: 'white',
                            hidden: data => data.rgbType !== 'r/g/b/w' && data.rgbType !== 'rgbw',
                            onChange: loadStates,
                        },
                        {
                            name: 'color_temperature',
                            type: 'id',
                            label: 'color_temperature',
                            hidden: data => data.rgbType !== 'ct',
                            onChange: loadStates,
                        },
                        {
                            name: 'ct_min',
                            type: 'number',
                            min: 500,
                            max: 10000,
                            label: 'color_temperature_min',
                            hidden: data => data.rgbType !== 'ct' && !data.color_temperature,
                        },
                        {
                            name: 'ct_max',
                            type: 'number',
                            min: 500,
                            max: 10000,
                            label: 'color_temperature_max',
                            hidden: data => data.rgbType !== 'ct' && !data.color_temperature,
                        },
                        {
                            name: 'hue',
                            type: 'id',
                            label: 'hue',
                            hidden: data => data.rgbType !== 'hue/sat/lum',
                            onChange: loadStates,
                        },
                        {
                            name: 'saturation',
                            type: 'id',
                            label: 'saturation',
                            hidden: data => data.rgbType !== 'hue/sat/lum',
                            onChange: loadStates,
                        },
                        {
                            name: 'luminance',
                            type: 'id',
                            label: 'luminance',
                            hidden: data => data.rgbType !== 'hue/sat/lum',
                            onChange: loadStates,
                        },
                        {
                            name: 'hideBrightness',
                            type: 'checkbox',
                            label: 'hideBrightness',
                            hidden: data => data.rgbType !== 'rgb' && data.rgbType !== 'rgbw' && data.rgbType !== 'r/g/b' && data.rgbType !== 'r/g/b/w',
                            onChange: loadStates,
                        },
                        {
                            name: 'white_mode',
                            type: 'id',
                            label: 'whiteMode',
                            tooltip: 'whiteModeTooltip',
                            hidden: data => data.rgbType !== 'rgbw' && data.rgbType !== 'r/g/b/w',
                            onChange: loadStates,
                        },
                        {
                            name: 'noRgbPalette',
                            type: 'checkbox',
                            label: 'noRgbPalette',
                            hidden: data => data.rgbType !== 'rgb' && data.rgbType !== 'rgbw' && data.rgbType !== 'r/g/b' && data.rgbType !== 'r/g/b/w',
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
                        {
                            name: 'toggleOnClick',
                            label: 'toggleOnClick',
                            type: 'checkbox',
                            hidden: '!data.switch',
                        },
                        {
                            label: 'pressDuration',
                            name: 'pressDuration',
                            tooltip: 'pressDuration_tooltip',
                            type: 'slider',
                            min: 100,
                            max: 3000,
                            hidden: '!data.toggleOnClick || !data.switch',
                        },
                        {
                            label: 'borderRadius',
                            name: 'borderRadius',
                            type: 'slider',
                            min: 0,
                            max: 100,
                            hidden: '!data.noCard',
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

    async componentDidMount() {
        super.componentDidMount();
        await this.rgbReadObjects();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.rgbDestroy();
    }

    async onRxDataChanged() {
        await this.rgbReadObjects();
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return RGBLight.getWidgetInfo();
    }

    rgbGetIdMin = id => {
        if (id === 'color_temperature') {
            return this.state.rxData.ct_min || this.state.rgbObjects[id]?.common?.min || 0;
        }
        return this.state.rgbObjects[id]?.common?.min || 0;
    };

    rgbGetIdMax = id => {
        if (id === 'color_temperature') {
            return this.state.rxData.ct_max || this.state.rgbObjects[id]?.common?.max || 0;
        }

        return this.state.rgbObjects[id]?.common?.max || 0;
    };

    rgbSetId = (id, value) => {
        if (this.state.rgbObjects[id]) {
            this.timeouts[id] && clearTimeout(this.timeouts[id]);

            // control switch directly without timeout
            if (id === 'switch' || id === 'white_mode') {
                this.props.context.setValue(this.state.rxData[id], value);
            } else {
                const values = { ...this.state.values, [`${this.state.rxData[id]}.val`]: value };
                this.setState({ values });

                this.timeouts[id] = setTimeout(() => {
                    this.timeouts[id] = null;
                    this.props.context.setValue(this.state.rxData[id], value);
                }, parseInt(this.state.rxData.timeout, 10) || 200);
            }
        }
    };

    async rgbReadObjects() {
        const rgbObjects = {};
        const idToRead = [];
        for (const k in RGB_NAMES) {
            const id = RGB_NAMES[k];
            if (this.state.rxData[id] && this.state.rxData[id] !== 'nothing_selected') {
                idToRead.push(this.state.rxData[id]);
            }
        }
        const _objects = await this.props.context.socket.getObjectsById(idToRead);
        const newState = {};

        for (const k in RGB_NAMES) {
            const id = RGB_NAMES[k];
            if (this.state.rxData[id]) {
                const object = _objects[this.state.rxData[id]];
                if (object) {
                    rgbObjects[id] = object;
                }
            }
        }
        newState.rgbObjects = rgbObjects;

        // calculate array of color temperatures to draw slider
        if (rgbObjects.color_temperature) {
            const colors = [];
            let min = parseInt(this.state.rxData.ct_min || rgbObjects.color_temperature?.common?.min, 10) || 2700;
            let max = parseInt(this.state.rxData.ct_max || rgbObjects.color_temperature?.common?.max, 10) || 6000;
            if (max < min) {
                const tmp = max;
                max = min;
                min = tmp;
            }
            const step = (max - min) / 20;
            if (step) {
                for (let i = min; i <= max; i += step) {
                    colors.push(colorTemperatureToRGB(i));
                }
            }
            newState.colorTemperatures = colors;
        } else {
            newState.colorTemperatures = [];
        }

        this.setState(newState);
    }

    rgbDestroy() {
        for (const k in this.timeouts) {
            if (this.timeouts[k]) {
                clearTimeout(this.timeouts[k]);
                this.timeouts[k] = null;
            }
        }
    }

    rgbIsOnlyHue = () => this.state.rxData.rgbType === 'hue/sat/lum' && (!this.state.rgbObjects.saturation || !this.state.rgbObjects.luminance);

    rgbGetWheelColor = () => {
        let result = {
            h: undefined,
            s: undefined,
            v: undefined,
            a: undefined,
        };

        if (this.state.rxData.rgbType === 'hue/sat/lum') {
            result = hslaToHsva({
                h: this.getPropertyValue('hue'),
                s: this.rgbIsOnlyHue() ? 100 : this.getPropertyValue('saturation'),
                l: this.rgbIsOnlyHue() ? 50 : this.getPropertyValue('luminance'),
            });
        } else if (this.state.rxData.rgbType === 'r/g/b' || this.state.rxData.rgbType === 'r/g/b/w') {
            result = rgbaToHsva({
                r: this.getPropertyValue('red'),
                g: this.getPropertyValue('green'),
                b: this.getPropertyValue('blue'),
            });
        } else if (this.state.rxData.rgbType === 'rgb') {
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
        } else if (this.state.rxData.rgbType === 'rgbw') {
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

        if (this.state.rxData.hideBrightness) {
            result.v = 100;
        }

        return result;
    };

    rgbSetWheelColor = color => {
        if (this.state.rxData.rgbType === 'hue/sat/lum') {
            color = hsvaToHsla(color);
            this.rgbSetId('hue', color.h);
            if (!this.rgbIsOnlyHue()) {
                this.rgbSetId('saturation', color.s);
                this.rgbSetId('luminance', color.l);
            }
        } else if (this.state.rxData.rgbType === 'r/g/b' || this.state.rxData.rgbType === 'r/g/b/w') {
            color = hsvaToRgba(color);
            this.rgbSetId('red', color.r);
            this.rgbSetId('green', color.g);
            this.rgbSetId('blue', color.b);
        } else if (this.state.rxData.rgbType === 'rgb') {
            this.rgbSetId('rgb', hsvaToHex(color));
        } else if (this.state.rxData.rgbType === 'rgbw') {
            if (this.state.rgbObjects.white) {
                this.rgbSetId('rgb', hsvaToHex(color));
            } else {
                let val = this.getPropertyValue('rgb') || '#00000000';
                val = hsvaToHex(color) + val.substring(7);
                this.rgbSetId('rgb', val);
            }
        }
    };

    rgbGetWhite = () => {
        if (this.state.rxData.rgbType === 'r/g/b/w') {
            return this.getPropertyValue('white');
        }
        if (this.state.rxData.rgbType === 'rgbw') {
            if (this.state.rgbObjects.white) {
                return this.getPropertyValue('white');
            }

            const val = this.getPropertyValue('rgb')?.substring(7);
            return parseInt(val, 16);
        }
        return 0;
    };

    rgbSetWhite = color => {
        if (this.state.rxData.rgbType === 'r/g/b/w') {
            this.rgbSetId('white', color);
        } else if (this.state.rxData.rgbType === 'rgbw') {
            if (this.state.rgbObjects.white) {
                this.rgbSetId('white', color);
            } else {
                let val = this.getPropertyValue('rgb') || '#00000000';
                val = val.substring(0, 7) + color.toString(16).padStart(2, '0');
                this.rgbSetId('rgb', val);
            }
        }
    };

    rgbSetWhiteMode = value => {
        if (this.state.rxData.white_mode) {
            this.rgbSetId('white_mode', !!value);
        }
    };

    rgbGetWhiteMode = () => {
        if (!this.state.rxData.white_mode) {
            return null;
        }
        return this.getPropertyValue('white_mode');
    };

    rgbIsRgb = () => {
        if ((this.state.rxData.rgbType === 'rgb' || this.state.rxData.rgbType === 'rgbw')
        && this.state.rxData.rgb) {
            return true;
        }

        return (this.state.rxData.rgbType === 'r/g/b' || this.state.rxData.rgbType === 'r/g/b/w')
            && this.state.rgbObjects.red
            && this.state.rgbObjects.green
            && this.state.rgbObjects.blue;
    };

    rgbIsWhite = () => (this.state.rxData.rgbType === 'rgbw' && this.state.rxData.rgb)
        || (this.state.rxData.rgbType === 'r/g/b/w' && this.state.rgbObjects.white);

    rgbIsHSL = () => this.state.rxData.rgbType === 'hue/sat/lum' && this.state.rgbObjects.hue;

    rgbRenderSwitch() {
        return this.state.rgbObjects.switch && <div
            className={this.props.classes.rgbSliderContainer}
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
        return this.state.rgbObjects.brightness && <div className={this.props.classes.rgbSliderContainer}>
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
        return <div className={`dark ${this.props.classes.rgbWheel}`}>
            <Sketch
                color={this.rgbGetWheelColor()}
                disableAlpha
                onChange={color => this.rgbSetWheelColor(color.hsva)}
            />
        </div>;
    }

    rgbRenderWheelTypeSwitch(isWheelVisible, twoPanels, whiteMode) {
        if (!isWheelVisible) {
            return null;
        }

        if (whiteMode === null && this.state.rxData.noRgbPalette) {
            return null;
        }

        return !this.rgbIsOnlyHue() && <div style={{ textAlign: twoPanels ? 'right' : undefined }}>
            {whiteMode !== null ? <Tooltip title={Generic.t('Switch white mode')}>
                <IconButton onClick={() => this.rgbSetWhiteMode(!whiteMode)} color={whiteMode ? 'primary' : 'default'}>
                    <WbAuto />
                </IconButton>
            </Tooltip> : null}
            {!this.state.rxData.noRgbPalette && whiteMode !== true ? <Tooltip title={Generic.t('Switch color picker')}>
                <IconButton onClick={() => this.setState({ sketch: !this.state.sketch })}>
                    <ColorLens />
                </IconButton>
            </Tooltip> : null}
        </div>;
    }

    rgbRenderBrightnessSlider(isWheelVisible, whiteMode) {
        if (!isWheelVisible || this.state.sketch || this.state.rxData.hideBrightness || whiteMode === true) {
            return null;
        }
        return !this.rgbIsOnlyHue() && <ShadeSlider
            hsva={this.rgbGetWheelColor()}
            onChange={shade =>
                this.rgbSetWheelColor({ ...this.rgbGetWheelColor(), ...shade })}
        />;
    }

    rgbRenderWheel(isWheelVisible, whiteMode) {
        if (!isWheelVisible || whiteMode === true) {
            return null;
        }
        return this.state.sketch ? this.rgbRenderSketch() :  <div className={this.props.classes.rgbWheel}>
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
        if (!this.state.rgbObjects.white) {
            min = 0;
            max = 255;
        } else {
            min = this.rgbGetIdMin('white') || 0;
            max = this.rgbGetIdMax('white') || 100;
        }

        return <div className={this.props.classes.rgbSliderContainer}>
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

    rgbRenderColorTemperature(whiteMode) {
        if (this.state.rxData.rgbType !== 'ct' || whiteMode === true) {
            return null;
        }
        return <div className={this.props.classes.rgbSliderContainer}>
            <Tooltip title={Generic.t('Color temperature')}>
                <Thermostat />
            </Tooltip>
            <div
                className={this.props.classes.rgbSliderContainer}
                style={{
                    background:
        `linear-gradient(to right, ${this.state.colorTemperatures.map(c => `rgb(${c.red}, ${c.green}, ${c.blue})`).join(', ')})`,
                    flex: '1',
                    borderRadius: 4,
                }}
            >
                <Slider
                    valueLabelDisplay="auto"
                    min={this.rgbGetIdMin('color_temperature') || 2700}
                    max={this.rgbGetIdMax('color_temperature') || 6000}
                    value={this.getPropertyValue('color_temperature') || 0}
                    onChange={(e, value) => this.rgbSetId('color_temperature', value)}
                />
            </div>
        </div>;
    }

    rgbRenderDialog(wheelVisible, whiteMode) {
        if (!this.state.dialog) {
            return null;
        }
        return <Dialog
            fullWidth
            maxWidth="sm"
            open={!0}
            classes={{ paper: this.props.classes.rgbDialog }}
            onClose={() => this.setState({ dialog: false })}
        >
            <DialogTitle>
                {this.state.rxData.widgetTitle}
                <IconButton style={{ float: 'right' }} onClick={() => this.setState({ dialog: null })}><Close /></IconButton>
            </DialogTitle>
            <DialogContent style={{ maxWidth: 400 }}>
                <div className={this.props.classes.rgbDialogContainer}>
                    {this.rgbRenderSwitch()}
                    {this.rgbRenderBrightness()}
                    {this.rgbRenderWhite()}
                    {this.rgbRenderWheelTypeSwitch(wheelVisible, false, whiteMode)}
                    {this.rgbRenderWheel(wheelVisible, whiteMode)}
                    {this.rgbRenderBrightnessSlider(wheelVisible, whiteMode)}
                    {this.rgbRenderColorTemperature(whiteMode)}
                </div>
            </DialogContent>
        </Dialog>;
    }

    rgbGetColor = () => {
        if (this.state.rxData.rgbType === 'ct') {
            const color = colorTemperatureToRGB(this.getPropertyValue('color_temperature'));
            return rgbaToHex({
                r: color.red,
                g: color.green,
                b: color.blue,
            });
        }
        return hsvaToHex(this.rgbGetWheelColor());
    };

    rgbGetTextColor = () => {
        if (this.state.rxData.rgbType === 'ct') {
            const color = colorTemperatureToRGB(this.getPropertyValue('color_temperature'));
            return color.red + color.green + color.blue > 3 * 128 ? '#000000' : '#ffffff';
        }
        const color = hsvaToRgba(this.rgbGetWheelColor());
        return color.r + color.g + color.b > 3 * 128 ? '#000000' : '#ffffff';
    };

    onCommand(command) {
        super.onCommand(command);
        if (command === 'openDialog') {
            this.setState({ dialog: true });
            return true;
        }
        if (command === 'closeDialog') {
            this.setState({ dialog: false });
            return true;
        }
        return false;
    }

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
        if (this.state.rgbObjects.switch) {
            switchState = this.getPropertyValue('switch');
        }
        const wheelVisible = this.rgbIsRgb() || this.rgbIsHSL();

        const whiteMode = this.rgbGetWhiteMode();

        let rgbContent;
        if (this.state.rxData.fullSize && !this.state.rxData.externalDialog) {
            if (wheelVisible && size >= 350) {
                rgbContent = <div
                    ref={this.contentRef}
                    className={this.props.classes.rgbDialogContainer}
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
                        {this.rgbRenderColorTemperature(whiteMode)}
                        {this.rgbRenderBrightnessSlider(wheelVisible, whiteMode)}
                        {this.rgbRenderWheelTypeSwitch(wheelVisible, true, whiteMode)}
                    </div>
                    <div
                        style={{
                            flexDirection: 'column',
                            display: 'flex',
                        }}
                    >
                        {this.rgbRenderWheel(wheelVisible, whiteMode)}
                    </div>
                </div>;
            } else {
                rgbContent = <div
                    ref={this.contentRef}
                    className={this.props.classes.rgbDialogContainer}
                >
                    {this.rgbRenderSwitch()}
                    {this.rgbRenderBrightness()}
                    {this.rgbRenderWhite()}
                    {this.rgbRenderWheelTypeSwitch(wheelVisible, false, whiteMode)}
                    {this.rgbRenderWheel(wheelVisible, whiteMode)}
                    {this.rgbRenderBrightnessSlider(wheelVisible, whiteMode)}
                    {this.rgbRenderColorTemperature(whiteMode)}
                </div>;
            }
        } else if (this.props.editMode || !this.state.rxData.externalDialog) {
            if (switchState) {
                props.className = `${props.className} vis-on`.trim();
            } else {
                props.className = `${props.className} vis-off`.trim();
            }
            rgbContent = <>
                <div className={this.props.classes.rgbContent} ref={this.contentRef}>
                    <IconButton
                        onClick={!this.state.rxData.toggleOnClick || !this.state.rgbObjects.switch ? () => this.setState({ dialog: true }) : undefined}
                        onMouseDown={!this.isTouch && this.state.rxData.toggleOnClick && this.state.rgbObjects.switch ? () => {
                            this.pressTimeout && clearTimeout(this.pressTimeout);
                            this.pressTimeout = setTimeout(() => {
                                this.pressTimeout = null;
                                this.setState({ dialog: true });
                            }, parseInt(this.state.rxData.pressDuration, 10) || 300);
                        } : undefined}
                        onMouseUp={!this.isTouch && this.state.rxData.toggleOnClick && this.state.rgbObjects.switch ? () => {
                            if (this.pressTimeout) {
                                clearTimeout(this.pressTimeout);
                                this.pressTimeout = null;
                                this.rgbSetId('switch', !switchState);
                            }
                        } : undefined}
                        onTouchStart={this.isTouch && this.state.rxData.toggleOnClick && this.state.rgbObjects.switch ? () => {
                            this.pressTimeout && clearTimeout(this.pressTimeout);
                            this.pressTimeout = setTimeout(() => {
                                this.pressTimeout = null;
                                this.setState({ dialog: true });
                            }, parseInt(this.state.rxData.pressDuration, 10) || 300);
                        } : undefined}
                        onTouchEnd={this.isTouch && this.state.rxData.toggleOnClick && this.state.rgbObjects.switch ? () => {
                            if (this.pressTimeout) {
                                clearTimeout(this.pressTimeout);
                                this.pressTimeout = null;
                                this.rgbSetId('switch', !switchState);
                            }
                        } : undefined}
                        style={{
                            backgroundColor: switchState === null || switchState ? this.rgbGetColor() :
                                (this.props.context.themeType === 'dark' ? '#111' : '#eee'),
                            color: this.rgbGetTextColor(),
                            width: size,
                            height: size,
                            borderRadius: parseInt(this.state.rxData.borderRadius, 10) || undefined,
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
                {this.rgbRenderDialog(wheelVisible, whiteMode)}
            </>;
        } else if (this.state.rxData.externalDialog) {
            return this.rgbRenderDialog(wheelVisible);
        }

        if (this.state.rxData.noCard || props.widget.usedInWidget) {
            return rgbContent;
        }

        return this.wrapContent(rgbContent, null);
    }
}

export default withStyles(styles)(RGBLight);
