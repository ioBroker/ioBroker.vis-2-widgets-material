import { VisRxWidget } from '@iobroker/vis-2-widgets-react-dev';
import {
    Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { ChannelDetector } from 'iobroker.type-detector';
import Generic from './Generic';

const allObjects = async socket => {
    const states = await socket.getObjectView('', '\u9999', 'state');
    const channels = await socket.getObjectView('', '\u9999', 'channel');
    const devices = await socket.getObjectView('', '\u9999', 'device');
    const enums = await socket.getObjectView('', '\u9999', 'enum');

    return Object.values(states)
        .concat(Object.values(channels))
        .concat(Object.values(devices))
        .concat(Object.values(enums))
        .reduce((obj, item) => (
            obj[item._id] = item, obj), {});
};

const detectDevice = async socket => {
    const devicesObject = await allObjects(socket);
    const keys = Object.keys(devicesObject).sort();
    const detector = new ChannelDetector();

    const usedIds = [];
    const ignoreIndicators = ['UNREACH_STICKY'];    // Ignore indicators by name
    const excludedTypes = ['info'];
    const enums = [];
    const rooms = [];
    const list = [];
    keys.forEach(id => {
        if (devicesObject[id]?.type === 'enum') {
            enums.push(id);
        } else if (devicesObject[id]?.common?.smartName) {
            list.push(id);
        }
    });

    enums.forEach(id => {
        if (id.startsWith('enum.rooms.')) {
            rooms.push(id);
        }
        const members = devicesObject[id].common.members;
        console.log(id);
        if (members && members.length) {
            members.forEach(member => {
                if (devicesObject[member]) {
                    if (!list.includes(member)) {
                        list.push(member);
                    }
                }
            });
        }
    });

    const options = {
        objects: devicesObject,
        _keysOptional: keys,
        _usedIdsOptional: usedIds,
        ignoreIndicators,
        excludedTypes,
    };
    const result = [];
    console.log(rooms);
    rooms.forEach(roomId => {
        const room = devicesObject[roomId];
        const roomObject = {
            ...room,
            devices: [],
        };
        console.log(room.common.members);
        room.common.members.forEach(member => {
            const deviceObject = {
                ...devicesObject[member],
                states: [],
            };
            options.id = member;
            const controls = detector.detect(options);
            if (controls) {
                controls.forEach(control => {
                // console.log('control type', control.type);
                    if (control.states) {
                        control.states.forEach(state => {
                            if (state.id) {
                                deviceObject.states.push(devicesObject[state.id]);
                            }
                        });
                    }
                });
            }
            roomObject.devices.push(deviceObject);
        });
        result.push(roomObject);
    });

    return result;
};

const getNewWidgetIdNumber = project => {
    const widgets = [];
    Object.keys(project).forEach(view =>
        project[view].widgets && Object.keys(project[view].widgets).forEach(widget =>
            widgets.push(widget)));
    let newKey = 1;
    widgets.forEach(name => {
        const matches = name.match(/^w([0-9]+)$/);
        if (matches) {
            const num = parseInt(matches[1], 10);
            if (num >= newKey) {
                newKey = num + 1;
            }
        }
    });

    return newKey;
};

const WizardDialog = props => {
    const [states, setStates] = useState([]);
    const [checked, setChecked] = useState({});

    useEffect(() => {
        (async () => {
            const _states = await detectDevice(props.socket);
            console.log(_states);
            setStates(_states);
            const _checked = {};
            _states.forEach(room => {
                room.devices.forEach(device => {
                    device.states.forEach(state => {
                        _checked[state._id] = true;
                    });
                });
            });
            setChecked(_checked);
        })();
    }, [props.open]);
    return <Dialog
        open={props.open}
        onClose={props.onClose}
    >
        <DialogTitle>{Generic.t('Wizard')}</DialogTitle>
        <DialogContent>
            {
                states.map(room => <div key={room._id}>
                    <h2>{Generic.getText(room.common.name)}</h2>
                    {room.devices.map(device => <div key={device._id}>
                        <h4>{Generic.getText(device.common.name)}</h4>
                        {device.states.map(state => <div key={state._id}>
                            <Checkbox
                                checked={checked[state._id]}
                                onChange={e => {
                                    const _checked = JSON.parse(JSON.stringify(checked));
                                    _checked[state._id] = e.target.checked;
                                    setChecked(_checked);
                                }}
                            />
                            {Generic.getText(state.common.name)}
                        </div>)}
                    </div>)}
                </div>)
            }
        </DialogContent>
        <DialogActions>
            <Button
                onClick={() => {
                    const project = JSON.parse(JSON.stringify(props.project));
                    let newKey = getNewWidgetIdNumber(project);
                    states.forEach(room => {
                        project[room._id] = {
                            name: Generic.getText(room.common.name),
                            parentId: null,
                            settings: {
                                style: {},
                            },
                            widgets: {},
                            activeWidgets: {},
                            wizard: {
                                id: room._id,
                            },
                        };
                        room.devices.forEach(device => {
                            const newId = `w${newKey.toString().padStart(6, 0)}`;

                            const widget = {
                                tpl: 'tplMaterial2Switches',
                                data: {
                                    widgetTitle: Generic.getText(device.common.name),
                                    count: 0,
                                    g_common: true,
                                    type: 'lines',
                                    allSwitch: false,
                                    buttonsWidth: 120,
                                    buttonsHeight: 80,
                                },
                                style: {
                                    left: '0px',
                                    top: '0px',
                                    width: '100%',
                                    height: 120,
                                    position: 'relative',
                                },
                                wizard: {
                                    id: device._id,
                                },
                            };
                            device.states.forEach(state => {
                                if (checked[state._id]) {
                                    widget.data.count++;
                                    widget.data[`oid${widget.data.count}`] = state._id;
                                    widget.data[`type${widget.data.count}`] = 'auto';
                                    widget.data[`g_switch-${widget.data.count}`] = true;
                                }
                            });
                            widget.style.height = widget.data.count * 40 + 90;
                            project[room._id].widgets[newId] = widget;
                            newKey++;
                        });
                    });
                    props.changeProject(project);
                    props.onClose();
                }}
            >
                {Generic.t('Add views')}
            </Button>
        </DialogActions>
    </Dialog>;
};

const WizardButton = props => {
    const [open, setOpen] = useState(false);
    const [states, setStates] = useState([]);

    return <>
        <Button
            onClick={() => setOpen(true)}
            variant="contained"
        >
            {Generic.t('Wizard')}
        </Button>
        <WizardDialog
            open={open}
            onClose={() => setOpen(false)}
            {...props}
        />
    </>;
};

class Wizard extends (window.visRxWidget || VisRxWidget) {
    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Wizard',
            visSet: 'vis-2-widgets-material',
            visName: 'Wizard',
            visWidgetLabel: 'wizard',
            visPrev: 'widgets/vis-2-widgets-material/img/prev_wizard.png',
            visOrder: 100,
            custom: true,
            customPalette: (socket, project, changeProject, view) => <WizardButton
                socket={socket}
                project={project}
                changeProject={changeProject}
                view={view}
            />,
        };
    }
}

export default Wizard;
