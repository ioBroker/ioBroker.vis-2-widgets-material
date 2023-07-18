import { useEffect, useState } from 'react';
import { VisRxWidget } from '@iobroker/vis-2-widgets-react-dev';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Switch, TextField,
} from '@mui/material';
import {
    Add, Close, ExpandMore, Lightbulb,
} from '@mui/icons-material';

import { Icon } from '@iobroker/adapter-react-v5';

import Generic from './Generic';
import { getDeviceWidget, getDeviceWidgetOnePage } from './deviceWidget';

const WizardDialog = props => {
    const [rooms, setRooms] = useState(null);
    const [devicesChecked, setDevicesChecked] = useState({});
    const [roomsChecked, setRoomsChecked] = useState({});
    const [onePage, setOnePage] = useState(window.localStorage.getItem('AppWizard.onePage') !== 'false');

    useEffect(() => {
        (async () => {
            const _rooms = (await props.helpers?.detectDevices(props.socket)) || [];
            setRooms(_rooms);
            const _checked = {};
            const _devicesChecked = {};
            const _roomsChecked = {};
            _rooms.forEach(room => {
                _roomsChecked[room._id] = true;
                room.devices.forEach(device => {
                    _devicesChecked[device._id] = true;
                    device.states.forEach(state => {
                        _checked[state._id] = true;
                    });
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
            if (!roomsChecked[room._id]) {
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
                    if (getDeviceWidgetOnePage(device, widgetId, roomWidget, project[viewId])) {
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
                    // create new view
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
                        const widget = getDeviceWidget(device);
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

    return <Dialog
        key="materialWizardDialog"
        open={!0}
        onClose={props.onClose}
        fullWidth
    >
        <DialogTitle>{Generic.t('Wizard')}</DialogTitle>
        <DialogContent>
            {rooms ? <>
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
                <div style={{ height: 'calc(100% - 100px)' }}>
                    {!rooms.length ? <div>{Generic.t('Nothing detected')}</div> : null}
                    {rooms.map((room, roomId) => <div key={room._id}>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Checkbox
                                        checked={roomsChecked[room._id]}
                                        onChange={e => {
                                            const _roomsChecked = JSON.parse(JSON.stringify(roomsChecked));
                                            _roomsChecked[room._id] = e.target.checked;
                                            setRoomsChecked(_roomsChecked);
                                        }}
                                        onClick={e => e.stopPropagation()}
                                    />
                                    {room.common.icon ? <Icon src={room.common.icon} style={{ width: 24, height: 24, marginRight: 8 }} alt="" /> : null}
                                    <div>{Generic.getText(room.common.name)}</div>
                                    <div style={{ fontSize: 12, opacity: 0.7, marginLeft: 20 }}>{Generic.t('%s devices', room.devices.length)}</div>
                                </div>
                            </AccordionSummary>
                            <AccordionDetails
                                sx={{
                                    backgroundColor: props.themeType ? '#111' : '#eee',
                                }}
                            >
                                {roomsChecked[room._id] ? room.devices.map((device, deviceId) => <div key={device._id} style={{ backgroundColor: 'transparent' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginLeft: 20,
                                            marginBottom: 20,
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
                                            {device.common.icon ?
                                                <Icon src={device.common.icon} style={{ width: 24, height: 24 }} alt="" />
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
                                            value={Generic.getText(device.common.name)}
                                            onChange={e => {
                                                const _states = JSON.parse(JSON.stringify(rooms));
                                                _states[roomId].devices[deviceId].common.name = e.target.value;
                                                setRooms(_states);
                                            }}
                                        />
                                    </div>
                                </div>) : null}
                            </AccordionDetails>
                        </Accordion>
                    </div>)}
                </div>
            </> : <LinearProgress />}
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
            custom: true,
            customPalette: props => <WizardButton {...props} />,
        };
    }
}

export default Wizard;
