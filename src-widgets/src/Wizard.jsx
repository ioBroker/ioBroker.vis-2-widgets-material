import { VisRxWidget } from '@iobroker/vis-2-widgets-react-dev';
import {
    Button, Dialog, DialogContent, DialogTitle,
} from '@mui/material';
import { useState } from 'react';
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
            obj[item._id] = {
                common: item.common,
                type: item.type,
            }, obj), {});
};

const DeviceDetector = async socket => {
    const devicesObject = await allObjects(socket);
    const keys = Object.keys(devicesObject).sort();
    const detector = new ChannelDetector();

    const usedIds = [];
    const ignoreIndicators = ['UNREACH_STICKY'];    // Ignore indicators by name
    const excludedTypes = ['info'];
    const enums = [];
    const list = [];
    keys.forEach(id => {
        if (devicesObject[id]?.type === 'enum') {
            enums.push(id);
        } else if (devicesObject[id]?.common?.smartName) {
            list.push(id);
        }
    });

    enums.forEach(id => {
        const members = devicesObject[id].common.members;
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
    console.log('controls');
    list.forEach(id => {
        options.id = id;
        const controls = detector.detect(options);
        if (controls) {
            controls.forEach(control => {
                console.log('control type', control.type);
                if (control.states) {
                    control.states.forEach(state => {
                        if (state.id) {
                            console.log(state);
                            console.log(devicesObject[state.id]);
                        }
                    });
                }
            });
        }
    });
};

const WizardButton = props => {
    const [open, setOpen] = useState(false);

    DeviceDetector(props.socket);

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

const WizardDialog = props => <Dialog
    open={props.open}
    onClose={props.onClose}
>
    <DialogTitle>{Generic.t('Wizard')}</DialogTitle>
    <DialogContent>
    </DialogContent>
</Dialog>;

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
