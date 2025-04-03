import type { CSSProperties } from 'react';
import React from 'react';
import PropTypes from 'prop-types';

import type { BlindsBaseRxData } from './Components/BlindsBase';
import BlindsBase from './Components/BlindsBase';
import type { RxRenderWidgetProps, RxWidgetInfo, VisWidgetCommand } from '@iobroker/types-vis-2';

const styles: Record<string, CSSProperties> = {
    cardContent: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        overflow: 'hidden',
        height: '100%',
    },
};

interface BlindsRxData extends BlindsBaseRxData {
    noCard: boolean;
    widgetTitle: string;
    sashCount: number;
    ratio: number;
    borderWidth: number;
    oid: string;
    oid_stop: string;
    showValue: boolean;
    min: string;
    max: string;
    invert: boolean;
    externalDialog: boolean;
    [key: `slideSensor_oid${number}`]: string;
    [key: `slideRatio${number}`]: number;
}

class Blinds extends BlindsBase<BlindsRxData> {
    refCardContent: React.RefObject<HTMLDivElement | null>;
    lastRxData: string | undefined;
    updateTimeout: ReturnType<typeof setTimeout> | undefined;

    constructor(props) {
        super(props);
        this.state.objects = {};
        this.refCardContent = React.createRef();
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplMaterial2Blinds',
            visSet: 'vis-2-widgets-material',
            visName: 'Blinds',
            visWidgetLabel: 'blinds', // Label of widget
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'noCard',
                            label: 'without_card',
                            type: 'checkbox',
                            hidden: '!!data.externalDialog',
                        },
                        {
                            name: 'widgetTitle',
                            label: 'name',
                            hidden: '!!data.noCard',
                        },
                        {
                            name: 'sashCount',
                            type: 'number',
                            default: 1,
                            label: 'sash_count',
                        },
                        {
                            name: 'ratio',
                            type: 'slider',
                            min: 0.1,
                            max: 3,
                            step: 0.1,
                            label: 'window_ratio',
                            default: 1,
                        },
                        {
                            name: 'borderWidth',
                            type: 'slider',
                            min: 0,
                            max: 100,
                            step: 0.1,
                            label: 'border_width',
                            default: 3,
                        },
                        {
                            name: 'oid',
                            type: 'id',
                            default: '',
                            label: 'blinds_position_oid',
                            noInit: true,
                            onChange: async (field, data, changeData, socket) => {
                                if (data[field.name]) {
                                    const object = await socket.getObject(data[field.name]);
                                    if (object && object.common) {
                                        let changed = false;

                                        // try to find stop button
                                        const id = object._id.split('.');
                                        id.pop();
                                        const states = await socket.getObjectView(
                                            `${id.join('.')}.`,
                                            `${id.join('.')}.\u9999`,
                                            'state',
                                        );
                                        if (states) {
                                            Object.values(states).forEach(state => {
                                                if (state?.common?.role?.includes('stop')) {
                                                    data.blinds_stop_oid = state._id;
                                                    changed = true;
                                                }
                                            });
                                        }

                                        changed && changeData(data);
                                    }
                                }
                            },
                        },
                        {
                            name: 'oid_stop',
                            type: 'id',
                            default: '',
                            label: 'blinds_stop_oid',
                            noInit: true,
                            hidden: data => !data.oid,
                        },
                        {
                            label: 'show_value',
                            type: 'checkbox',
                            name: 'showValue',
                            hidden: data => !data.oid,
                            default: true,
                        },
                        {
                            label: 'min_position',
                            type: 'number',
                            hidden: data => !data.oid,
                            name: 'min',
                        },
                        {
                            label: 'max_position',
                            type: 'number',
                            hidden: data => !data.oid,
                            name: 'max',
                        },
                        {
                            label: 'invert_position',
                            type: 'checkbox',
                            hidden: data => !data.oid,
                            name: 'invert',
                        },
                        {
                            name: 'externalDialog',
                            label: 'use_as_dialog',
                            type: 'checkbox',
                            tooltip: 'use_as_dialog_tooltip',
                        },
                    ],
                },
                {
                    name: 'sashes',
                    label: 'sash',
                    indexFrom: 1,
                    indexTo: 'sashCount',
                    fields: [
                        {
                            name: 'slideSensor_oid',
                            type: 'id',
                            label: 'slide_sensor_oid',
                            noInit: true,
                        },
                        {
                            name: 'slideHandle_oid',
                            type: 'id',
                            label: 'handle_sensor_oid',
                            noInit: true,
                        },
                        {
                            name: 'slideType',
                            type: 'select',
                            label: 'sash_type',
                            options: [
                                { value: '', label: 'sash_none' },
                                { value: 'left', label: 'left' },
                                { value: 'right', label: 'right' },
                                { value: 'top', label: 'top' },
                                { value: 'bottom', label: 'bottom' },
                            ],
                        },
                        {
                            name: 'slideRatio',
                            type: 'slider',
                            label: 'slide_ratio',
                            default: 1,
                            min: 0.1,
                            max: 4,
                            step: 0.1,
                            hidden: data => data.sashCount < 2,
                        },
                        {
                            name: 'slidePos_oid',
                            type: 'id',
                            default: '',
                            label: 'blinds_position_oid',
                            hidden: data => !!data.oid,
                            noInit: true,
                            onChange: async (field, data, changeData, socket) => {
                                if (data[field.name]) {
                                    const object = await socket.getObject(data[field.name]);
                                    const index = field.name!.match(/(\d+)$/)![1];
                                    if (object && object.common) {
                                        let changed = false;
                                        // try to find stop button
                                        const id = object._id.split('.');
                                        id.pop();
                                        const states = await socket.getObjectView(
                                            `${id.join('.')}.`,
                                            `${id.join('.')}.\u9999`,
                                            'state',
                                        );
                                        if (states) {
                                            Object.values(states).forEach(state => {
                                                if (state?.common?.role?.includes('stop')) {
                                                    data[`slideStop_oid${index}`] = state._id;
                                                    changed = true;
                                                }
                                            });
                                        }
                                        changed && changeData(data);
                                    }
                                }
                            },
                        },
                        {
                            name: 'slideStop_oid',
                            type: 'id',
                            default: '',
                            label: 'blinds_stop_oid',
                            noInit: true,
                            hidden: (data, index) => !!data.oid || !data[`slidePos_oid${index}`],
                        },
                        {
                            label: 'min_position',
                            type: 'number',
                            hidden: (data, index) => !!data.oid || !data[`slidePos_oid${index}`],
                            name: 'slideMin',
                        },
                        {
                            label: 'max_position',
                            type: 'number',
                            hidden: (data, index) => !!data.oid || !data[`slidePos_oid${index}`],
                            name: 'slideMax',
                        },
                        {
                            label: 'invert_position',
                            type: 'checkbox',
                            hidden: (data, index) => !!data.oid || !data[`slidePos_oid${index}`],
                            name: 'slideInvert',
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 120,
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_blinds.png',
        } as const;
    }

    getWidgetInfo(): RxWidgetInfo {
        return Blinds.getWidgetInfo();
    }

    async propertiesUpdate(): Promise<void> {
        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData === actualRxData) {
            return;
        }

        this.lastRxData = actualRxData;
        const objects = {};
        const ids = [];
        for (let index = 1; index <= this.state.rxData.sashCount; index++) {
            if (
                this.state.rxData[`slidePos_oid${index}`] &&
                this.state.rxData[`slidePos_oid${index}`] !== 'nothing_selected'
            ) {
                ids.push(this.state.rxData[`slidePos_oid${index}`]);
            }
        }
        if (this.state.rxData.oid && this.state.rxData.oid !== 'nothing_selected') {
            ids.push(this.state.rxData.oid);
        }
        const _objects = ids.length ? await this.props.context.socket.getObjectsById(ids) : {};
        const _object = _objects[this.state.rxData.oid] || null;
        objects.main = _object?.common || {};

        // try to find icons for all OIDs
        for (let index = 1; index <= this.state.rxData.sashCount; index++) {
            if (
                this.state.rxData[`slidePos_oid${index}`] &&
                this.state.rxData[`slidePos_oid${index}`] !== 'nothing_selected'
            ) {
                // read object itself
                const object = _objects[this.state.rxData[`slidePos_oid${index}`]];
                if (!object) {
                    objects[index] = {};
                    continue;
                }

                objects[index] = object?.common || {};
            }
        }

        if (JSON.stringify(objects) !== JSON.stringify(this.state.objects)) {
            this.setState({ objects });
        }
    }

    async componentDidMount(): Promise<void> {
        super.componentDidMount();
        await this.propertiesUpdate();
    }

    async onRxDataChanged(): Promise<void> {
        await this.propertiesUpdate();
    }

    onCommand(command: VisWidgetCommand): any {
        const result = super.onCommand(command);
        if (result === false) {
            if (command === 'openDialog') {
                this.setState({ showBlindsDialog: true });
                return true;
            }
            if (command === 'closeDialog') {
                this.setState({ showBlindsDialog: false });
                return true;
            }
        }

        return result;
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | React.JSX.Element[] | null {
        super.renderWidgetBody(props);

        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData !== actualRxData) {
            this.updateTimeout =
                this.updateTimeout ||
                setTimeout(async () => {
                    this.updateTimeout = undefined;
                    await this.propertiesUpdate();
                }, 50);
        }

        let height: number;
        let width: number;
        if (!this.refCardContent.current) {
            setTimeout(() => this.forceUpdate(), 50);
        } else {
            height = this.refCardContent.current.offsetHeight; // take 10° for opened slash
            // if one of the slashes could be opened, find the length of it
            let length = 0;
            for (let i = 1; i <= this.state.rxData.sashCount; i++) {
                if (this.state.rxData[`slideSensor_oid${i}`] || this.state.rxData[`slideHandle_oid${i}`]) {
                    if (length < this.state.rxData[`slideRatio${i}`]) {
                        length = this.state.rxData[`slideRatio${i}`];
                    }
                }
            }

            width = this.refCardContent.current.offsetWidth;

            if (length) {
                const oneWidth = (width / this.state.rxData.sashCount) * length;
                height -= 0.12 * oneWidth;
            }
        }

        const data = this.getMinMaxPosition(0);
        height! -= 8;

        const content = (
            <div
                ref={this.refCardContent}
                style={{ ...styles.cardContent, cursor: data.hasControl ? 'pointer' : undefined }}
                onClick={
                    data.hasControl
                        ? e => {
                              e.stopPropagation();
                              e.preventDefault();
                              if (!this.lastClick || Date.now() - this.lastClick > 300) {
                                  this.setState({ showBlindsDialog: true });
                              }
                          }
                        : undefined
                }
            >
                {height! ? this.renderBlindsDialog() : null}
                {height! ? this.renderWindows({ height: height!, width: width! }) : null}
            </div>
        );

        if (this.state.rxData.externalDialog && !this.props.editMode) {
            return this.renderBlindsDialog();
        }

        if (this.state.rxData.noCard || props.widget.usedInWidget) {
            return content;
        }

        return this.wrapContent(
            content,
            this.state.rxData.showValue && data.hasControl ? <span>{data.shutterPos}%</span> : null,
        );
    }
}

Blinds.propTypes = {
    context: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default Blinds;
