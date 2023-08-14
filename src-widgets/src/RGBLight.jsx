import React from 'react';
import { withStyles } from '@mui/styles';

import {
    Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Slider, Switch,
} from '@mui/material';
import {
    Wheel, Hue, rgbaToHsva, rgbStringToHsva, hsvaToHsla, hsvaToRgba, hsvaToRgbString, hexToHsva, hsvaToHex,
} from '@uiw/react-color';
import ct from 'color-temperature';
import Generic from './Generic';

const styles = () => ({

});

const loadStates = async (field, data, changeData, socket) => {
    if (data[field.name]) {
        const object = await socket.getObject(data[field.name]);
        if (object && object.common) {
            const id = data[field.name].split('.');
            id.pop();
            const states = await socket.getObjectView(`${id.join('.')}.`, `${id.join('.')}.\u9999`, 'state');
            if (states) {
                const currentMediaTypes = [...mediaTypes];
                Object.values(states).forEach(state => {
                    const role = state?.common?.role?.match(/^(media\.mode|media|button|level)\.(.*)$/)?.[2];
                    if (role && currentMediaTypes.includes(role) && (!data[role] || data[role] === 'nothing_selected') && field !== role) {
                        currentMediaTypes.splice(currentMediaTypes.indexOf(role), 1);
                        data[role] = state._id;
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
        this.state.dialog = true;
        this.state.objects = {};
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
                            name: 'widgetTitle',
                            label: 'name',
                            hidden: '!!data.noCard',
                        },
                        {
                            name: 'switch',
                            type: 'id',
                            label: 'switch',
                        },
                        {
                            name: 'brightness',
                            type: 'id',
                            label: 'brightness',
                        },
                        {
                            name: 'type',
                            label: 'type',
                            type: 'select',
                            options: [
                                'rgb', 'rgbw', 'r/g/b', 'r/g/b/w', 'hue/sat/lum', 'ct',
                            ],
                        },
                        {
                            name: 'rgb',
                            type: 'id',
                            label: 'rgb',
                            hidden: data => data.type !== 'rgb' && data.type !== 'rgbw',
                        },
                        {
                            name: 'rgbw',
                            type: 'id',
                            label: 'rgbw',
                            hidden: data => data.type !== 'rgbw',
                        },
                        {
                            name: 'red',
                            type: 'id',
                            label: 'red',
                            hidden: data => data.type !== 'r/g/b' && data.type !== 'r/g/b/w',
                        },
                        {
                            name: 'green',
                            type: 'id',
                            label: 'green',
                            hidden: data => data.type !== 'r/g/b' && data.type !== 'r/g/b/w',
                        },
                        {
                            name: 'blue',
                            type: 'id',
                            label: 'blue',
                            hidden: data => data.type !== 'r/g/b' && data.type !== 'r/g/b/w',
                        },
                        {
                            name: 'white',
                            type: 'id',
                            label: 'white',
                            hidden: data => data.type !== 'r/g/b/w',
                        },
                        {
                            name: 'color_temperature',
                            type: 'id',
                            label: 'color_temperature',
                            hidden: data => data.type !== 'ct',
                        },
                        {
                            name: 'hue',
                            type: 'id',
                            label: 'hue',
                            hidden: data => data.type !== 'hue/sat/lum',
                        },
                        {
                            name: 'saturation',
                            type: 'id',
                            label: 'saturation',
                            hidden: data => data.type !== 'hue/sat/lum',
                        },
                        {
                            name: 'luminance',
                            type: 'id',
                            label: 'luminance',
                            hidden: data => data.type !== 'hue/sat/lum',
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

    setId = (id, value) => {
        this.setState({ [id]: value });
        this.props.context.socket.setState(this.state.rxData[id], value);
    };

    async propertiesUpdate() {
        const objects = {};
        const ids = ['switch', 'brightness', 'rgb', 'rgbw', 'red', 'green', 'blue', 'white', 'color_temperature', 'hue', 'saturation', 'luminance'];
        for (const k in ids) {
            const id = ids[k];
            if (this.state.rxData[id]) {
                const state = await this.props.context.socket.getState(this.state.rxData[id]);
                if (state) {
                    console.log(state);
                    this.setState({ [id]: state.val });
                }
                const object = await this.props.context.socket.getObject(this.state.rxData[id]);
                if (object) {
                    console.log(object);
                    objects[id] = object;
                }
            }
        }
        this.setState({ objects });
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.propertiesUpdate();
    }

    async onRxDataChanged() {
        await this.propertiesUpdate();
    }

    getWheelColor = () => {
        let result = {
            h: undefined,
            s: undefined,
            l: undefined,
            a: undefined,
        };

        if (this.state.rxData.type === 'hue/sat/lum') {
            result.h = this.state.hue;
            result.s = this.state.saturation;
            result.l = this.state.luminance;
        } else if (this.state.rxData.type === 'r/g/b' || this.state.rxData.type === 'r/g/b/w') {
            result = rgbaToHsva({
                r: this.state.red,
                g: this.state.green,
                b: this.state.blue,
            });
        } else if (this.state.rxData.type === 'rgb') {
            try {
                result = hexToHsva(this.state.rgb || '');
            } catch (e) {
                console.error(e);
            }
        } else if (this.state.rxData.type === 'rgbw') {
            try {
                result = hexToHsva(this.state.rgbw || '');
            } catch (e) {
                console.error(e);
            }
        }

        return result;
    };

    setWheelColor = color => {
        if (this.state.rxData.type === 'hue/sat/lum') {
            color = hsvaToHsla(color);
            this.setId('hue', color.h);
            this.setId('saturation', color.s);
            this.setId('luminance', color.l);
        } else if (this.state.rxData.type === 'r/g/b' || this.state.rxData.type === 'r/g/b/w') {
            color = hsvaToRgba(color);
            this.setId('red', color.r);
            this.setId('green', color.g);
            this.setId('blue', color.b);
        } else if (this.state.rxData.type === 'rgb') {
            this.setId('rgb', hsvaToHex(color));
        } else if (this.state.rxData.type === 'rgbw') {
            this.setId('rgbw', hsvaToHex(color));
        }
    };

    getWhite = () => {
        if (this.state.rxData.type === 'r/g/b/w') {
            return this.state.white;
        }
        if (this.state.rxData.type === 'rgbw') {
            return this.state.rgbw;
        }
    };

    setWhite = color => {
        if (this.state.rxData.type === 'r/g/b/w') {
            this.setId('white', color);
        } else if (this.state.rxData.type === 'rgbw') {
            this.setId('rgbw', color);
        }
    };

    rgba2rgbw = rgba => rgba + this.state.rgbw.slice(9, 2);

    rgbw2rgba = rgbw => rgbw.slice(9, 2);

    isRgb = () => this.state.rxData.type === 'rgb' || this.state.rxData.type === 'rgbw' ||
    this.state.rxData.type === 'r/g/b' || this.state.rxData.type === 'r/g/b/w';

    isW = () => this.state.rxData.type === 'rgbw' || this.state.rxData.type === 'r/g/b/w';

    isHsl = () => this.state.rxData.type === 'hue/sat/lum';

    renderDialog() {
        const colors = [];
        for (let i = 3000; i <= 12000; i += 100) {
            colors.push(ct.colorTemperature2rgb(i));
        }

        return <Dialog open={this.state.dialog} onClose={() => this.setState({ dialog: false })}>
            <DialogTitle>Dialog</DialogTitle>
            <DialogContent>
                {this.state.rxData.switch && <Switch
                    checked={this.state.switch}
                    onChange={e => this.setId('switch', e.target.checked)}
                />}
                {this.state.rxData.brightness && <Slider
                    value={this.state.brightness}
                    onChange={(e, value) => this.setId('brightness', value)}
                />}
                {this.isW() && <Slider value={this.getWhite()} onChange={(e, value) => this.setWhite(value)} />}
                {this.isRgb() && <Wheel
                    color={this.getWheelColor()}
                    onChange={color => {
                        console.log(color);
                        color = JSON.parse(JSON.stringify(color));
                        color.hsva.v = 100;
                        // color.hsva.s = 100;
                        this.setWheelColor(color.hsva);
                    }}
                />}
                {this.state.rxData.type === 'rgbw' && null}
                {this.state.rxData.type === 'r/g/b/w' && null}
                {this.state.rxData.type === 'hue/sat/lum' && null}
                {this.state.rxData.type === 'ct' && <div style={{
                    background:
                    `linear-gradient(to right, ${colors.map(c => `rgb(${c.red}, ${c.green}, ${c.blue})`).join(', ')})`,
                    display: 'flex',
                    alignItems: 'center',
                }}
                >
                    <Slider min={3000} max={12000} />
                </div>}
            </DialogContent>
            <DialogActions>
            </DialogActions>
        </Dialog>;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const content = <>
            <div>
                <IconButton onClick={() => this.setState({ dialog: true })}>Dialog</IconButton>
            </div>
            {
                this.renderDialog()
            }
        </>;

        if (this.state.rxData.noCard || props.widget.usedInWidget) {
            return content;
        }

        return this.wrapContent(content, null);
    }
}

export default withStyles(styles)(RGBLight);
