import React from 'react';
import { withStyles } from '@mui/styles';

import {
    Button, CircularProgress,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
} from '@mui/material';

import {
    Backspace,
    Check,
    MeetingRoom as DoorOpenedIcon,
    LockOpen as LockOpenedIcon,
    Lock as LockClosedIcon,
    Cancel,
    Close,
} from '@mui/icons-material';

import Generic from './Generic';
import DoorAnimation from './Components/DoorAnimation';
import LockAnimation from './Components/LockAnimation';

const styles = () => ({
    content: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    lockPinGrid:  {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridGap: '10px',
    },
    lockPinInput:  {
        padding: '10px 0px',
    },
    lockWorkingIcon: {
        position: 'absolute',
        top: 10,
        left: 10,
    },
    lockSvgIcon: {
        // width: '100%',
        // height: '100%',
    },
});

class Lock extends Generic {
    constructor(props) {
        super(props);
        this.state.dialogPin = false;
        this.state.lockPinInput = '';
        this.state.invalidPin = false;
        this.state.confirmDialog = false;
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Lock',
            visSet: 'vis-2-widgets-material',
            visName: 'Lock',
            visWidgetLabel: 'lock',
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
                            name: 'lock-oid',
                            type: 'id',
                            label: 'lock-oid',
                            onChange: async (field, data, changeData, socket) => {
                                if (data['lock-oid']) {
                                    const object = await socket.getObject(data['lock-oid']);
                                    if (object && object.common && object.common.role === 'switch.lock') {
                                        const id = data[field.name].split('.');
                                        id.pop();
                                        const states = await socket.getObjectView(`${id.join('.')}.`, `${id.join('.')}.\u9999`, 'state');
                                        if (states) {
                                            Object.values(states).forEach(state => {
                                                const role = state.common.role;
                                                if (role.startsWith('button')) {
                                                    data['doorOpen-oid'] = state._id;
                                                } else if (role.includes('direction') || role.includes('working')) {
                                                    data['lockWorking-oid'] = state._id;
                                                }
                                            });
                                            changeData(data);
                                        }
                                    }
                                }
                            },
                        },
                        {
                            name: 'doorOpen-oid',
                            type: 'id',
                            label: 'doorOpen-oid',
                        },
                        {
                            name: 'lockWorking-oid',
                            type: 'id',
                            label: 'lockWorking-oid',
                            hidden: data => !data['lock-oid'],
                        },
                        {
                            name: 'doorSensor-oid',
                            type: 'id',
                            label: 'doorSensor-oid',
                        },
                        {
                            name: 'pincode',
                            label: 'pincode',
                            onChange: async (field, data, changeData /* , socket */) => {
                                if (data.pincode && data.pincode.match(/[^0-9]/g)) {
                                    data.pincode = data.pincode.replace(/[^0-9]/g, '');
                                    changeData(data);
                                }
                            },
                            hidden: data => !!data['pincode-oid'],
                        },
                        {
                            name: 'pincode-oid',
                            type: 'id',
                            label: 'pincode_oid',
                            hidden: data => !!data.pincode,
                        },
                        {
                            name: 'doNotConfirm',
                            type: 'checkbox',
                            label: 'doNotConfirm',
                            hidden: data => !!data.pincode || !!data['pincode-oid'],
                        },
                        {
                            name: 'pincodeReturnButton',
                            type: 'select',
                            options: ['submit', 'backspace'],
                            default: 'submit',
                            label: 'pincode_return_button',
                            hidden: data => !!data['pincode-oid'] && !!data.pincode,
                        },
                        {
                            name: 'doorSize',
                            label: 'doorSize',
                            type: 'slider',
                            min: 20,
                            max: 500,
                            default: 100,
                            hidden: data => !data['doorOpen-oid'] && !data['doorSensor-oid'],
                        },
                        {
                            name: 'lockSize',
                            label: 'lockSize',
                            type: 'slider',
                            min: 15,
                            max: 500,
                            default: 40,
                            hidden: data => !data['lock-oid'],
                        },
                        {
                            name: 'noLockAnimation',
                            label: 'noLockAnimation',
                            type: 'checkbox',
                            hidden: data => !data['lock-oid'],
                        },
                        {
                            name: 'lockColor',
                            label: 'Lock color',
                            type: 'color',
                            hidden: data => !data['lock-oid'] || !!data.noLockAnimation,
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 240,
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_lock.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Lock.getWidgetInfo();
    }

