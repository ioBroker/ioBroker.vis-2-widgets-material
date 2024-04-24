import { useEffect, useState } from 'react';
import { VisRxWidget } from '@iobroker/vis-2-widgets-react-dev';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    LinearProgress,
    Switch,
    TextField,
} from '@mui/material';
import {
    Add, Close, ExpandMore, Lightbulb,
    QuestionMark,
} from '@mui/icons-material';

import { Icon } from '@iobroker/adapter-react-v5';

import Generic from './Generic';
import { getDeviceWidget, getDeviceWidgetOnePage } from './deviceWidget';

const WizardDialog = props => {
    const [rooms, setRooms] = useState(null);
    const [devicesChecked, setDevicesChecked] = useState({});
    const [roomsChecked, setRoomsChecked] = useState({});
    const [onePage, setOnePage] = useState(window.localStorage.getItem('AppWizard.onePage') !== 'false');
    const [standardIcons, setStandardIcons] = useState(window.localStorage.getItem('AppWizard.standardIcons') === 'true');

    useEffect(() => {
        (async () => {
            let _rooms = (await props.helpers?.detectDevices(props.socket)) || [];
            // ignore buttons
            _rooms.forEach(room => {
                room.devices = room.devices.filter(device => device.common.role !== 'button');
            });
            // ignore empty rooms
            _rooms = _rooms.filter(room => room.devices.length);

            // Fix names
            _rooms.forEach(room => {
                room.devices.forEach(device => {
                    // Device.Name.Room => Device Name Room
                    device.common.name = (Generic.getText(device.common.name) || '').replace(/\./g, ' ').trim();
                    // delete room name from device name
                    if (device.roomName) {
                        device.common.name = device.common.name.replace(Generic.getText(device.roomName), '').trim();
                    }
                });
            });

            setRooms(_rooms);
            const _checked = {};
            const _devicesChecked = {};
            const _roomsChecked = {};
            _rooms.forEach(room => {
                _roomsChecked[room._id] = true;
                room.devices.forEach(device => {
                    _devicesChecked[device._id] = true;
                    device.states.forEach(state => _checked[state._id] = true);
                });
            });
            setDevicesChecked(_devicesChecked);
            setRoomsChecked(_roomsChecked);
        })();
    }, [props.helpers, props.open, props.socket]);

    const handleSubmit = () => {
        const project = JSON.parse(JSON.stringify(props.project));
        let newKey = props.helpers?.getNewWidgetIdNumber(project) || 1000;
        let changed = false;
        rooms.forEach(room => {
            if (!roomsChecked[room._id] ||
                !room.devices.length ||
                !room.devices.find(device => devicesChecked[device._id])
            ) {
                return;
            }
            let viewId = Generic.getText(room.common.name);
            let roomWidget;
            if (onePage) {
                roomWidget = Object.values(project[props.selectedView].widgets)
                    .find(_widget => _widget.data.wizardId === room._id);

                roomWidget = roomWidget || {
                    tpl: 'tplMaterial2Switches',
                    data: {
                        name: Generic.getText(room.common.name),
                        widgetTitle: Generic.getText(room.common.name),
                        count: 0,
                        g_common: true,
                        type: 'lines',
                        allSwitch: false,
                        wizardId: room._id,
                    },
                    style: {
                        left: '0px',
                        top: '0px',
                        width: '100%',
                        position: 'relative',
                    },
                };
                viewId = props.selectedView;

                room.devices.forEach(device => {
                    if (!devicesChecked[device._id]) {
                        return;
                    }
                    const widgetId = `w${newKey.toString().padStart(6, '0')}`;
                    changed = true;
                    if (getDeviceWidgetOnePage(device, widgetId, roomWidget, project[viewId], standardIcons)) {
                        newKey++;
                    }
                });

                // try to find existing widget
                const projectRoomWidget = Object.keys(project[props.selectedView].widgets)
                    .find(_widget => roomWidget === project[props.selectedView].widgets[_widget]);

                // if not found => add new widget
                if (!projectRoomWidget) {
                    const roomWidgetId = `w${newKey.toString().padStart(6, '0')}`;
                    project[props.selectedView].widgets[roomWidgetId] = roomWidget;
                    newKey++;
                }
            } else {
                // try to find existing view
                const projectView = Object.keys(project).find(view => project[view].settings?.wizardId === room._id);
                if (projectView) {
                    viewId = projectView;
                } else if (project[viewId]) {
                    project[viewId].settings.wizardId = room._id;
                } else {
                    // create a new view
                    project[viewId] = {
                        name: Generic.getText(room.common.name),
                        parentId: null,
                        settings: {
                            style: {},
                            wizardId: room._id,
                        },
                        widgets: {},
                        activeWidgets: {},
                    };
                    if (room.common.icon?.startWith('data:image')) {
                        project[viewId].settings.navigationIcon = room.common.icon;
                    }

                    // add new view to opened views
                    if (project.___settings.openedViews && !project.___settings.openedViews.includes(viewId)) {
                        project.___settings.openedViews.push(viewId);
                    }
                }

                // create widgets for every room
                room.devices.forEach(device => {
                    if (!devicesChecked[device._id]) {
                        return;
                    }

                    const projectWidget = Object.keys(project[viewId].widgets)
                        .find(_widget => project[viewId].widgets && project[viewId].widgets[_widget].data?.wizardId === device._id);

                    if (!projectWidget) {
                        changed = true;
                        const widget = getDeviceWidget(device, standardIcons);
                        if (widget) {
                            const widgetId = `w${newKey.toString().padStart(6, '0')}`;
                            project[viewId].widgets[widgetId] = widget;
                            newKey++;
                        } else {
                            console.warn(`Cannot find widget for ${device._id} (${device.common.name})`);
                        }
                    } else {
                        // merge ??
                    }
                });
            }
        });

        changed && props.changeProject(project);
        props.onClose();
    };

    const allChecked = rooms?.every(room => roomsChecked[room._id]);
    const anyChecked = rooms?.some(room => roomsChecked[room._id]);
    const counters = rooms?.map(room => room.devices.reduce((a, b) => a + (devicesChecked[b._id] ? 1 : 0), 0));

    return <Dialog
        key="materialWizardDialog"
        open={!0}
        onClose={props.onClose}
        fullWidth
        PaperProps={{
            style: {
                maxHeight: 'calc(100% - 80px)',
                height: 'calc(100% - 80px)',
            },
        }}
    >
        <DialogTitle>{Generic.t('Wizard')}</DialogTitle>
        <DialogContent style={{ height: '100%', overflowY: 'hidden' }}>
            {rooms ? <div style={{ height: '100%', overflowY: 'hidden' }}>
                <div>
                    {Generic.t('Multiple views')}
                    <Switch
                        checked={onePage}
                        onChange={e => {
                            window.localStorage.setItem('AppWizard.onePage', e.target.checked ? 'true' : 'false');
                            setOnePage(e.target.checked);
                        }}
                    />
                    {Generic.t('One view')}
                </div>
                <div>
                    {Generic.t('Custom icons')}
                    <img
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAyCAMAAAAUcxnlAAADAFBMVEUCAgKGhoY/Pz/X19cfHx9jY2OoqKju7u4QEBDh4eF0dHQxMTG/v78ICAienp5JSUnf399ra2u3t7cXFxfp6el8fHw5OTkDAwNBQUHZ2dkpKSmurq7+/v4SEhLn5+d6eno3NzfBwcEKCgqmpqZycnJycnIeHh4AAACurq4cHBxOTk5FRUUAAAANDQ0cHBwAAABJSUlISEgUFBQAAAAyMjKCgoJGRkYhISGWlpY4ODhGRkYhISHV1dXCwsKpqamYmJhHR0eFhYVMTEwhISFCQkJeXl5UVFQhISElJSUqKioYGBgAAAAeHh4iIiIwMDACAgJMTExwcHB/f39FRUWDg4NTU1MeHh4AAABkZGRycnJoaGhFRUXj4+PKysqpqamYmJgdHR1fX19vb28AAAArKyvOzs5YWFhFRUUWFhZTU1Ofn59HR0cICAgNDQ0EBAQAAAC1tbWYmJhTU1NFRUUUFBQAAAAAAAAAAABYWFhwcHAlJSULCwsuLi6EhIQ/Pz8hISEnJydmZmYaGhoAAAAuLi7IyMg1NTUhISEiIiIoKChAQEAhISGVlZXLy8tXV1dJSUk4ODhUVFRRUVEhISG9vb3b29syMjIhISEaGhqlpaVgYGBFRUVbW1tRUVFjY2NUVFSnp6e/v7+0tLSnp6c7Ozuenp53d3djY2O8vLzAwMCGhoZ7e3sICAgXFxeFhYULCwsQEBAWFhZ3d3cAAAAAAAArKytBQUELCwsLCws1NTUqKiohISFra2uAgIBTU1MhISEAAAAfHx+YmJgiIiIaGhq4uLgPDw8AAAAlJSUlJSVcXFwlJSUkJCQuLi5lZWUXFxc2NjY/Pz8rKysAAAA8PDwzMzM4ODg5OTlcXFxaWlo7Ozs/Pz9ISEhNTU1LS0tFRUU4ODhDQ0NNTU1GRkZ9fX2ZmZl7e3t/f38+Pj5fX19AQEA5OTlJSUlCQkJAQEA6OjpOTk5HR0c1NTUlJSUpKSk7OzsnJyckJCQ7OzsxMTEfHx8kJCRKSkpJSUkLCwtFRUVwJku+AAAACXBIWXMAAFxGAABcRgEUlENBAAAAvklEQVR42u2Vyw6CMBBFrxDDiBmVRylCA4j+/zfKqqBOKS5M1HCn6erkJF3MLcxbwc/jpzjxjFKpxZss9OWCwOIa/qSFxVHUh9lcFaJuxGPfE3fI9yN+8+Hhgz3x4ecXO4jFECLJTi7zMZLsbIi0Zg2e3j1MkEt2LftLUzaynSW8c9od+Gpf7audXcvnslcEzU+Hh9UW7e7iEO1MQ1MI00Psmc91ZLugsCf2ahO3c6O2yGqLZ0s+mz/5tb8EvwNPZ9YpjSwIDgAAAABJRU5ErkJggg=="
                        style={{ width: 24, height: 24, marginLeft: 8 }}
                        alt="icon"
                    />
                    <Switch
                        checked={standardIcons}
                        onChange={e => {
                            window.localStorage.setItem('AppWizard.standardIcons', e.target.checked ? 'true' : 'false');
                            setStandardIcons(e.target.checked);
                        }}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" style={{ marginRight: 8 }}>
                        <path fill="currentColor" d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
                    </svg>
                    {Generic.t('Standrad icons')}
                </div>
                <div style={{ marginLeft: 26 }}>
                    <FormControlLabel
                        control={<Checkbox
                            indeterminate={!allChecked && anyChecked}
                            checked={allChecked}
                            onChange={() => {
                                const _roomsChecked = JSON.parse(JSON.stringify(roomsChecked));
                                rooms.forEach(room => _roomsChecked[room._id] = !allChecked);
                                setRoomsChecked(_roomsChecked);
                            }}
                        />}
                        label={allChecked ? Generic.t('Unselect all rooms') : Generic.t('Select all rooms')}
                    />
                </div>
                <div style={{ height: 'calc(100% - 120px)', overflowY: 'auto' }}>
                    {!rooms.length ? <div>{Generic.t('Nothing detected')}</div> : null}
                    {rooms.map((room, roomId) => <div key={room._id}>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <Checkbox
                                        checked={roomsChecked[room._id]}
                                        onChange={e => {
                                            const _roomsChecked = JSON.parse(JSON.stringify(roomsChecked));
                                            _roomsChecked[room._id] = e.target.checked;
                                            setRoomsChecked(_roomsChecked);
                                        }}
                                        onClick={e => e.stopPropagation()}
                                    />

                                    {room.common.icon ? (room.common.icon === '?' ?
                                        <QuestionMark style={{ width: 24, height: 24 }} />
                                        :
                                        <Icon src={room.common.icon} style={{ width: 24, height: 24, marginRight: 8 }} alt="" />) : null}

                                    <div style={{ flexGrow: 1 }}>{Generic.getText(room.common.name)}</div>

                                    <Checkbox
                                        title={Generic.t('Select/Unselect all devices in room')}
                                        indeterminate={counters[roomId] !== room.devices.length && counters[roomId]}
                                        checked={counters[roomId] === room.devices.length}
                                        disabled={!roomsChecked[room._id]}
                                        onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            const _devicesChecked = JSON.parse(JSON.stringify(devicesChecked));
                                            if (counters[roomId] === room.devices.length) {
                                                room.devices.forEach(device => {
                                                    _devicesChecked[device._id] = false;
                                                });
                                            } else {
                                                room.devices.forEach(device => {
                                                    _devicesChecked[device._id] = true;
                                                });
                                            }
                                            setDevicesChecked(_devicesChecked);
                                        }}
                                    />
                                    <div
                                        style={{
                                            fontSize: 12,
                                            opacity: 0.7,
                                            marginLeft: 20,
                                            minWidth: 200,
                                        }}
                                    >
                                        {Generic.t('%s of %s devices selected', counters[roomId], room.devices.length)}
                                    </div>
                                </div>
                            </AccordionSummary>
                            <AccordionDetails sx={{ backgroundColor: props.themeType === 'dark' ? '#111' : '#eee' }}>
                                {room.devices.map((device, deviceId) => <div key={device._id} style={{ backgroundColor: 'transparent' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginLeft: 20,
                                            marginBottom: 20,
                                            opacity: roomsChecked[room._id] ? 1 : 0.5,
                                        }}
                                    >
                                        <Checkbox
                                            checked={devicesChecked[device._id]}
                                            onChange={e => {
                                                const _devicesChecked = JSON.parse(JSON.stringify(devicesChecked));
                                                _devicesChecked[device._id] = e.target.checked;
                                                setDevicesChecked(_devicesChecked);
                                            }}
                                            onClick={e => e.stopPropagation()}
                                        />
                                        <span style={{ marginRight: 8 }}>
                                            {!standardIcons && device.common.icon ? (device.common.icon === '?' ?
                                                <QuestionMark style={{ width: 24, height: 24 }} />
                                                :
                                                <Icon src={device.common.icon} style={{ width: 24, height: 24 }} alt="" />)
                                                :
                                                (props.helpers?.deviceIcons[device.deviceType] || <Lightbulb />)}
                                        </span>
                                        <TextField
                                            variant="standard"
                                            fullWidth
                                            label={device._id}
                                            helperText={<span style={{ fontStyle: 'italic' }}>
                                                {`${Generic.t('Device type')}: ${Generic.t(device.deviceType).replace('vis_2_widgets_material_', '')}`}
                                            </span>}
                                            value={device.common.name}
                                            onChange={e => {
                                                const _rooms = JSON.parse(JSON.stringify(rooms));
                                                _rooms[roomId].devices[deviceId].common.name = e.target.value;
                                                setRooms(_rooms);
                                            }}
                                        />
                                    </div>
                                </div>)}
                            </AccordionDetails>
                        </Accordion>
                    </div>)}
                </div>
            </div> : <LinearProgress />}
        </DialogContent>
        <DialogActions>
            <Button
                variant="contained"
                disabled={!rooms?.length || !Object.values(roomsChecked).find(val => val)}
                onClick={handleSubmit}
                startIcon={<Add />}
            >
                {Generic.t('Add widgets')}
            </Button>
            <Button
                variant="contained"
                onClick={() => props.onClose()}
                startIcon={<Close />}
                color="grey"
            >
                {Generic.t('Cancel')}
            </Button>
        </DialogActions>
    </Dialog>;
};

