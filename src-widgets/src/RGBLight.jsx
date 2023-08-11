import React from 'react';
import { withStyles } from '@mui/styles';

import {
    Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Slider, Switch,
} from '@mui/material';
import { ColorSlider, ColorWheel } from '@react-spectrum/color';
import { Provider, defaultTheme } from '@adobe/react-spectrum';
import { color } from 'echarts';
import Generic from './Generic';

const styles = theme => ({

});

class RGBLight extends Generic {
    constructor(props) {
        super(props);
        this.state.dialog = true;
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

    async propertiesUpdate() {

    }

    async componentDidMount() {
        super.componentDidMount();
        await this.propertiesUpdate();
    }

    async onRxDataChanged() {
        await this.propertiesUpdate();
    }

    getColor = () => {

    };

    setColor = color => {

    };

    renderDialog() {
        return <Dialog open={this.state.dialog} onClose={() => this.setState({ dialog: false })}>
            <DialogTitle>Dialog</DialogTitle>
            <DialogContent>
                {this.state.rxData.switch && <Switch />}
                {this.state.rxData.brightness && <Slider />}
                {this.state.rxData.type === 'rgb' && null}
                {this.state.rxData.type === 'rgbw' && null}
                {this.state.rxData.type === 'r/g/b' && null}
                {this.state.rxData.type === 'r/g/b/w' && null}
                {this.state.rxData.type === 'hue/sat/lum' && null}
                {this.state.rxData.type === 'ct' && null}
                <Provider theme={defaultTheme}>
                    <ColorSlider defaultValue="hsl(0, 100%, 50%)" channel="hue" />
                    <ColorWheel defaultValue="hsl(0, 100%, 50%)" />
                </Provider>
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