    lockRenderUnlockDialog() {
        if (!this.state.dialogPin) {
            return null;
        }
        const pincode = this.lockGetPinCode();
        const pincodeReturnButton = this.state.rxData.pincodeReturnButton === 'backspace' ? 'backspace' : 'submit';

        return <Dialog open={!0} onClose={() => this.setState({ dialogPin: false })}>
            <DialogTitle>{Generic.t('enter_pin')}</DialogTitle>
            <DialogContent>
                <div className={this.props.classes.lockPinInput}>
                    <TextField
                        variant="outlined"
                        fullWidth
                        type={this.state.invalidPin ? 'text' : 'password'}
                        inputProps={{
                            readOnly: true,
                            style: {
                                textAlign: 'center',
                                color: this.state.invalidPin ? '#ff3e3e' : 'inherit',
                            },
                        }}
                        value={this.state.invalidPin ? Generic.t('invalid_pin') : this.state.lockPinInput}
                    />
                </div>
                <div className={this.props.classes.lockPinGrid}>
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
                                title={button === 'R' ?
                                    (this.state.lockPinInput ? Generic.t('reset') : Generic.t('close')) :
                                    (button === pincodeReturnButton ? 'enter' : '')}
                                onClick={() => {
                                    if (button === 'submit') {
                                        if (this.state.lockPinInput === pincode) {
                                            if (this.state.dialogPin === 'doorOpen-oid') {
                                                this.props.context.setValue(this.state.rxData['doorOpen-oid'], true);
                                            } else {
                                                this.props.context.setValue(this.state.rxData['lock-oid'], true);
                                            }
                                            this.setState({ dialogPin: false });
                                        } else {
                                            this.setState({ lockPinInput: '', invalidPin: true });
                                            setTimeout(() => this.setState({ invalidPin: false }), 500);
                                        }
                                    } else if (button === 'backspace') {
                                        this.setState({ lockPinInput: this.state.lockPinInput.slice(0, -1) });
                                    } else if (button === 'R') {
                                        if (!this.state.lockPinInput) {
                                            this.setState({ dialogPin: false });
                                        } else {
                                            this.setState({ lockPinInput: '' });
                                        }
                                    } else {
                                        const lockPinInput = this.state.lockPinInput + button;
                                        this.setState({ lockPinInput });
                                        if (pincodeReturnButton === 'backspace' && lockPinInput === pincode) {
                                            if (this.state.dialogPin === 'doorOpen-oid') {
                                                this.props.context.setValue(this.state.rxData['doorOpen-oid'], true);
                                            } else {
                                                this.props.context.setValue(this.state.rxData['lock-oid'], true);
                                            }
                                            this.setState({ dialogPin: false });
                                        }
                                    }
                                }}
                            >
                                {buttonTitle === 'R' ? (this.state.lockPinInput ? 'R' : 'x') : buttonTitle}
                            </Button>;
                        })
                    }
                </div>
            </DialogContent>
        </Dialog>;
    }

    lockGetPinCode() {
        return this.state.rxData['pincode-oid'] ?
            this.getPropertyValue('pincode-oid') :
            this.state.rxData.pincode;
    }

    lockRenderConfirmDialog() {
        if (!this.state.confirmDialog) {
            return null;
        }
        return <Dialog
            open={!0}
            onClose={() => this.setState({ confirmDialog: false })}
        >
            <DialogContent>
                {Generic.t('please_confirm')}
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        this.setState({ confirmDialog: false });
                        if (this.state.confirmDialog === 'doorOpen-oid') {
                            this.props.context.setValue(this.state.rxData['doorOpen-oid'], true);
                        } else {
                            this.props.context.setValue(this.state.rxData['lock-oid'], true);
                        }
                    }}
                    startIcon={this.state.confirmDialog === 'doorOpen-oid' ? <DoorOpenedIcon /> : <LockOpenedIcon />}
                >
                    {Generic.t('Open')}
                </Button>
                <Button
                    variant="contained"
                    color="grey"
                    autoFocus
                    onClick={() => this.setState({ confirmDialog: false })}
                    startIcon={<Cancel />}
                >
                    {Generic.t('Cancel')}
                </Button>
            </DialogActions>
        </Dialog>;
    }

    onCommand(command) {
        super.onCommand(command);
        if (command === 'openDialog') {
            this.setState({ dialog: true });
            return true;
        } else if (command === 'closeDialog') {
            this.setState({ dialog: false });
            return true;
        }
        return false;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);
        const doorOpened = this.state.rxData['doorSensor-oid'] && this.getPropertyValue('doorSensor-oid');
        const lockOpened = this.getPropertyValue('lock-oid');
        const working = this.state.rxData['lockWorking-oid'] && this.getPropertyValue('lockWorking-oid');

        const content = <div>
            {this.lockRenderUnlockDialog()}
            {this.lockRenderConfirmDialog()}
            {this.state.rxData['doorSensor-oid'] || this.state.rxData['doorOpen-oid'] ?
                <IconButton
                    disabled={!this.state.rxData['doorOpen-oid']}
                    title={this.state.rxData['doorOpen-oid'] ? Generic.t('open_door') : null}
                    onClick={() => {
                        if (this.lockGetPinCode()) {
                            this.setState({ dialogPin: 'doorOpen-oid', lockPinInput: '' });
                        } else if (this.state.rxData.doNotConfirm) {
                            this.props.context.setValue(this.state.rxData['doorOpen-oid'], true);
                        } else {
                            this.setState({ confirmDialog: 'doorOpen-oid' });
                        }
                    }}
                >
                    <DoorAnimation open={doorOpened} size={this.state.rxData.doorSize} />
                </IconButton> : null}
            {this.state.rxData['lock-oid'] ?
                <IconButton
                    title={lockOpened ? Generic.t('close_lock') : Generic.t('open_lock')}
                    onClick={() => {
                        if (!lockOpened && this.lockGetPinCode()) {
                            this.setState({ dialogPin: 'lock-oid', lockPinInput: '' });
                        } else if (lockOpened || this.state.rxData.doNotConfirm) {
                            this.props.context.setValue(this.state.rxData['lock-oid'], !this.getPropertyValue('lock-oid'));
                        } else {
                            this.setState({ confirmDialog: 'lock-oid' });
                        }
                    }}
                >
                    {working && working !== 3 /* 3 = UNDEFINED */ ? <CircularProgress className={this.props.classes.lockWorkingIcon} size={this.state.rxData.lockSize || 40} /> : null}
                    {this.state.rxData.noLockAnimation ? (lockOpened ?
                        <LockOpenedIcon
                            style={{ width: this.state.rxData.lockSize, height: this.state.rxData.lockSize }}
                            className={this.props.classes.lockSvgIcon}
                            sx={theme => ({ color: theme.palette.primary.main })}
                        /> :
                        <LockClosedIcon
                            style={{ width: this.state.rxData.lockSize, height: this.state.rxData.lockSize }}
                            className={this.props.classes.lockSvgIcon}
                        />) :
                        <LockAnimation
                            open={lockOpened}
                            size={this.state.rxData.lockSize}
                            color={this.state.rxData.lockColor}
                        />}
                </IconButton> : null}
        </div>;

        if (this.state.rxData.externalDialog && !this.props.editMode) {
            return <Dialog open={this.state.dialog} onClose={() => this.setState({ dialog: null })}>
                <DialogTitle>
                    {this.state.rxData.widgetTitle}
                    <IconButton style={{ float: 'right' }} onClick={() => this.setState({ dialog: null })}><Close /></IconButton>
                </DialogTitle>
                <DialogContent>{content}</DialogContent>
            </Dialog>;
        }

        if (this.state.rxData.noCard || props.widget.usedInWidget) {
            return content;
        }

        return this.wrapContent(content, null, {
            boxSizing: 'border-box',
            paddingBottom: 10,
            height: '100%',
        });
    }
}

export default withStyles(styles)(Lock);
