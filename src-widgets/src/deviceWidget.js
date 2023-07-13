import Generic from './Generic';

const simpleState = (device, role, result, settings) => {
    const set = device.states.find(state => state.common.role === role);
    return {
        tpl: 'tplMaterial2SimpleState',
        data: {
            values_count: 0,
            g_common: true,
            oid: set?._id,
            circleSize: 0,
            withNumber: false,
            withStates: false,
            ...(settings || {}),
        },
        ...result,
    };
};

export const getDeviceWidget = device => {
    let result = {
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
    if (device.deviceType === 'thermostat') {
        const set = device.states.find(state => state.common.role === 'level.temperature');
        const actual = device.states.find(state => state.common.role === 'value.temperature');
        return {
            tpl: 'tplMaterial2Thermostat',
            data: {
                'oid-step': '1',
                g_common: true,
                count: 5,
                'oid-temp-set': set?._id,
                'oid-temp-actual': actual?._id,
            },
            ...result,
        };
    }
    if (device.deviceType === 'light') {
        return simpleState(device, 'switch.light', result);
    }
    if (device.deviceType === 'dimmer') {
        return simpleState(device, 'level.dimmer', result);
    }
    if (device.deviceType === 'blinds') {
        const set = device.states.find(state => state.common.role === 'level.blind');
        return {
            tpl: 'tplMaterial2Blinds',
            data: {
                sashCount: 1,
                g_common: true,
                ratio: 1,
                borderWidth: 3,
                oid: set?._id,
            },
        };
    }
    if (device.deviceType === 'temperature') {
        const actual = device.states.find(state => state.common.role === 'value.temperature');
        const humidity = device.states.find(state => state.common.role === 'value.humidity');
        return {
            tpl: 'tplMaterial2Actual',
            data: {
                timeInterval: 12,
                updateInterval: 60,
                'oid-main': actual?._id,
                'oid-secondary': humidity?._id,
            },
            ...result,
        };
    }
    if (device.deviceType === 'motion') {
        return simpleState(device, 'sensor.motion', result, {
            colorEnabled: 'rgba(52,170,68,1)',
            iconSmall: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMy41IDUuNWMxLjEgMCAyLS45IDItMnMtLjktMi0yLTJzLTIgLjktMiAycy45IDIgMiAyek05LjggOC45TDcgMjNoMi4xbDEuOC04bDIuMSAydjZoMnYtNy41bC0yLjEtMmwuNi0zQzE0LjggMTIgMTYuOCAxMyAxOSAxM3YtMmMtMS45IDAtMy41LTEtNC4zLTIuNGwtMS0xLjZjLS40LS42LTEtMS0xLjctMWMtLjMgMC0uNS4xLS44LjFMNiA4LjNWMTNoMlY5LjZsMS44LS43Ii8+PC9zdmc+',

        });
    }
    if (device.deviceType === 'fireAlarm') {
        return simpleState(device, 'sensor.alarm.fire', result, {
            colorEnabled: 'red',
            iconSmall:  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMy41LjY3cy43NCAyLjY1Ljc0IDQuOGMwIDIuMDYtMS4zNSAzLjczLTMuNDEgMy43M2MtMi4wNyAwLTMuNjMtMS42Ny0zLjYzLTMuNzNsLjAzLS4zNkM1LjIxIDcuNTEgNCAxMC42MiA0IDE0YzAgNC40MiAzLjU4IDggOCA4czgtMy41OCA4LThDMjAgOC42MSAxNy40MSAzLjggMTMuNS42N3pNMTEuNzEgMTljLTEuNzggMC0zLjIyLTEuNC0zLjIyLTMuMTRjMC0xLjYyIDEuMDUtMi43NiAyLjgxLTMuMTJjMS43Ny0uMzYgMy42LTEuMjEgNC42Mi0yLjU4Yy4zOSAxLjI5LjU5IDIuNjUuNTkgNC4wNGMwIDIuNjUtMi4xNSA0LjgtNC44IDQuOHoiLz48L3N2Zz4=',

        });
    }
    if (device.deviceType === 'floodAlarm') {
        return simpleState(device, 'sensor.alarm.flood', result, {
            colorEnabled: 'blue',
            iconSmall: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0yMS45OCAxNEgyMmgtLjAyek01LjM1IDEzYzEuMTkgMCAxLjQyIDEgMy4zMyAxYzEuOTUgMCAyLjA5LTEgMy4zMy0xYzEuMTkgMCAxLjQyIDEgMy4zMyAxYzEuOTUgMCAyLjA5LTEgMy4zMy0xYzEuMTkgMCAxLjQuOTggMy4zMSAxdi0yYy0xLjE5IDAtMS40Mi0xLTMuMzMtMWMtMS45NSAwLTIuMDkgMS0zLjMzIDFjLTEuMTkgMC0xLjQyLTEtMy4zMy0xYy0xLjk1IDAtMi4wOSAxLTMuMzMgMWMtMS4xOSAwLTEuNDItMS0zLjMzLTFjLTEuOTUgMC0yLjA5IDEtMy4zMyAxdjJjMS45IDAgMi4xNy0xIDMuMzUtMXptMTMuMzIgMmMtMS45NSAwLTIuMDkgMS0zLjMzIDFjLTEuMTkgMC0xLjQyLTEtMy4zMy0xYy0xLjk1IDAtMi4xIDEtMy4zNCAxYy0xLjI0IDAtMS4zOC0xLTMuMzMtMWMtMS45NSAwLTIuMSAxLTMuMzQgMXYyYzEuOTUgMCAyLjExLTEgMy4zNC0xYzEuMjQgMCAxLjM4IDEgMy4zMyAxYzEuOTUgMCAyLjEtMSAzLjM0LTFjMS4xOSAwIDEuNDIgMSAzLjMzIDFjMS45NCAwIDIuMDktMSAzLjMzLTFjMS4xOSAwIDEuNDIgMSAzLjMzIDF2LTJjLTEuMjQgMC0xLjM4LTEtMy4zMy0xek01LjM1IDljMS4xOSAwIDEuNDIgMSAzLjMzIDFjMS45NSAwIDIuMDktMSAzLjMzLTFjMS4xOSAwIDEuNDIgMSAzLjMzIDFjMS45NSAwIDIuMDktMSAzLjMzLTFjMS4xOSAwIDEuNC45OCAzLjMxIDFWOGMtMS4xOSAwLTEuNDItMS0zLjMzLTFjLTEuOTUgMC0yLjA5IDEtMy4zMyAxYy0xLjE5IDAtMS40Mi0xLTMuMzMtMWMtMS45NSAwLTIuMDkgMS0zLjMzIDFjLTEuMTkgMC0xLjQyLTEtMy4zMy0xQzMuMzggNyAzLjI0IDggMiA4djJjMS45IDAgMi4xNy0xIDMuMzUtMXoiLz48L3N2Zz4=',
        });
    }
    if (device.deviceType === 'door') {
        return simpleState(device, 'sensor.door', result, {
            colorEnabled: 'red',
            iconSmall: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xOCAySDZjLTEuMSAwLTIgLjktMiAydjE4aDE2VjRjMC0xLjEtLjktMi0yLTJ6bS0yLjUgMTEuNWMtLjgzIDAtMS41LS42Ny0xLjUtMS41cy42Ny0xLjUgMS41LTEuNXMxLjUuNjcgMS41IDEuNXMtLjY3IDEuNS0xLjUgMS41eiIvPjwvc3ZnPg==',
        });
    }
    if (device.deviceType === 'levelSlider') {
        return simpleState(device, 'level', result);
    }
    if (device.deviceType === 'lock') {
        return simpleState(device, 'switch.lock', result);
    }
    if (device.deviceType === 'socket') {
        return simpleState(device, 'socket', result, {
            iconSmall: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwczEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyek05IDEyYy0uNTUgMC0xLS40NS0xLTFWOGMwLS41NS40NS0xIDEtMXMxIC40NSAxIDF2M2MwIC41NS0uNDUgMS0xIDF6bTUgNmgtNHYtMmMwLTEuMS45LTIgMi0yczIgLjkgMiAydjJ6bTItN2MwIC41NS0uNDUgMS0xIDFzLTEtLjQ1LTEtMVY4YzAtLjU1LjQ1LTEgMS0xczEgLjQ1IDEgMXYzeiIvPjwvc3ZnPg==',
        });
    }
    if (device.deviceType === 'media') {
        const mediaTypes = ['title', 'artist', 'cover', 'state', 'duration', 'elapsed', 'prev', 'next', 'volume', 'mute', 'repeat', 'shuffle'];
        const currentMediaTypes = [...mediaTypes];

        result = {
            tpl: 'tplMaterial2Player',
            data: {
                noCard: null,
                widgetTitle: null,
            },
            ...result,
        };
        device.states.forEach(_state => {
            const role = _state?.common?.role?.match(/^(media\.mode|media|button|level)\.(.*)$/)?.[2];
            if (role && currentMediaTypes.includes(role)) {
                currentMediaTypes.splice(currentMediaTypes.indexOf(role), 1);
                result.data[role] = _state._id;
            }
        });
        return result;
    }
    if (device.deviceType === 'volume') {
        return simpleState(device, 'level.volume', result, {
            iconSmall: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwczEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyek05IDEyYy0uNTUgMC0xLS40NS0xLTFWOGMwLS41NS40NS0xIDEtMXMxIC40NSAxIDF2M2MwIC41NS0uNDUgMS0xIDF6bTUgNmgtNHYtMmMwLTEuMS45LTIgMi0yczIgLjkgMiAydjJ6bTItN2MwIC41NS0uNDUgMS0xIDFzLTEtLjQ1LTEtMVY4YzAtLjU1LjQ1LTEgMS0xczEgLjQ1IDEgMXYzeiIvPjwvc3ZnPg==',
        });
    }
    if (device.deviceType === 'weatherForecast') {
        return {
            tpl: 'tplOpenWeatherMapWeather',
            data: {
                type: 'all',
                g_common: true,
                days: '6',
                instance: '0',
            },
            ...result,
        };
    }
    if (device.deviceType === 'window') {
        return simpleState(device, 'sensor.window', result, {
            iconSmall: '',
            iconEnabledSmall: '',
        });
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

export const getDeviceWidgetOnePage = (device, widgetId, roomWidget, view) => {
    const addSwitch = (role, settings) => {
        const set = device.states.find(state => state.common.role === role);
        roomWidget.data.count++;
        roomWidget.data[`oid${roomWidget.data.count}`] = set?._id;
        roomWidget.data[`type${roomWidget.data.count}`] = 'auto';
        roomWidget.data[`title${roomWidget.data.count}`] = Generic.getText(device.common.name);
        Object.keys(settings || {}).forEach(setting => {
            roomWidget.data[`${setting}${roomWidget.data.count}`] = settings[setting];
        });
    };
    if (device.deviceType === 'thermostat') {
        const widget = getDeviceWidget(device);
        widget.usedInWidget = true;
        view.widgets[widgetId] = widget;
        roomWidget.data.count++;
        roomWidget.data[`widget${roomWidget.data.count}`] = widgetId;
    }
    if (device.deviceType === 'light') {
        addSwitch('switch.light', { type: 'switch' });
    }
    if (device.deviceType === 'dimmer') {
        addSwitch('level.dimmer', { type: 'slider' });
        return;
    }
    if (device.deviceType === 'blinds') {
        addSwitch('level.blind', { type: 'blinds' });
        return;
    }
    if (device.deviceType === 'temperature') {
        addSwitch('value.temperature', { type: 'info' });
        addSwitch('value.humidity', { type: 'info' });
        return;
    }
    if (device.deviceType === 'motion') {
        addSwitch('sensor.motion', {
            type: 'info',
            colorEnabled: 'rgba(52,170,68,1)',
            iconSmall: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMy41IDUuNWMxLjEgMCAyLS45IDItMnMtLjktMi0yLTJzLTIgLjktMiAycy45IDIgMiAyek05LjggOC45TDcgMjNoMi4xbDEuOC04bDIuMSAydjZoMnYtNy41bC0yLjEtMmwuNi0zQzE0LjggMTIgMTYuOCAxMyAxOSAxM3YtMmMtMS45IDAtMy41LTEtNC4zLTIuNGwtMS0xLjZjLS40LS42LTEtMS0xLjctMWMtLjMgMC0uNS4xLS44LjFMNiA4LjNWMTNoMlY5LjZsMS44LS43Ii8+PC9zdmc+',
        });
        return;
    }
    if (device.deviceType === 'fireAlarm') {
        addSwitch('sensor.alarm.fire', {
            type: 'info',
            colorEnabled: 'red',
            iconSmall:  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMy41LjY3cy43NCAyLjY1Ljc0IDQuOGMwIDIuMDYtMS4zNSAzLjczLTMuNDEgMy43M2MtMi4wNyAwLTMuNjMtMS42Ny0zLjYzLTMuNzNsLjAzLS4zNkM1LjIxIDcuNTEgNCAxMC42MiA0IDE0YzAgNC40MiAzLjU4IDggOCA4czgtMy41OCA4LThDMjAgOC42MSAxNy40MSAzLjggMTMuNS42N3pNMTEuNzEgMTljLTEuNzggMC0zLjIyLTEuNC0zLjIyLTMuMTRjMC0xLjYyIDEuMDUtMi43NiAyLjgxLTMuMTJjMS43Ny0uMzYgMy42LTEuMjEgNC42Mi0yLjU4Yy4zOSAxLjI5LjU5IDIuNjUuNTkgNC4wNGMwIDIuNjUtMi4xNSA0LjgtNC44IDQuOHoiLz48L3N2Zz4=',
        });
        return;
    }
    if (device.deviceType === 'floodAlarm') {
        addSwitch('sensor.alarm.flood', {
            type: 'info',
            colorEnabled: 'blue',
            iconSmall: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0yMS45OCAxNEgyMmgtLjAyek01LjM1IDEzYzEuMTkgMCAxLjQyIDEgMy4zMyAxYzEuOTUgMCAyLjA5LTEgMy4zMy0xYzEuMTkgMCAxLjQyIDEgMy4zMyAxYzEuOTUgMCAyLjA5LTEgMy4zMy0xYzEuMTkgMCAxLjQuOTggMy4zMSAxdi0yYy0xLjE5IDAtMS40Mi0xLTMuMzMtMWMtMS45NSAwLTIuMDkgMS0zLjMzIDFjLTEuMTkgMC0xLjQyLTEtMy4zMy0xYy0xLjk1IDAtMi4wOSAxLTMuMzMgMWMtMS4xOSAwLTEuNDItMS0zLjMzLTFjLTEuOTUgMC0yLjA5IDEtMy4zMyAxdjJjMS45IDAgMi4xNy0xIDMuMzUtMXptMTMuMzIgMmMtMS45NSAwLTIuMDkgMS0zLjMzIDFjLTEuMTkgMC0xLjQyLTEtMy4zMy0xYy0xLjk1IDAtMi4xIDEtMy4zNCAxYy0xLjI0IDAtMS4zOC0xLTMuMzMtMWMtMS45NSAwLTIuMSAxLTMuMzQgMXYyYzEuOTUgMCAyLjExLTEgMy4zNC0xYzEuMjQgMCAxLjM4IDEgMy4zMyAxYzEuOTUgMCAyLjEtMSAzLjM0LTFjMS4xOSAwIDEuNDIgMSAzLjMzIDFjMS45NCAwIDIuMDktMSAzLjMzLTFjMS4xOSAwIDEuNDIgMSAzLjMzIDF2LTJjLTEuMjQgMC0xLjM4LTEtMy4zMy0xek01LjM1IDljMS4xOSAwIDEuNDIgMSAzLjMzIDFjMS45NSAwIDIuMDktMSAzLjMzLTFjMS4xOSAwIDEuNDIgMSAzLjMzIDFjMS45NSAwIDIuMDktMSAzLjMzLTFjMS4xOSAwIDEuNC45OCAzLjMxIDFWOGMtMS4xOSAwLTEuNDItMS0zLjMzLTFjLTEuOTUgMC0yLjA5IDEtMy4zMyAxYy0xLjE5IDAtMS40Mi0xLTMuMzMtMWMtMS45NSAwLTIuMDkgMS0zLjMzIDFjLTEuMTkgMC0xLjQyLTEtMy4zMy0xQzMuMzggNyAzLjI0IDggMiA4djJjMS45IDAgMi4xNy0xIDMuMzUtMXoiLz48L3N2Zz4=',
        });
        return;
    }
    if (device.deviceType === 'door') {
        addSwitch('sensor.door', {
            type: 'info',
            colorEnabled: 'red',
            iconSmall: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xOCAySDZjLTEuMSAwLTIgLjktMiAydjE4aDE2VjRjMC0xLjEtLjktMi0yLTJ6bS0yLjUgMTEuNWMtLjgzIDAtMS41LS42Ny0xLjUtMS41cy42Ny0xLjUgMS41LTEuNXMxLjUuNjcgMS41IDEuNXMtLjY3IDEuNS0xLjUgMS41eiIvPjwvc3ZnPg==',
        });
        return;
    }
    if (device.deviceType === 'levelSlider') {
        addSwitch('level', { type: 'slider' });
        return;
    }
    if (device.deviceType === 'lock') {
        addSwitch('switch.lock', { type: 'switch' });
        return;
    }
    if (device.deviceType === 'socket') {
        addSwitch('socket', {
            type: 'switch',
            iconSmall: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwczEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyek05IDEyYy0uNTUgMC0xLS40NS0xLTFWOGMwLS41NS40NS0xIDEtMXMxIC40NSAxIDF2M2MwIC41NS0uNDUgMS0xIDF6bTUgNmgtNHYtMmMwLTEuMS45LTIgMi0yczIgLjkgMiAydjJ6bTItN2MwIC41NS0uNDUgMS0xIDFzLTEtLjQ1LTEtMVY4YzAtLjU1LjQ1LTEgMS0xczEgLjQ1IDEgMXYzeiIvPjwvc3ZnPg==',
        });
        return;
    }
    if (device.deviceType === 'media') {
        const widget = getDeviceWidget(device);
        view.widgets[widgetId] = widget;
    }
    if (device.deviceType === 'volume') {
        addSwitch('level.volume', {
            type: 'slider',
            iconSmall: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwczEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyek05IDEyYy0uNTUgMC0xLS40NS0xLTFWOGMwLS41NS40NS0xIDEtMXMxIC40NSAxIDF2M2MwIC41NS0uNDUgMS0xIDF6bTUgNmgtNHYtMmMwLTEuMS45LTIgMi0yczIgLjkgMiAydjJ6bTItN2MwIC41NS0uNDUgMS0xIDFzLTEtLjQ1LTEtMVY4YzAtLjU1LjQ1LTEgMS0xczEgLjQ1IDEgMXYzeiIvPjwvc3ZnPg==',
        });
        return;
    }
    if (device.deviceType === 'weatherForecast') {
        const widget = getDeviceWidget(device);
        view.widgets[widgetId] = widget;
    }
    if (device.deviceType === 'window') {
        addSwitch('sensor.window', {
            type: 'info',
            iconSmall: '',
            iconEnabledSmall: '',
        });
        return;
    }
    roomWidget.data.count++;
    roomWidget.data[`oid${roomWidget.data.count}`] = device._id;
    roomWidget.data[`type${roomWidget.data.count}`] = 'auto';
};
