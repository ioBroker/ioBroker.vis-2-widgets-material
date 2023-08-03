import React from 'react';
import { withStyles } from '@mui/styles';

import {
    Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
} from '@mui/material';
import { ColorSlider, ColorWheel } from '@react-spectrum/color';
import { Provider, defaultTheme } from '@adobe/react-spectrum';
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
                            name: 'red',
                            type: 'id',
                            label: 'red',
                        },
                        {
                            name: 'green',
                            type: 'id',
                            label: 'green',
                        },
                        {
                            name: 'blue',
                            type: 'id',
                            label: 'blue',
                        },
                        {
                            name: 'white',
                            type: 'id',
                            label: 'white',
                        },
                        {
                            name: 'temperature',
                            type: 'id',
                            label: 'temperature',
                        },
                        {
                            name: 'brightness',
                            type: 'id',
                            label: 'brightness',
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

    renderDialog() {
        return <Dialog open={this.state.dialog} onClose={() => this.setState({ dialog: false })}>
            <DialogTitle>Dialog</DialogTitle>
            <DialogContent>
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
