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
} from '@mui/icons-material';

import { Message as DialogMessage } from '@iobroker/adapter-react-v5';

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
    pinGrid:  {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridGap: '10px',
    },
    pinInput:  {
        padding: '10px 0px',
    },
    lockedButton: {
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    unlockedButtons: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-around',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    lockButton: {
        display: 'flex',
        gap: 8,
        alignItems: 'center',
    },
    icon: {
        height: 20,
    },
    status: {
        display: 'flex',
        alignItems: 'center',
    },
    noCardContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    noCardLocked: {
        width: '100%',
        textAlign: 'right',
    },
    workingIcon: {
        position: 'absolute',
        top: 10,
        left: 10,
    },
    svgIcon: {
        // width: '100%',
        // height: '100%',
    },
});

class Lock extends Generic {
    constructor(props) {
        super(props);
        this.state.objects = {};
        this.state.dialog = false;
        this.state.pinInput = '';
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
                                data[`pincode${field.index}`] = (data[`pincode${field.index}`] || '').replace(/[^0-9]/g, '');
                                changeData(data);
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

    renderUnlockDialog() {
        if (!this.state.dialog) {
            return null;
        }
        const pincode = this.getPincode();
        const pincodeReturnButton = this.state.rxData.pincodeReturnButton === 'backspace' ? 'backspace' : 'submit';

        return <Dialog open={!0} onClose={() => this.setState({ dialog: false })}>
            <DialogTitle>{Generic.t('enter_pin')}</DialogTitle>
            <DialogContent>
                <div className={this.props.classes.pinInput}>
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
                        value={this.state.invalidPin ? Generic.t('invalid_pin') : this.state.pinInput}
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
                                title={button === 'R' ?
                                    (this.state.pinInput ? Generic.t('reset') : Generic.t('close')) :
                                    (button === pincodeReturnButton ? 'enter' : '')}
                                onClick={() => {
                                    if (button === 'submit') {
                                        if (this.state.pinInput === pincode) {
                                            if (this.state.dialog === 'doorOpen-oid') {
                                                this.props.context.socket.setState(this.state.rxData['doorOpen-oid'], true);
                                            } else {
                                                this.props.context.socket.setState(this.state.rxData['lock-oid'], true);
                                            }
                                            this.setState({ dialog: false });
                                        } else {
                                            this.setState({ pinInput: '', invalidPin: true });
                                            setTimeout(() => this.setState({ invalidPin: false }), 500);
                                        }
                                    } else if (button === 'backspace') {
                                        this.setState({ pinInput: this.state.pinInput.slice(0, -1) });
                                    } else if (button === 'R') {
                                        if (!this.state.pinInput) {
                                            this.setState({ dialog: false });
                                        } else {
                                            this.setState({ pinInput: '' });
                                        }
                                    } else {
                                        const pinInput = this.state.pinInput + button;
                                        this.setState({ pinInput });
                                        if (pincodeReturnButton === 'backspace' && pinInput === pincode) {
                                            if (this.state.dialog === 'doorOpen-oid') {
                                                this.props.context.socket.setState(this.state.rxData['doorOpen-oid'], true);
                                            } else {
                                                this.props.context.socket.setState(this.state.rxData['lock-oid'], true);
                                            }
                                            this.setState({ dialog: false });
                                        }
                                    }
                                }}
                            >
                                {buttonTitle === 'R' ? (this.state.pinInput ? 'R' : 'x') : buttonTitle}
                            </Button>;
                        })
                    }
                </div>
            </DialogContent>
        </Dialog>;
    }

    getPincode() {
        return this.state.rxData['pincode-oid'] ?
            this.getPropertyValue('pincode-oid') :
            this.state.rxData.pincode;
    }

    renderMessageDialog() {
        return this.state.message ? <DialogMessage
            text={this.state.message}
            onClose={() => this.setState({ message: null })}
        /> : null;
    }

    renderConfirmDialog() {
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
                            this.props.context.socket.setState(this.state.rxData['doorOpen-oid'], true);
                        } else {
                            this.props.context.socket.setState(this.state.rxData['lock-oid'], true);
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

    renderWidgetBody(props) {
        super.renderWidgetBody(props);
        const doorOpened = this.state.rxData['doorSensor-oid'] && this.getPropertyValue('doorSensor-oid');
        const lockOpened = this.getPropertyValue('lock-oid');
        const working = this.state.rxData['lockWorking-oid'] && this.getPropertyValue('lockWorking-oid');

        const content = <div>
            {this.renderUnlockDialog()}
            {this.renderConfirmDialog()}
            {this.state.rxData['doorSensor-oid'] || this.state.rxData['doorOpen-oid'] ?
                <IconButton
                    disabled={!this.state.rxData['doorOpen-oid']}
                    title={this.state.rxData['doorOpen-oid'] ? Generic.t('open_door') : null}
                    onClick={() => {
                        if (this.getPincode()) {
                            this.setState({ dialog: 'doorOpen-oid', pinInput: '' });
                        } else if (this.state.rxData.doNotConfirm) {
                            this.props.context.socket.setState(this.state.rxData['doorOpen-oid'], true);
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
                        if (!lockOpened && this.getPincode()) {
                            this.setState({ dialog: 'lock-oid', pinInput: '' });
                        } else if (lockOpened || this.state.rxData.doNotConfirm) {
                            this.props.context.socket.setState(this.state.rxData['lock-oid'], !this.getPropertyValue('lock-oid'));
                        } else {
                            this.setState({ confirmDialog: 'lock-oid' });
                        }
                    }}
                >
                    {working ? <CircularProgress className={this.props.classes.workingIcon} size={this.state.rxData.lockSize || 40} /> : null}
                    {this.state.rxData.noLockAnimation ? (lockOpened ?
                        <LockOpenedIcon
                            style={{ width: this.state.rxData.lockSize, height: this.state.rxData.lockSize }}
                            className={this.props.classes.svgIcon}
                            sx={theme => ({ color: theme.palette.primary.main })}
                        /> :
                        <LockClosedIcon
                            style={{ width: this.state.rxData.lockSize, height: this.state.rxData.lockSize }}
                            className={this.props.classes.svgIcon}
                        />) :
                        <LockAnimation
                            open={lockOpened}
                            size={this.state.rxData.lockSize}
                            color={this.state.rxData.lockColor}
                        />}
                </IconButton> : null}
        </div>;

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