const WizardIcon = () => <svg
    stroke="currentColor"
    fill="none"
    strokeWidth="0"
    viewBox="0 0 15 15"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
>
    <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.9 0.499976C13.9 0.279062 13.7209 0.0999756 13.5 0.0999756C13.2791 0.0999756 13.1 0.279062 13.1 0.499976V1.09998H12.5C12.2791 1.09998 12.1 1.27906 12.1 1.49998C12.1 1.72089 12.2791 1.89998 12.5 1.89998H13.1V2.49998C13.1 2.72089 13.2791 2.89998 13.5 2.89998C13.7209 2.89998 13.9 2.72089 13.9 2.49998V1.89998H14.5C14.7209 1.89998 14.9 1.72089 14.9 1.49998C14.9 1.27906 14.7209 1.09998 14.5 1.09998H13.9V0.499976ZM11.8536 3.14642C12.0488 3.34168 12.0488 3.65826 11.8536 3.85353L10.8536 4.85353C10.6583 5.04879 10.3417 5.04879 10.1465 4.85353C9.9512 4.65827 9.9512 4.34169 10.1465 4.14642L11.1464 3.14643C11.3417 2.95116 11.6583 2.95116 11.8536 3.14642ZM9.85357 5.14642C10.0488 5.34168 10.0488 5.65827 9.85357 5.85353L2.85355 12.8535C2.65829 13.0488 2.34171 13.0488 2.14645 12.8535C1.95118 12.6583 1.95118 12.3417 2.14645 12.1464L9.14646 5.14642C9.34172 4.95116 9.65831 4.95116 9.85357 5.14642ZM13.5 5.09998C13.7209 5.09998 13.9 5.27906 13.9 5.49998V6.09998H14.5C14.7209 6.09998 14.9 6.27906 14.9 6.49998C14.9 6.72089 14.7209 6.89998 14.5 6.89998H13.9V7.49998C13.9 7.72089 13.7209 7.89998 13.5 7.89998C13.2791 7.89998 13.1 7.72089 13.1 7.49998V6.89998H12.5C12.2791 6.89998 12.1 6.72089 12.1 6.49998C12.1 6.27906 12.2791 6.09998 12.5 6.09998H13.1V5.49998C13.1 5.27906 13.2791 5.09998 13.5 5.09998ZM8.90002 0.499976C8.90002 0.279062 8.72093 0.0999756 8.50002 0.0999756C8.2791 0.0999756 8.10002 0.279062 8.10002 0.499976V1.09998H7.50002C7.2791 1.09998 7.10002 1.27906 7.10002 1.49998C7.10002 1.72089 7.2791 1.89998 7.50002 1.89998H8.10002V2.49998C8.10002 2.72089 8.2791 2.89998 8.50002 2.89998C8.72093 2.89998 8.90002 2.72089 8.90002 2.49998V1.89998H9.50002C9.72093 1.89998 9.90002 1.72089 9.90002 1.49998C9.90002 1.27906 9.72093 1.09998 9.50002 1.09998H8.90002V0.499976Z"
        fill="currentColor"
    />
</svg>;

const WizardButton = props => {
    const [open, setOpen] = useState(false);

    return [
        <Button
            key="materialWizardButton"
            onClick={() => setOpen(true)}
            variant="contained"
            startIcon={<WizardIcon />}
        >
            {Generic.t('Wizard')}
        </Button>,
        open ? <WizardDialog
            key="materialWizardDialog"
            onClose={() => setOpen(false)}
            {...props}
        /> : null,
    ];
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
            customPalette: props => <WizardButton key="wizard" {...props} />,
        };
    }
}

export default Wizard;
