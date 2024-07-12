import React from 'react';

import {
    Button, Chip, Dialog, DialogContent, DialogTitle, TextField,
} from '@mui/material';
import { Icon, Message as DialogMessage } from '@iobroker/adapter-react-v5';
import {
    Backspace, Check, RemoveModerator as RemoveModeratorIcon, Security as SecurityIcon,
} from '@mui/icons-material';
import Generic from './Generic';

const styles = {
    pinGrid:  {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridGap: '10px',
    },
    pinInput:  {
        padding: '10px 0px',
    },
    timerDialog: {
        textAlign: 'center',
    },
    timerSeconds:  {
        fontSize: '200%',
        padding: 40,
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
};

class Security extends Generic {
    constructor(props) {
        super(props);
        this.state.objects = {};
        this.state.dialog = false;
        this.state.timerDialog = false;
        this.state.pinInput = '';
        this.state.invalidPin = false;
        this.state.timerI = null;
        this.state.timerSeconds = 0;
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Security',
            visSet: 'vis-2-widgets-material',
            visName: 'Security',
            visWidgetLabel: 'security',
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
                            name: 'disarmText',
                            label: 'disarm_text',
                        },
                        {
                            name: 'securityOffText',
                            label: 'security_off_text',
                        },
                        {
                            name: 'buttonsCount',
                            label: 'buttons_count',
                            type: 'number',
                            default: 1,
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
                            label: 'oid',
                            onChange: async (field, data, changeData, socket) => {
                                if (data[field.name]) {
                                    const object = await socket.getObject(data[field.name]);
                                    let changed = false;
                                    if (object && object.common) {
                                        if (object.common.color && data[`color${field.index}`] !== object.common.color) {
                                            data[`color${field.index}`] = object.common.color;
                                            changed = true;
                                        }
                                        if (object.common.name) {
                                            const name = object.common.name && typeof object.common.name === 'object' ? object.common.name[this.getLanguage()] : object.common.name;
                                            if (data[`name${field.index}`] !== name) {
                                                data[`name${field.index}`] = name;
                                                changed = true;
                                            }
                                        }
                                        changed && changeData(data);
                                    }
                                }
                            },
                        },
                        {
                            name: 'name',
                            label: 'name',
                            default: Generic.t('default_button_name'),
                        },
                        {
                            name: 'color',
                            type: 'color',
                            label: 'color',
                        },
                        {
                            name: 'icon',
                            type: 'image',
                            label: 'icon',
                        },
                        {
                            name: 'iconSmall',
                            type: 'icon64',
                            label: 'small_icon',
                            hidden: '!!data.icon',
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
                        {
                            name: 'timerSeconds',
                            type: 'number',
                            label: 'timer_seconds',
                        },
                        {
                            name: 'timerSeconds-oid',
                            type: 'id',
                            label: 'timer_seconds_oid',
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
        const ids = [];
        for (let index = 1; index <= this.state.rxData.count; index++) {
            if (this.state.rxData[`oid${index}`] && this.state.rxData[`oid${index}`] !== 'nothing_selected') {
                ids.push(this.state.rxData[`oid${index}`]);
            }
        }
        const _objects = ids.length ? (await this.props.context.socket.getObjectsById(ids)) : {};

        // try to find icons for all OIDs
        for (let index = 1; index <= this.state.rxData.buttonsCount; index++) {
            const object = _objects[this.state.rxData[`oid${index}`]];
            // read object itself
            if (!object) {
                objects[index] = { common: {}, _id: this.state.rxData[`oid${index}`] };
                continue;
            }
            object.common = object.common || {};
            object.isChart = !!(object.common.custom && object.common.custom[this.props.context.systemConfig?.common?.defaultHistory]);
            if (!this.state.rxData[`icon${index}`] && !object.common.icon && (object.type === 'state' || object.type === 'channel')) {
                const idArray = this.state.rxData[`oid${index}`].split('.');

                // read channel
                const parentObject = await this.props.context.socket.getObject(idArray.slice(0, -1).join('.'));
                if (!parentObject?.common?.icon && (object.type === 'state' || object.type === 'channel')) {
                    const grandParentObject = await this.props.context.socket.getObject(idArray.slice(0, -2).join('.'));
                    if (grandParentObject?.common?.icon) {
                        object.common.icon = grandParentObject.common.icon;
                        if (grandParentObject.type === 'instance' || grandParentObject.type === 'adapter') {
                            object.common.icon = `../${grandParentObject.common.name}.admin/${object.common.icon}`;
                        }
                    }
                } else {
                    object.common.icon = parentObject.common.icon;
                    if (parentObject.type === 'instance' || parentObject.type === 'adapter') {
                        object.common.icon = `../${parentObject.common.name}.admin/${object.common.icon}`;
                    }
                }
            }
            objects[index] = { common: object.common, _id: object._id };
        }

        if (JSON.stringify(objects) !== JSON.stringify(this.state.objects)) {
            this.setState({ objects });
        }
    }

    async onRxDataChanged(/* prevRxData */) {
        await this.propertiesUpdate();
    }

    async componentDidMount() {
        super.componentDidMount();
        this.propertiesUpdate();
    }

    componentWillUnmount() {
        this.timerInterval && clearInterval(this.timerInterval);
        this.timerInterval = null;
        super.componentWillUnmount();
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

        return <Dialog open={!!this.state.dialog} onClose={() => this.setState({ dialog: false })}>
            <DialogTitle>{Generic.t('enter_pin')}</DialogTitle>
            <DialogContent>
                <div style={styles.pinInput}>
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
                <div style={styles.pinGrid}>
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
                                            this.props.context.setValue(lockedId, false);
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
                                            this.props.context.setValue(lockedId, false);
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

    renderTimerDialog() {
        const onClose = () => {
            this.setState({ timerDialog: false });
            if (this.state.rxData.timerSecondsOid) {
                this.props.context.setValue(this.state.rxData.timerSecondsOid, -1);
            }
            clearInterval(this.timerInterval);
        };
        return <Dialog
            open={this.state.timerDialog}
            onClose={onClose}
            style={styles.timerDialog}
        >
            <DialogTitle>{Generic.t('lock_after', this.state.timerSeconds)}</DialogTitle>
            <DialogContent>
                <div style={styles.timerSeconds}>
                    {this.state.timerSeconds}
                </div>
                <div>
                    <Button onClick={onClose} variant="contained">{Generic.t('lock_cancel')}</Button>
                </div>
            </DialogContent>
        </Dialog>;
    }

    startTimer(i) {
        const timerSeconds = this.state.rxData[`timerSeconds${i}`];
        this.setState({ timerSeconds, timerDialog: true });
        if (this.state.rxData[`timerSeconds-oid${i}`]) {
            this.props.context.setValue(this.state.rxData[`timerSeconds-oid${i}`], timerSeconds);
        }
        this.timerInterval = setInterval(() => {
            const _timerSeconds = this.state.timerSeconds - 1;
            this.setState({ timerSeconds: _timerSeconds });
            if (!_timerSeconds) {
                if (!this.state.rxData[`oid${i}`]) {
                    this.setState({ message: Generic.t('no_oid') });
                } else {
                    this.props.context.setValue(this.state.rxData[`oid${i}`], true);
                }
                if (this.state.rxData[`timerSeconds-oid${i}`]) {
                    this.props.context.setValue(this.state.rxData[`timerSeconds-oid${i}`], 0);
                }
                this.timerInterval && clearInterval(this.timerInterval);
                this.setState({ timerDialog: false });
            }
        }, 1000);
    }

    getPincode(i) {
        return this.state.rxData[`pincode-oid${i}`] ?
            this.getPropertyValue(`pincode-oid${i}`) :
            this.state.rxData[`pincode${i}`];
    }

    renderMessageDialog() {
        return this.state.message ? <DialogMessage
            text={this.state.message}
            onClose={() => this.setState({ message: null })}
        /> : null;
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
                icon: this.state.rxData[`icon${i}`] || this.state.rxData[`iconSmall${i}`] || this.state.objects[i]?.common?.icon,
            });
            if (this.getPropertyValue(`oid${i}`)) {
                locked = true;
                lockedButton = buttons[buttons.length - 1];
            }
        }

        const content = <>
            {this.renderUnlockDialog()}
            {this.renderTimerDialog()}
            {this.renderMessageDialog()}
            {locked ?
                <div style={styles.lockedButton}>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (this.getPincode(lockedButton.i)) {
                                this.setState({ dialog: true, pinInput: '' });
                            } else {
                                this.props.context.setValue(lockedButton.oid, false);
                            }
                        }}
                    >
                        {this.state.rxData.disarmText || Generic.t('unlock')}
                    </Button>
                </div>
                :
                <div style={styles.unlockedButtons}>
                    {buttons.map((button, index) =>
                        <Button
                            variant="contained"
                            key={index}
                            style={{ backgroundColor: button.color }}
                            onClick={() => {
                                if (this.state.rxData[`timerSeconds${button.i}`]) {
                                    this.startTimer(button.i);
                                } else if (!button.oid) {
                                    this.setState({ message: Generic.t('no_oid') });
                                } else {
                                    this.props.context.setValue(button.oid, true);
                                }
                            }}
                        >
                            <span style={styles.lockButton}>
                                {button.icon ? <Icon style={styles.icon} src={button.icon} alt="" /> : null}
                                {button.name}
                            </span>
                        </Button>)}
                </div>}
        </>;

        const lockedChip = <Chip
            label={<span style={styles.status}>
                {locked ?
                    <>
                        <SecurityIcon />
                        {lockedButton.name}
                    </>
                    :
                    <>
                        <RemoveModeratorIcon />
                        {this.state.rxData.securityOffText || Generic.t('security_off')}
                    </>}
            </span>}
            style={{
                backgroundColor: locked ? 'orange' : 'green',
                color: locked ? 'black' : 'white',
            }}
        />;

        if (this.state.rxData.noCard || props.widget.usedInWidget) {
            return <div style={styles.noCardContainer}>
                <div style={styles.noCardLocked}>{lockedChip}</div>
                {content}
            </div>;
        }

        return this.wrapContent(content, lockedChip, {
            boxSizing: 'border-box',
            paddingBottom: 10,
            height: '100%',
        });
    }
}

export default Security;
