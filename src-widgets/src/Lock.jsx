import React from 'react';
import { withStyles } from '@mui/styles';

import {
    Button, Chip, Dialog, DialogContent, DialogTitle, IconButton, TextField,
} from '@mui/material';
import { Icon, Message as DialogMessage } from '@iobroker/adapter-react-v5';
import {
    Backspace, Check, RemoveModerator as RemoveModeratorIcon, Security as SecurityIcon, SensorDoor,
    Lock as LockIcon,
} from '@mui/icons-material';
import Generic from './Generic';

const styles = () => ({
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
});

class Lock extends Generic {
    constructor(props) {
        super(props);
        this.state.objects = {};
        this.state.dialog = false;
        this.state.pinInput = '';
        this.state.invalidPin = false;
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
                        },
                        {
                            name: 'door-oid',
                            type: 'id',
                            label: 'door-oid',
                        },
                        {
                            name: 'doorOpen-oid',
                            type: 'id',
                            label: 'doorOpen-oid',
                        },
                        {
                            name: 'pincode',
                            label: 'pincode',
                            onChange: async (field, data, changeData /* , socket */) => {
                                data[`pincode${field.index}`] = (data[`pincode${field.index}`] || '').replace(/[^0-9]/g, '');
                                changeData(data);
                            },
                            hidden: (data, index) => !!data[`pincode-oid${index}`],
                        },
                        {
                            name: 'pincode-oid',
                            type: 'id',
                            label: 'pincode_oid',
                            hidden: (data, index) => !!data[`pincode${index}`],
                        },
                        {
                            name: 'pincodeReturnButton',
                            type: 'select',
                            options: ['submit', 'backspace'],
                            default: 'submit',
                            label: 'pincode_return_button',
                            hidden: (data, index) => !!data[`pincode-oid${index}`] && !!data[`pincode${index}`],
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

    async propertiesUpdate() {
    }

    async onRxDataChanged(/* prevRxData */) {
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
        lockedId = this.state.rxData['lock-oid'];
        pincode = this.getPincode();
        pincodeReturnButton = this.state.rxData.pincodeReturnButton === 'backspace' ? 'backspace' : 'submit';

        return <Dialog open={this.state.dialog} onClose={() => this.setState({ dialog: false })}>
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
                                            this.props.context.socket.setState(lockedId, false);
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
                                            this.props.context.socket.setState(lockedId, false);
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

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const content = <div>
            {this.renderUnlockDialog()}
            {this.state.rxData['door-oid'] || this.state.rxData['doorOpen-oid'] ?
                <IconButton onClick={() => {
                    this.props.context.socket.setState(this.state.rxData['doorOpen-oid'], !this.getPropertyValue('doorOpen-oid'));
                }}
                >
                    <SensorDoor sx={theme => ({
                        color: this.getPropertyValue('door-oid') ? theme.palette.primary.main : undefined,
                    })}
                    />
                </IconButton> : null}
            {this.state.rxData['lock-oid'] ?
                <IconButton onClick={() => {
                    if (this.getPropertyValue('lock-oid') && this.getPincode()) {
                        this.setState({ dialog: true, pinInput: '' });
                    } else {
                        this.props.context.socket.setState(this.state.rxData['lock-oid'], !this.getPropertyValue('lock-oid'));
                    }
                }}
                >
                    <LockIcon sx={theme => ({
                        color: this.getPropertyValue('lock-oid') ? theme.palette.primary.main : undefined,
                    })}
                    />
                </IconButton> : null}
        </div>;

        return this.wrapContent(content, null, {
            boxSizing: 'border-box',
            paddingBottom: 10,
            height: '100%',
        });
    }
}

export default withStyles(styles)(Lock);
