import type { VisRxWidgetState } from '@iobroker/types-vis-2';
import type VisRxWidget from '@iobroker/types-vis-2/visRxWidget';

import { getObjectIcon, type ObjectWithIcon } from './Components/objectIcon';

export const HISTORY_ADAPTER_NAMES = ['history', 'sql', 'influxdb'];

export default class Generic<
    RxData extends Record<string, any>,
    State extends Partial<VisRxWidgetState> = VisRxWidgetState,
> extends (window.visRxWidget as typeof VisRxWidget)<RxData, State> {
    getPropertyValue = (stateName: string): any => this.state.values[`${(this.state.rxData as any)[stateName]}.val`];

    static getI18nPrefix(): string {
        return 'vis_2_widgets_material_';
    }

    static getHistoryInstance(
        obj: ioBroker.StateObject | undefined | null | { common: ioBroker.StateCommon; _id: string },
        defaultHistory: string,
    ): string | null {
        if (obj?.common?.custom) {
            if (obj.common.custom[defaultHistory]) {
                return defaultHistory;
            }
            for (const instance in obj.common.custom) {
                if (HISTORY_ADAPTER_NAMES.includes(instance.split('.')[0])) {
                    return instance;
                }
            }
        }
        return null;
    }

    async getParentObject(id: string): Promise<ioBroker.Object | null> {
        const parts = id.split('.');
        parts.pop();
        const parentOID = parts.join('.');
        return (await this.props.context.socket.getObject(parentOID)) ?? null;
    }

    static getObjectIcon(obj: ioBroker.Object, id: string, imagePrefix?: string): string | null {
        return getObjectIcon(obj, id, imagePrefix || undefined);
    }

    /**
     * The icon of a state for the widget: its own, or else the one of its channel, or else the one of its device -
     * as an address the browser can load from the page.
     *
     * The icon of a device usually sits on the device and not on its states, and its path is relative to the adapter
     * that wrote it. Every widget that showed such an icon used to take it over as it was, and the browser looked for
     * it next to the page.
     *
     * @param id - the id of the state
     * @param object - the object of the state
     */
    async findStateIcon(id: string, object: ObjectWithIcon | null | undefined): Promise<string | undefined> {
        if (object?.common?.icon) {
            return getObjectIcon(object, id, '..') || undefined;
        }
        if (object?.type !== 'state' && object?.type !== 'channel') {
            return undefined;
        }

        const idArray = id.split('.');
        const parentObject = await this.props.context.socket.getObject(idArray.slice(0, -1).join('.'));
        if (parentObject?.common?.icon) {
            return getObjectIcon(parentObject, parentObject._id, '..') || undefined;
        }
        const grandParentObject = await this.props.context.socket.getObject(idArray.slice(0, -2).join('.'));
        if (grandParentObject?.common?.icon) {
            return getObjectIcon(grandParentObject, grandParentObject._id, '..') || undefined;
        }
        return undefined;
    }
}
