import React from 'react';
import { withStyles } from '@mui/styles';

import {
    Button, Chip, Dialog, DialogContent, DialogTitle, TextField,
} from '@mui/material';
import { I18n } from '@iobroker/adapter-react-v5';
import {
    Backspace, Check, RemoveModerator as RemoveModeratorIcon, Security as SecurityIcon,
} from '@mui/icons-material';
import Generic from './Generic';

const styles = () => ({
    pinGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridGap: '10px' },
    pinInput:  { padding: '10px 0px' },
    timerDialog: { textAlign: 'center' },
    timerSeconds:  { fontSize: '200%', padding: 40 },
    lockedButton: {
        display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', flex: 1,
    },
    unlockedButtons: {
        display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'center', flex: 1,
    },
    lockButton: { display: 'flex', gap: 8, alignItems: 'center' },
    icon: { height: 20 },
    status: { display: 'flex', alignItems: 'center' },
});

class Security extends Generic {
    constructor(props) {
        super(props);
        this.state.objects = {};
        this.state.dialog = false;
        this.state.timerDialog = false;
        this.state.pinInput = '';
        this.state.timerI = null;
        this.state.timerSeconds = 0;
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Security',
            visSet: 'vis-2-widgets-material',
            visName: 'Security',
            visWidgetLabel: 'vis_2_widgets_material_security',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'name',
                            label: 'vis_2_widgets_material_name',
                        },
                        {
                            name: 'buttonsCount',
                            label: 'vis_2_widgets_material_buttons_count',
                            type: 'number',
                            default: 2,
                        },
                    ],
                }, {
                    name: 'buttons',
                    indexFrom: 1,
                    indexTo: 'buttonsCount',
                    fields: [
                        {
                            name: 'oid',
                            type: 'id',
                            label: 'vis_2_widgets_material_oid',
                            onChange: async (field, data, changeData, socket) => {
                                const object = await socket.getObject(data[field.name]);
                                if (object && object.common) {
                                    data[`color${field.index}`] = object.common.color !== undefined ? object.common.color : null;
                                    data[`name${field.index}`] = object.common.name && typeof object.common.name === 'object' ? object.common.name[I18n.getLanguage()] : object.common.name;
                                    changeData(data);
                                }
                            },
                        },
                        {
                            name: 'name',
                            label: 'vis_2_widgets_material_name',
                        },
                        {
                            name: 'color',
                            type: 'color',
                            label: 'vis_2_widgets_material_color',
                        },
                        {
                            name: 'icon',
                            type: 'image',
                            label: 'vis_2_widgets_material_icon',
                        },
                        {
                            name: 'pincode',
                            label: 'vis_2_widgets_material_pincode',
                            onChange: async (field, data, changeData /* , socket */) => {
                                data[`pincode${field.index}`] = data[`pincode${field.index}`].replace(/[^0-9]/g, '');
                                changeData(data);
                            },
                        },
                        {
                            name: 'pincode-oid',
                            type: 'id',
                            label: 'vis_2_widgets_material_pincode_oid',
                        },
                        {
                            name: 'pincodeReturnButton',
                            type: 'select',
                            options: ['submit', 'backspace'],
                            default: 'submit',
                            label: 'vis_2_widgets_material_pincode_return_button',
                        },
                        {
                            name: 'timerSeconds',
                            type: 'number',
                            label: 'vis_2_widgets_material_timer_seconds',
                        },
                        {
                            name: 'timerSeconds-oid',
                            type: 'id',
                            label: 'vis_2_widgets_material_timer_seconds_oid',
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 240,
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_security.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Security.getWidgetInfo();
    }

    async propertiesUpdate() {
        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData === actualRxData) {
            return;
        }

        this.lastRxData = actualRxData;

        const objects = {};

        // try to find icons for all OIDs
        for (let i = 1; i <= this.state.rxData.buttonsCount; i++) {
            if (this.state.rxData[`oid${i}`]) {
                // read object itself
                const object = await this.props.socket.getObject(this.state.rxData[`oid${i}`]);
                if (!object) {
                    objects[i] = { common: {} };
                    continue;
                }
                object.common = object.common || {};
                object.isChart = !!(object.common.custom && object.common.custom[this.props.systemConfig?.common?.defaultHistory]);
                if (!this.state.rxData[`icon${i}`] && !object.common.icon && (object.type === 'state' || object.type === 'channel')) {
                    const idArray = this.state.rxData[`oid${i}`].split('.');

                    // read channel
                    const parentObject = await this.props.socket.getObject(idArray.slice(0, -1).join('.'));
                    if (!parentObject?.common?.icon && (object.type === 'state' || object.type === 'channel')) {
                        const grandParentObject = await this.props.socket.getObject(idArray.slice(0, -2).join('.'));
                        if (grandParentObject?.common?.icon) {
                            object.common.icon = grandParentObject.common.icon;
                        }
                    } else {
                        object.common.icon = parentObject.common.icon;
                    }
                }
                objects[i] = { common: object.common, _id: object._id };
            }
        }

        if (JSON.stringify(objects) !== JSON.stringify(this.state.objects)) {
            this.setState({ objects });
        }
    }

    async onRxDataChanged(prevRxData) {
        await this.propertiesUpdate();
    }

    async componentDidMount() {
        super.componentDidMount();
        this.propertiesUpdate();
    }

    renderUnlockDialog() {
        let lockedId = null;
        let pincode = null;
        let pincodeReturnButton = null;
        for (let i = 1; i <= this.state.rxData.buttonsCount; i++) {
            if (this.getPropertyValue(`oid${i}`)) {
                lockedId = this.state.rxData[`oid${i}`];
                pincode = this.getPincode(i);
                pincodeReturnButton = this.state.rxData[`pincodeReturnButton${i}`] === 'backspace' ? 'backspace' : 'submit';

                break;
            }
        }

        return <Dialog open={this.state.dialog} onClose={() => this.setState({ dialog: false })}>
            <DialogTitle>{I18n.t('vis_2_widgets_material_enter_pin')}</DialogTitle>
            <DialogContent>
                <div className={this.props.classes.pinInput}>
                    <TextField
                        variant="outlined"
                        fullWidth
                        inputProps={{
                            readOnly: true,
                            style:{
                                textAlign: 'center',
                            },
                        }}
                        value={this.state.pinInput}
                    />
                </div>
                <div className={this.props.classes.pinGrid}>
                    {
                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 'R', 0,
                            pincodeReturnButton].map(button => {
                            let buttonTitle = button;
                            if (button === 'backspace') {
                                buttonTitle = <Backspace />;
                            } else if (button === 'submit') {
                                buttonTitle = <Check />;
                            }
                            return <Button
                                variant="outlined"
                                key={button}
                                onClick={() => {
                                    if (button === 'submit') {
                                        if (this.state.pinInput === pincode) {
                                            this.props.socket.setState(lockedId, false);
                                            this.setState({ dialog: false });
                                        }
                                    } else if (button === 'backspace') {
                                        this.setState({ pinInput: this.state.pinInput.slice(0, -1) });
                                    } else if (button === 'R') {
                                        this.setState({ pinInput: '' });
                                    } else {
                                        const pinInput = this.state.pinInput + button;
                                        this.setState({ pinInput });
                                        if (pincodeReturnButton === 'backspace' && pinInput === pincode) {
                                            this.props.socket.setState(lockedId, false);
                                            this.setState({ dialog: false });
                                        }
                                    }
                                }}
                            >
                                {buttonTitle}
                            </Button>;
                        })
                    }
                </div>
            </DialogContent>
        </Dialog>;
    }

    renderTimerDialog() {
        const onClose = () => {
            this.setState({ timerDialog: false });
            if (this.state.rxData.timerSecondsOid) {
                this.props.socket.setState(this.state.rxData.timerSecondsOid, -1);
            }
            clearInterval(this.timerInterval);
        };
        return <Dialog
            open={this.state.timerDialog}
            onClose={onClose}
            className={this.props.classes.timerDialog}
        >
            <DialogTitle>{`${I18n.t('vis_2_widgets_material_lock_after')} ${this.state.timerSeconds} ${I18n.t('vis_2_widgets_material_seconds')}`}</DialogTitle>
            <DialogContent>
                <div className={this.props.classes.timerSeconds}>
                    {this.state.timerSeconds}
                </div>
                <div>
                    <Button onClick={onClose} variant="contained">{I18n.t('vis_2_widgets_material_lock_cancel')}</Button>
                </div>
            </DialogContent>
        </Dialog>;
    }

    startTimer(i) {
        this.setState({ timerSeconds: this.state.rxData[`timerSeconds${i}`], timerDialog: true });
        if (this.state.rxData[`timerSeconds-oid${i}`]) {
            this.props.socket.setState(this.state.rxData[`timerSeconds-oid${i}`], this.state.rxData[`timerSeconds${i}`]);
        }
        this.timerInterval = setInterval(() => {
            const timerSeconds = this.state.timerSeconds - 1;
            this.setState({ timerSeconds });
            if (timerSeconds === 0) {
                this.props.socket.setState(this.state.rxData[`oid${i}`], true);
                if (this.state.rxData[`timerSeconds-oid${i}`]) {
                    this.props.socket.setState(this.state.rxData[`timerSeconds-oid${i}`], timerSeconds);
                }
                clearInterval(this.timerInterval);
                this.setState({ timerDialog: false });
            }
        }, 1000);
    }

    getPincode(i) {
        return this.state.rxData[`pincode-oid${i}`] ?
            this.getPropertyValue(`pincode-oid${i}`) :
            this.state.rxData[`pincode${i}`];
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const buttons = [];

        let locked = false;
        let lockedButton = null;

        for (let i = 1; i <= this.state.rxData.buttonsCount; i++) {
            buttons.push({
                i,
                oid: this.state.rxData[`oid${i}`],
                name: this.state.rxData[`name${i}`],
                color: this.state.rxData[`color${i}`],
                icon: this.state.rxData[`icon${i}`] || this.state.objects[i]?.common?.icon,
            });
            if (this.getPropertyValue(`oid${i}`)) {
                locked = true;
                lockedButton = buttons[buttons.length - 1];
            }
        }

        const content = <>
            {this.renderUnlockDialog()}
            {this.renderTimerDialog()}
            {locked ? <div className={this.props.classes.lockedButton}>
                <Button
                    variant="contained"
                    onClick={() => {
                        if (this.getPincode(lockedButton.i)) {
                            this.setState({ dialog: true, pinInput: '' });
                        } else {
                            this.props.socket.setState(lockedButton.oid, false);
                        }
                    }}
                >
                    {I18n.t('vis_2_widgets_material_unlock')}
                </Button>
            </div> : <div className={this.props.classes.unlockedButtons}>
                {buttons.map((button, index) =>
                    <Button
                        variant="contained"
                        key={index}
                        style={{ backgroundColor: button.color }}
                        onClick={() => {
                            if (this.state.rxData[`timerSeconds${button.i}`]) {
                                this.startTimer(button.i);
                            } else {
                                this.props.socket.setState(button.oid, true);
                            }
                        }}
                    >
                        <span className={this.props.classes.lockButton}>
                            {button.icon ? <img className={this.props.classes.icon} src={button.icon} alt="" /> : null}
                            {button.name}
                        </span>
                    </Button>)}
            </div>}
        </>;

        const lockedChip = <Chip
            label={<span className={this.props.classes.status}>
                {locked ? <>
                    <SecurityIcon />
                    {lockedButton.name}
                </> : <>
                    <RemoveModeratorIcon />
                    {I18n.t('vis_2_widgets_material_security_off')}
                </>}
            </span>}
            style={{
                backgroundColor: locked ? 'orange' : 'green',
                color: locked ? 'black' : 'white',
            }}
        />;

        return this.wrapContent(content, lockedChip, {
            boxSizing: 'border-box',
            paddingBottom: 10,
        });
    }
}

export default withStyles(styles)(Security);
