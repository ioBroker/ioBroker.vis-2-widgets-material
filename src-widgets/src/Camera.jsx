import React from 'react';
import moment from 'moment';
import { withStyles } from '@mui/styles';

import {
    Dialog, DialogContent, DialogTitle, IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import Generic from './Generic';

const styles = theme => ({

});

class Camera extends Generic {
    constructor(props) {
        super(props);
        this.state.dialog = false;
        this.state.refreshTime = 0;
        this.state.fullRefreshTime = 0;
        this.imageRef = React.createRef();
        this.fullImageRef = React.createRef();
        this.cameraInterval = null;
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Camera',
            visSet: 'vis-2-widgets-material',
            visName: 'Camera',
            visWidgetLabel: 'vis_2_widgets_material_camera',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'name',
                            label: 'vis_2_widgets_material_name',
                        },
                        {
                            name: 'url',
                            label: 'vis_2_widgets_material_url',
                        },
                        {
                            name: 'refreshInterval',
                            type: 'number',
                            default: 1000,
                            label: 'vis_2_widgets_material_refresh_seconds',
                        },
                        {
                            name: 'fullUrl',
                            label: 'vis_2_widgets_material_full_url',
                        },
                        {
                            name: 'fullRefreshInterval',
                            type: 'number',
                            label: 'vis_2_widgets_material_full_refresh_seconds',
                        },
                        {
                            name: 'showRefreshTime',
                            type: 'checkbox',
                            label: 'vis_2_widgets_material_show_refresh_time',
                            default: true,
                        },
                    ],
                }],
            visDefaultStyle: {
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_camera.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Camera.getWidgetInfo();
    }

    async propertiesUpdate() {
        if (this.imageInterval) {
            clearInterval(this.imageInterval);
            this.imageInterval = null;
        }
        this.imageInterval = setInterval(
            async () => {
                await fetch(this.state.rxData.url, { cache: 'reload', mode: 'no-cors' });
                if (this.imageRef.current) {
                    this.imageRef.current.src = this.state.rxData.url;
                }
                this.setState({ refreshTime: Date.now() });
            },
            this.state.rxData.refreshInterval >= 1000 ? this.state.rxData.refreshInterval : 1000,
        );
        if (this.fullImageInterval) {
            clearInterval(this.fullImageInterval);
            this.fullImageInterval = null;
        }
        this.fullImageInterval = setInterval(
            async () => {
                if (this.state.dialog) {
                    await fetch((this.state.rxData.fullUrl || this.state.rxData.url), { cache: 'reload', mode: 'no-cors' });
                    if (this.fullImageRef.current) {
                        this.fullImageRef.current.src = this.state.rxData.fullUrl || this.state.rxData.url;
                    }
                    this.setState({ fullRefreshTime: Date.now() });
                }
            },
            (this.state.rxData.fullRefreshInterval || this.state.rxData.refreshInterval) >= 1000 ?
                (this.state.rxData.fullRefreshInterval || this.state.rxData.refreshInterval) :
                1000,
        );
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.propertiesUpdate();
    }

    async onRxDataChanged(prevRxData) {
        await this.propertiesUpdate();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        if (this.imageInterval) {
            clearInterval(this.imageInterval);
        }
        if (this.fullImageInterval) {
            clearInterval(this.fullImageInterval);
        }
    }

    closeDialog = () => {
        this.setState({ dialog: false });
        clearInterval(this.fullImageInterval);
        this.fullImageInterval = null;
    };

    renderDialog() {
        return <Dialog
            open={this.state.dialog}
            onClose={this.closeDialog}
        >
            <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {this.state.rxData.name}
                <IconButton onClick={this.closeDialog}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
                        <img
                            ref={this.fullImageRef}
                            src={this.state.rxData.fullUrl || this.state.rxData.url}
                            alt="Camera"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>
                    <div style={{ textAlign: 'right', paddingTop: 20 }}>
                        {this.state.rxData.showRefreshTime && this.state.fullRefreshTime ?
                            moment(this.state.fullRefreshTime).format('DD.MM.YYYY HH:mm:ss') :
                            null}
                    </div>
                </div>
            </DialogContent>
        </Dialog>;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const content = <>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <img
                    ref={this.imageRef}
                    src={this.state.rxData.url}
                    alt="Camera"
                    style={{
                        width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer',
                    }}
                    onClick={() => {
                        this.setState({ dialog: true });
                        this.propertiesUpdate();
                    }}
                />
                {this.renderDialog()}
            </div>
            <div style={{ textAlign: 'right', width: '100%', paddingTop: 20 }}>
                {this.state.rxData.showRefreshTime && this.state.refreshTime ?
                    moment(this.state.refreshTime).format('DD.MM.YYYY HH:mm:ss') :
                    null}
            </div>
        </>;

        return this.wrapContent(content, null, {
            boxSizing: 'border-box',
            paddingBottom: 10,
        });
    }
}

export default withStyles(styles)(Camera);
