import React from 'react';

/**
 * What the switches widget needs of the vacuum cleaner: its icon, the states it reports and their colors.
 *
 * The vacuum widget itself moved into vis-2 (the set `devices`); these parts stayed here, because `Switches`
 * shows a vacuum cleaner as one of its lines.
 */

export function FanIcon(props: { style?: React.CSSProperties; height?: number; width?: number }): React.JSX.Element {
    return (
        <svg
            viewBox="0 0 512 512"
            width={props.width || 20}
            height={props.height || props.width || 20}
            xmlns="http://www.w3.org/2000/svg"
            style={props.style}
        >
            <path
                fill="currentColor"
                d="M352.57 128c-28.09 0-54.09 4.52-77.06 12.86l12.41-123.11C289 7.31 279.81-1.18 269.33.13 189.63 10.13 128 77.64 128 159.43c0 28.09 4.52 54.09 12.86 77.06L17.75 224.08C7.31 223-1.18 232.19.13 242.67c10 79.7 77.51 141.33 159.3 141.33 28.09 0 54.09-4.52 77.06-12.86l-12.41 123.11c-1.05 10.43 8.11 18.93 18.59 17.62 79.7-10 141.33-77.51 141.33-159.3 0-28.09-4.52-54.09-12.86-77.06l123.11 12.41c10.44 1.05 18.93-8.11 17.62-18.59-10-79.7-77.51-141.33-159.3-141.33zM256 288a32 32 0 1 1 32-32 32 32 0 0 1-32 32z"
            />
        </svg>
    );
}

export type VACUUM_ID_ROLES_TYPE =
    | 'status'
    | 'battery'
    | 'is-charging'
    | 'fan-speed'
    | 'sensors-left'
    | 'filter-left'
    | 'main-brush-left'
    | 'side-brush-left'
    | 'cleaning-count'
    | 'start'
    | 'home'
    | 'pause'
    | 'map64';

export const VACUUM_ID_ROLES: Record<VACUUM_ID_ROLES_TYPE, { role?: string; name?: string }> = {
    status: { role: 'value.state' },
    battery: { role: 'value.battery' },
    'is-charging': { name: 'is_charging' },
    'fan-speed': { role: 'level.suction' },
    'sensors-left': { role: 'value.usage.sensors' },
    'filter-left': { role: 'value.usage.filter' },
    'main-brush-left': { role: 'value.usage.brush' },
    'side-brush-left': { role: 'value.usage.brush.side' },
    'cleaning-count': { name: 'cleanups' },
    start: { role: 'button', name: 'start' },
    home: { role: 'button', name: 'home' },
    pause: { role: 'button', name: 'pause' },
    map64: { role: 'vacuum.map.base64' },
};

export const VACUUM_CLEANING_STATES = ['cleaning', 'spot Cleaning', 'zone cleaning', 'room cleaning'];

export const VACUUM_PAUSE_STATES = ['pause', 'waiting'];

export const VACUUM_CHARGING_STATES = ['charging', 'charging Erro'];

export const VACUUM_GOING_HOME_STATES = ['back to home', 'docking'];

export const vacuumGetStatusColor = (status: string | boolean | null | undefined): string | undefined => {
    if (typeof status === 'boolean') {
        if (status) {
            return 'green';
        }
    } else {
        if (status === null || status === undefined) {
            status = '';
        }
        const smallStatus = status.toString().toLowerCase();
        if (VACUUM_CLEANING_STATES.includes(smallStatus)) {
            return 'green';
        }
        if (VACUUM_PAUSE_STATES.includes(smallStatus)) {
            return 'yellow';
        }
        if (VACUUM_CHARGING_STATES.includes(smallStatus)) {
            return 'gray';
        }
        if (VACUUM_GOING_HOME_STATES.includes(smallStatus)) {
            return 'blue';
        }
    }
    return undefined;
};
