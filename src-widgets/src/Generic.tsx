import type { VisRxWidgetState } from '@iobroker/types-vis-2';
import type VisRxWidget from '@iobroker/types-vis-2/visRxWidget';

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
        return await this.props.context.socket.getObject(parentOID);
    }

    static getObjectIcon(obj: ioBroker.Object, id: string, imagePrefix?: string): string | null {
        imagePrefix ||= '../..'; // http://localhost:8081';
        let src = '';
        const common = obj?.common;

        if (common) {
            const cIcon = common.icon;
            if (cIcon) {
                if (!cIcon.startsWith('data:image/')) {
                    if (cIcon.includes('.')) {
                        let instance;
                        if (obj.type === 'instance' || obj.type === 'adapter') {
                            src = `${imagePrefix}/adapter/${common.name as string}/${cIcon}`;
                        } else if (id && id.startsWith('system.adapter.')) {
                            instance = id.split('.', 3);
                            if (cIcon[0] === '/') {
                                instance[2] += cIcon;
                            } else {
                                instance[2] += `/${cIcon}`;
                            }
                            src = `${imagePrefix}/adapter/${instance[2]}`;
                        } else {
                            instance = id.split('.', 2);
                            if (cIcon[0] === '/') {
                                instance[0] += cIcon;
                            } else {
                                instance[0] += `/${cIcon}`;
                            }
                            src = `${imagePrefix}/adapter/${instance[0]}`;
                        }
                    } else {
                        return null;
                    }
                } else {
                    src = cIcon;
                }
            }
        }

        return src || null;
    }
}
