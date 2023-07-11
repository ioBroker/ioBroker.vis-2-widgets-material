import Generic from './Generic';

const getDeviceWidget = (device, onePage) => {
    if (device.deviceType === 'light') {
        const set = device.states.find(state.common.role === 'switch.light');
        return {
            tpl: 'tplMaterial2SimpleState',
            data: {
                values_count: 0,
                g_common: true,
                oid: set._id,
                circleSize: 0,
                withNumber: false,
                withStates: false,
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
    }
    return {
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
};

export default getDeviceWidget;
