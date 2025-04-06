import PropTypes from 'prop-types';
import type { VisRxWidgetState } from './visRxWidget';
import type VisRxWidget from './visRxWidget';

class Generic<RxData extends Record<string, any>, State extends Partial<VisRxWidgetState> = VisRxWidgetState> extends ((
    window as any
).visRxWidget as typeof VisRxWidget)<RxData, State> {
    getPropertyValue = (stateName: string): any => this.state.values[`${(this.state.rxData as any)[stateName]}.val`];

    static getI18nPrefix(): string {
        return 'vis_2_widgets_material_';
    }

    async getParentObject(id: string): Promise<ioBroker.Object | null> {
        const parts = id.split('.');
        parts.pop();
        const parentOID = parts.join('.');
        return this.props.context.socket.getObject(parentOID);
    }

    static getObjectIcon(obj: ioBroker.Object, id: string, imagePrefix: string): string | null {
        imagePrefix = imagePrefix || '../..'; // http://localhost:8081';
        let src = '';
        const common = obj && obj.common;

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

Generic.propTypes = {
    context: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default Generic;
