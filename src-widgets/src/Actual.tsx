import React, { type CSSProperties } from 'react';

import { Dialog, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material';

import { Close as IconClose, DeviceThermostat as ThermostatIcon, Opacity as HumidityIcon } from '@mui/icons-material';

import ReactEchartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
    GridComponent,
    ToolboxComponent,
    TooltipComponent,
    TitleComponent,
    TimelineComponent,
    LegendComponent,
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import type { EChartsOption, LineSeriesOption } from 'echarts';
import type { TimeAxisBaseOption } from 'echarts/types/src/coord/axisCommonTypes';

import type { RxRenderWidgetProps, RxWidgetInfo, VisRxWidgetProps, VisRxWidgetState } from '@iobroker/types-vis-2';
import { Icon } from '@iobroker/adapter-react-v5';

import ObjectChart from './Components/ObjectChart';
import Generic from './Generic';

echarts.use([
    TimelineComponent,
    ToolboxComponent,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LineChart,
    LegendComponent,
    SVGRenderer,
]);

const styles: Record<string, CSSProperties> = {
    chart: {
        height: 'calc(100% - 40px)',
        width: '100%',
    },
    mainDiv: {
        marginLeft: 10,
        color: 'rgba(243,177,31)',
        display: 'inline-block',
        lineHeight: '24px',
    },
    temperatureValue: {
        verticalAlign: 'middle',
        fontSize: 28,
    },
    temperatureUnit: {
        paddingLeft: 5,
        opacity: 0.6,
        fontSize: 14,
        verticalAlign: 'middle',
    },
    mainIcon: {
        verticalAlign: 'middle',
        marginRight: 4,
        fontSize: 20,
        width: 20,
    },
    secondaryDiv: {
        color: 'rgba(77,134,255)',
        display: 'inline-block',
        float: 'right',
        marginRight: 12,
        lineHeight: '24px',
    },
    humidityValue: {
        verticalAlign: 'middle',
    },
    humidityUnit: {
        paddingLeft: 5,
        opacity: 0.6,
        fontSize: 14,
        verticalAlign: 'middle',
    },
    secondaryIcon: {
        verticalAlign: 'middle',
        fontSize: 20,
        marginRight: 4,
    },
    newValueLight: {
        animation: 'vis-2-widgets-material-newValueAnimationLight 2s ease-in-out',
    },
    newValueDark: {
        animation: 'vis-2-widgets-material-newValueAnimationDark 2s ease-in-out',
    },
    tooltip: {
        pointerEvents: 'none',
    },
};

type RxData = {
    noCard: boolean | 'true';
    widgetTitle: string;
    timeInterval: number;
    updateInterval: string;
    'oid-main': string;
    'title-main': string;
    'icon-main': string;
    'unit-main': string;
    noChart: boolean | 'true';
    'color-main': string;
    'font-size-main': string;
    'font-style-main': 'normal' | 'italic';
    digits_after_comma_main?: 0 | 1;
    'oid-secondary': string;
    'title-secondary': string;
    'icon-secondary': string;
    'unit-secondary': string;
    'noChart-secondary': boolean | 'true';
    'color-secondary': string;
    'font-size-secondary': string;
    'font-style-secondary': 'normal' | 'italic';
    'noData-secondary': boolean | 'true';
    digits_after_comma_secondary?: 0 | 1;
};

interface ActualState extends VisRxWidgetState {
    showDialog: boolean;
    dialogTab: number;
    objects: {
        main?: { common: ioBroker.StateCommon; _id: string };
        secondary?: { common: ioBroker.StateCommon; _id: string };
    };
    isChart: boolean;
    containerHeight: number;
    chartData: {
        [oid: string]: {
            data: { value: [ts: number, val: number] }[];
            min: number;
            max: number;
        } | null;
    };
}

export default class Actual extends Generic<RxData, ActualState> {
    private readonly refContainer: React.RefObject<HTMLDivElement> = React.createRef();
    private mainTimer: ReturnType<typeof setInterval> | undefined;
    private updateTimeout: ReturnType<typeof setTimeout> | undefined;
    private lastRxData: string | undefined;

    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = {
            ...this.state,
            showDialog: false,
            dialogTab: 0,
            isChart: false,
            containerHeight: 0,
            chartData: {},
        };
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplMaterial2Actual',
            visSet: 'vis-2-widgets-material',

            visSetLabel: 'set_label', // Label of this widget set
            visSetColor: '#0783ff', // Color of this widget set

            visWidgetLabel: 'actual_value_with_chart', // Label of widget
            visName: 'Actual values',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'noCard',
                            label: 'without_card',
                            type: 'checkbox',
                            noBinding: false,
                        },
                        {
                            name: 'widgetTitle',
                            label: 'name',
                            hidden: 'data.noCard === true',
                        },
                        {
                            name: 'timeInterval',
                            label: 'chart_time_interval',
                            tooltip: 'hours',
                            type: 'slider',
                            min: 0,
                            max: 48,
                            step: 1,
                            default: 12,
                        },
                        {
                            name: 'updateInterval',
                            label: 'chart_update_interval',
                            tooltip: 'seconds',
                            type: 'slider',
                            min: 10,
                            max: 360,
                            step: 1,
                            default: 60,
                        },
                    ],
                },
                {
                    name: 'main',
                    label: 'main_object',
                    fields: [
                        {
                            label: 'oid',
                            name: 'oid-main',
                            type: 'id',
                        },
                        {
                            label: 'title',
                            name: 'title-main',
                            type: 'text',
                            noButton: true,
                            hidden: '!data["oid-main"] || data["oid-main"] === "nothing_selected"',
                        },
                        {
                            label: 'icon',
                            name: 'icon-main',
                            type: 'icon64',
                            hidden: '!data["oid-main"] || data["oid-main"] === "nothing_selected"',
                        },
                        {
                            label: 'unit',
                            name: 'unit-main',
                            type: 'text',
                            noButton: true,
                            hidden: '!data["oid-main"] || data["oid-main"] === "nothing_selected"',
                        },
                        {
                            label: 'hide_chart',
                            name: 'noChart',
                            noBinding: false,
                            type: 'checkbox',
                            hidden: '!data["oid-main"] || data["oid-main"] === "nothing_selected"',
                        },
                        {
                            label: 'color',
                            name: 'color-main',
                            type: 'color',
                            hidden: '!data["oid-main"] || data["oid-main"] === "nothing_selected"',
                        },
                        {
                            label: 'font_size',
                            name: 'font-size-main',
                            type: 'slider',
                            min: 1,
                            max: 100,
                            hidden: '!data["oid-main"] || data["oid-main"] === "nothing_selected"',
                        },
                        {
                            label: 'font_style',
                            name: 'font-style-main',
                            type: 'select',
                            noTranslation: true,
                            options: [
                                { value: 'normal', label: 'normal' },
                                { value: 'italic', label: 'italic' },
                            ],
                            hidden: '!data["oid-main"] || data["oid-main"] === "nothing_selected"',
                        },
                        {
                            label: 'digits_after_comma',
                            name: 'digits_after_comma_main',
                            type: 'number',
                            min: 0,
                            max: 10,
                            hidden: '!data["oid-main"] || data["oid-main"] === "nothing_selected"',
                        },
                    ],
                },
                {
                    name: 'secondary',
                    label: 'secondary_object',
                    fields: [
                        {
                            label: 'oid',
                            name: 'oid-secondary',
                            type: 'id',
                        },
                        {
                            label: 'title',
                            name: 'title-secondary',
                            type: 'text',
                            noButton: true,
                            hidden: '!data["oid-secondary"] || data["oid-secondary"] === "nothing_selected"',
                        },
                        {
                            label: 'icon',
                            name: 'icon-secondary',
                            type: 'icon64',
                            hidden: '!data["oid-secondary"] || data["oid-secondary"] === "nothing_selected"',
                        },
                        {
                            label: 'unit',
                            name: 'unit-secondary',
                            type: 'text',
                            noButton: true,
                            hidden: '!data["oid-secondary"] || data["oid-secondary"] === "nothing_selected"',
                        },
                        {
                            label: 'hide_chart',
                            name: 'noChart-secondary',
                            noBinding: false,
                            type: 'checkbox',
                            hidden: '!data["oid-secondary"] || data["oid-secondary"] === "nothing_selected"',
                        },
                        {
                            label: 'color',
                            name: 'color-secondary',
                            type: 'color',
                            hidden: '!data["oid-secondary"] || data["oid-secondary"] === "nothing_selected"',
                        },
                        {
                            label: 'font_size',
                            name: 'font-size-secondary',
                            type: 'slider',
                            min: 1,
                            max: 100,
                            hidden: '!data["oid-secondary"] || data["oid-secondary"] === "nothing_selected"',
                        },
                        {
                            label: 'font_style',
                            name: 'font-style-secondary',
                            type: 'select',
                            noTranslation: true,
                            options: [
                                { value: 'normal', label: 'normal' },
                                { value: 'italic', label: 'italic' },
                            ],
                            hidden: '!data["oid-secondary"] || data["oid-secondary"] === "nothing_selected"',
                        },
                        {
                            label: 'digits_after_comma',
                            name: 'digits_after_comma_secondary',
                            type: 'number',
                            min: 0,
                            max: 10,
                            hidden: '!data["oid-secondary"] || data["oid-secondary"] === "nothing_selected"',
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 120,
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_actual.png',
        } as const;
    }

    getWidgetInfo(): RxWidgetInfo {
        return Actual.getWidgetInfo();
    }

    async getIcon(id: string, object: ioBroker.Object): Promise<void> {
        if (!object.common.icon && (object.type === 'state' || object.type === 'channel')) {
            const idArray = id.split('.');

            // read channel
            const parentObject = await this.props.context.socket.getObject(idArray.slice(0, -1).join('.'));
            if (!parentObject?.common?.icon && (object.type === 'state' || object.type === 'channel')) {
                const grandParentObject = await this.props.context.socket.getObject(idArray.slice(0, -2).join('.'));
                if (grandParentObject?.common?.icon) {
                    object.common.icon = grandParentObject.common.icon;
                    if (grandParentObject.type === 'instance' || grandParentObject.type === 'adapter') {
                        object.common.icon = `../${grandParentObject.common.name}.admin/${object.common.icon}`;
                    }
                }
            } else {
                object.common.icon = parentObject.common.icon;
                if (parentObject.type === 'instance' || parentObject.type === 'adapter') {
                    object.common.icon = `../${parentObject.common.name}.admin/${object.common.icon}`;
                }
            }
        }
        if (object.common.icon && object.common.icon.startsWith('/')) {
            const parts = id.split('.');
            // add instance name
            object.common.icon = `../adapter/${parts[0]}${object.common.icon}`;
        }
    }

    async propertiesUpdate(): Promise<void> {
        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData === actualRxData) {
            return;
        }

        this.lastRxData = actualRxData;

        const objects: {
            main?: { common: ioBroker.StateCommon; _id: string };
            secondary?: { common: ioBroker.StateCommon; _id: string };
        } = {};
        const ids: string[] = [];
        if (this.state.rxData['oid-main'] && this.state.rxData['oid-main'] !== 'nothing_selected') {
            ids.push(this.state.rxData['oid-main']);
        }
        if (this.state.rxData['oid-secondary'] && this.state.rxData['oid-secondary'] !== 'nothing_selected') {
            ids.push(this.state.rxData['oid-secondary']);
        }

        const _objects = ids.length ? await this.props.context.socket.getObjectsById(ids) : {};

        // try to find icons for all OIDs
        if (this.state.rxData['oid-main'] && this.state.rxData['oid-main'] !== 'nothing_selected') {
            // read object itself
            const object = _objects[this.state.rxData['oid-main']];
            if (!object) {
                objects.main = { common: {} as ioBroker.StateCommon, _id: '' };
            } else {
                object.common ||= {} as ioBroker.StateCommon;
                await this.getIcon(this.state.rxData['oid-main'], object);
                objects.main = { common: object.common as ioBroker.StateCommon, _id: object._id };
            }
        }

        if (this.state.rxData['oid-secondary'] && this.state.rxData['oid-secondary'] !== 'nothing_selected') {
            // read object itself
            const object = _objects[this.state.rxData['oid-secondary']];
            if (!object) {
                objects.secondary = { common: {} as ioBroker.StateCommon, _id: '' };
            } else {
                object.common = object.common || {};
                await this.getIcon(this.state.rxData['oid-secondary'], object);
                objects.secondary = { common: object.common as ioBroker.StateCommon, _id: object._id };
            }
        }

        const defaultHistory = this.props.context.systemConfig?.common?.defaultHistory;
        const mainHistoryInstance = Generic.getHistoryInstance(objects.main, defaultHistory);
        const secondaryHistoryInstance = Generic.getHistoryInstance(objects.secondary, defaultHistory);

        const isChart =
            (this.state.rxData.noChart !== true && this.state.rxData.noChart !== 'true' && !!mainHistoryInstance) ||
            (this.state.rxData['noChart-secondary'] !== true &&
                this.state.rxData['noChart-secondary'] !== 'true' &&
                !!secondaryHistoryInstance);

        const newState: Partial<ActualState> = { objects, isChart };

        if (this.mainTimer) {
            clearInterval(this.mainTimer);
            this.mainTimer = undefined;
        }
        let changed = false;

        if (
            this.state.rxData.noChart !== true &&
            this.state.rxData.noChart !== 'true' &&
            mainHistoryInstance &&
            objects.main?.common?.custom?.[mainHistoryInstance]
        ) {
            await this.readHistory(objects.main._id, mainHistoryInstance);
            this.mainTimer ||= setInterval(
                async () => {
                    await this.readHistory(this.state.objects.main!._id, mainHistoryInstance);
                    if (
                        this.state.rxData['noChart-secondary'] !== true &&
                        this.state.rxData['noChart-secondary'] !== 'true' &&
                        secondaryHistoryInstance &&
                        this.state.objects.secondary?.common?.custom?.[secondaryHistoryInstance]
                    ) {
                        await this.readHistory(this.state.objects.secondary._id, secondaryHistoryInstance);
                    }
                },
                parseInt(this.state.rxData.updateInterval, 10) * 1000 || 60000,
            ); // every minute by default
        } else if (this.state.chartData[this.state.rxData['oid-main']]) {
            // delete chart data
            this.state.chartData[this.state.rxData['oid-main']] = null;
            changed = true;
        }
        if (
            this.state.rxData['noChart-secondary'] !== true &&
            this.state.rxData['noChart-secondary'] !== 'true' &&
            secondaryHistoryInstance &&
            objects.secondary?.common?.custom?.[secondaryHistoryInstance]
        ) {
            await this.readHistory(objects.secondary._id, secondaryHistoryInstance);
            this.mainTimer ||= setInterval(
                () => this.readHistory(this.state.objects.secondary!._id, secondaryHistoryInstance),
                parseInt(this.state.rxData.updateInterval, 10) * 60 || 60000,
            ); // every minute by default
        } else if (this.state.chartData[this.state.rxData['oid-secondary']]) {
            // delete chart data
            this.state.chartData[this.state.rxData['oid-secondary']] = null;
            changed = true;
        }

        if (
            changed ||
            JSON.stringify(objects) !== JSON.stringify(this.state.objects) ||
            isChart !== this.state.isChart
        ) {
            this.setState(newState as Actual['state']);
        }
    }

    static convertData(
        values: ioBroker.State[],
        chart: {
            min?: number;
            max?: number;
        },
    ): { value: [ts: number, val: number] }[] {
        const data: { value: [ts: number, val: number] }[] = [];
        if (!values?.length) {
            return data;
        }
        for (let i = 0; i < values.length; i++) {
            if (values[i].val === true) {
                values[i].val = 1;
            } else if (values[i].val === false) {
                values[i].val = 0;
            }

            data.push({ value: [values[i].ts, values[i].val as number] });
        }

        if (chart.min === undefined || chart.max === undefined) {
            chart.min = values[0].ts;
            chart.max = values[values.length - 1].ts;
        }

        return data;
    }

    readHistory = async (id: string, historyInstance: string): Promise<void> => {
        const timeInterval = this.state.rxData.timeInterval || 12;
        const now = new Date();
        now.setHours(now.getHours() - timeInterval);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);
        const start = now.getTime();
        const end = Date.now();

        const options: ioBroker.GetHistoryOptions = {
            instance: historyInstance,
            start,
            end,
            step: 1800000, // 30 minutes
            from: false,
            ack: false,
            q: false,
            addId: false,
            aggregate: 'minmax',
        };

        let chart: ioBroker.State[];
        return this.props.context.socket
            .getHistory(id, options)
            .then(_chart => {
                chart = _chart;
                return this.props.context.socket.getState(id);
            })
            .then(state => {
                // sort
                if (chart?.[0] && chart[0].ts !== start) {
                    chart.unshift({ ts: start, val: null } as ioBroker.State);
                }
                if (chart) {
                    chart.sort((a, b) => (a.ts > b.ts ? 1 : a.ts < b.ts ? -1 : 0)).filter(e => e.val !== null);
                    if (state && state.val !== null && state.val !== undefined) {
                        chart.push({ ts: Date.now(), val: state.val } as ioBroker.State);
                    }

                    const _chart: { min?: number; max?: number } = {};
                    const data = Actual.convertData(chart, _chart);
                    const chartData = this.state.chartData;
                    chartData[id] = { data, min: _chart.min!, max: _chart.max! };
                    this.setState({ chartData });
                }
            })
            .catch(e => console.error(`Cannot read history: ${e}`));
    };

    async componentDidMount(): Promise<void> {
        super.componentDidMount();
        await this.propertiesUpdate();
    }

    componentWillUnmount(): void {
        if (this.mainTimer) {
            clearInterval(this.mainTimer);
            this.mainTimer = undefined;
        }
        super.componentWillUnmount();
    }

    async onRxDataChanged(): Promise<void> {
        await this.propertiesUpdate();
    }

    static getColor(color: string, opacity: number): string {
        let r: number;
        let g: number;
        let b: number;
        if (color.startsWith('#')) {
            r = parseInt(color.substring(1, 3), 16);
            g = parseInt(color.substring(3, 5), 16);
            b = parseInt(color.substring(5, 7), 16);
        } else if (color.startsWith('rgb(')) {
            const parts = color.replace('rgb(', '').replace(')', '').split(',');
            r = parseInt(parts[0], 10);
            g = parseInt(parts[1], 10);
            b = parseInt(parts[2], 10);
        } else if (color.startsWith('rgba(')) {
            const parts = color.replace('rgba(', '').replace(')', '').split(',');
            r = parseInt(parts[0], 10);
            g = parseInt(parts[1], 10);
            b = parseInt(parts[2], 10);
        }
        return `rgba(${r!},${g!},${b!},${opacity})`;
    }

    getOptions(): EChartsOption {
        const series: LineSeriesOption[] = [];
        if (
            this.state.chartData[this.state.rxData['oid-main']] &&
            this.state.rxData.noChart !== true &&
            this.state.rxData.noChart !== 'true'
        ) {
            let name = this.state.rxData['title-main'] || Generic.getText(this.state.objects?.main?.common?.name || '');
            if (!name) {
                if (this.state.objects?.secondary?.common?.role?.includes('temperature')) {
                    name = Generic.t('temperature').replace('vis_2_widgets_material_', '');
                }
            }
            const mainColor = Actual.getColor(this.state.rxData['color-main'] || '#F3B11F', 0.65);
            const mainBackgroundColor = Actual.getColor(this.state.rxData['color-main'] || '#F3B11F', 0.14);

            series.push({
                areaStyle: {
                    color: mainBackgroundColor,
                },
                lineStyle: {
                    color: mainColor,
                },
                type: 'line',
                smooth: true,
                showSymbol: false,
                // itemStyle: { normal: { areaStyle: { type: 'default' } } },
                data: this.state.chartData[this.state.rxData['oid-main']]!.data,
                // areaStyle: { type: 'default' },
                name,
            });
        }
        if (
            this.state.chartData[this.state.rxData['oid-secondary']] &&
            this.state.rxData['noData-secondary'] !== true &&
            this.state.rxData['noData-secondary'] !== 'true'
        ) {
            let name =
                this.state.rxData['title-secondary'] ||
                Generic.getText(this.state.objects?.secondary?.common?.name || '');
            if (!name) {
                if (this.state.objects?.secondary?.common?.role?.includes('humidity')) {
                    name = Generic.t('humidity').replace('vis_2_widgets_material_', '');
                }
            }
            const secondaryColor = Actual.getColor(this.state.rxData['color-secondary'] || '#F3B11F', 0.65);
            const secondaryBackgroundColor = Actual.getColor(this.state.rxData['color-secondary'] || '#F3B11F', 0.14);

            series.push({
                areaStyle: {
                    color: secondaryBackgroundColor,
                },
                lineStyle: {
                    color: secondaryColor,
                },
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: this.state.chartData[this.state.rxData['oid-secondary']]!.data,
                name,
            });
        }

        const xAxis: TimeAxisBaseOption = {
            show: false,
            // @ts-expect-error wrong typing
            boundaryGap: false,
            type: 'time',
        };

        return {
            animation: false,
            backgroundColor: 'transparent',
            grid: {
                show: false,
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
            },
            legend: undefined,
            calculable: true,
            // @ts-expect-error wrong typing
            xAxis,
            yAxis: {
                show: false,
            },
            series,
        };
    }

    componentDidUpdate(): void {
        if (this.refContainer.current && this.state.containerHeight !== this.refContainer.current.clientHeight) {
            this.setState({ containerHeight: this.refContainer.current.clientHeight });
        }
    }

    renderDialog(): React.ReactNode {
        if (!this.state.showDialog) {
            return null;
        }
        const mainColor = Actual.getColor(this.state.rxData['color-main'] || '#F3B11F', 0.65);
        const mainBackgroundColor = Actual.getColor(this.state.rxData['color-main'] || '#F3B11F', 0.14);
        const secondaryColor = Actual.getColor(this.state.rxData['color-secondary'] || '#F3B11F', 0.65);
        const secondaryBackgroundColor = Actual.getColor(this.state.rxData['color-secondary'] || '#F3B11F', 0.14);

        return (
            <Dialog
                sx={{ '& .MuiDialog-paper': { height: '100%' } }}
                maxWidth="lg"
                fullWidth
                open={!0}
                onClose={() => this.setState({ showDialog: false })}
            >
                <DialogTitle>
                    {this.state.rxData.widgetTitle}
                    <IconButton
                        style={{ float: 'right' }}
                        onClick={() => this.setState({ showDialog: false })}
                    >
                        <IconClose />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <ObjectChart
                        t={(key: string) => Generic.t(key)}
                        lang={Generic.getLanguage()}
                        socket={this.props.context.socket}
                        obj={this.state.objects?.main || this.state.objects?.secondary}
                        obj2={this.state.objects?.main ? this.state.objects?.secondary : null}
                        unit={
                            this.state.objects?.main
                                ? this.state.rxData['unit-main'] || this.state.objects.main.common?.unit || ''
                                : this.state.rxData['unit-secondary'] ||
                                  this.state.objects?.secondary?.common?.unit ||
                                  ''
                        }
                        unit2={this.state.rxData['unit-secondary'] || this.state.objects?.secondary?.common?.unit || ''}
                        title={
                            this.state.objects?.main
                                ? this.state.rxData['title-main'] ||
                                  Generic.getText(this.state.objects.main.common?.name)
                                : this.state.rxData['title-secondary'] ||
                                  Generic.getText(this.state.objects?.secondary?.common?.name || '')
                        }
                        title2={
                            this.state.rxData['title-secondary'] ||
                            Generic.getText(this.state.objects?.secondary?.common?.name || '')
                        }
                        objLineType="line"
                        obj2LineType="line"
                        objColor={mainColor}
                        obj2Color={secondaryColor}
                        objBackgroundColor={mainBackgroundColor}
                        obj2BackgroundColor={secondaryBackgroundColor}
                        themeType={this.props.context.themeType}
                        historyInstance={Generic.getHistoryInstance(
                            this.state.objects.main || this.state.objects.secondary,
                            this.props.context.systemConfig?.common?.defaultHistory || 'history.0',
                        )}
                        historyInstance2={Generic.getHistoryInstance(
                            this.state.objects.secondary,
                            this.props.context.systemConfig?.common?.defaultHistory || 'history.0',
                        )}
                        noToolbar={false}
                        systemConfig={this.props.context.systemConfig}
                        dateFormat={this.props.context.systemConfig.common.dateFormat}
                        chartTitle=""
                    />
                </DialogContent>
            </Dialog>
        );
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | React.JSX.Element[] | null {
        super.renderWidgetBody(props);

        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData !== actualRxData) {
            this.updateTimeout ||= setTimeout(async () => {
                this.updateTimeout = undefined;
                await this.propertiesUpdate();
            }, 50);
        }

        const onCardClick =
            !this.state.showDialog && this.state.isChart
                ? (e?: React.MouseEvent<HTMLDivElement>) => {
                      e?.preventDefault();
                      e?.stopPropagation();
                      this.setState({ showDialog: true });
                  }
                : undefined;

        const classUpdateVal = this.props.context.themeType === 'dark' ? styles.newValueDark : styles.newValueLight;

        const mainValue =
            this.state.objects?.main && this.state.values[`${this.state.rxData['oid-main']}.val`] !== undefined
                ? this.formatValue(
                      this.state.values[`${this.state.rxData['oid-main']}.val`],
                      this.state.rxData.digits_after_comma_main,
                  )
                : undefined;

        const secondaryValue =
            this.state.objects?.secondary &&
            this.state.values[`${this.state.rxData['oid-secondary']}.val`] !== undefined
                ? this.formatValue(
                      this.state.values[`${this.state.rxData['oid-secondary']}.val`],
                      this.state.rxData.digits_after_comma_secondary,
                  )
                : undefined;

        let mainIcon: React.ReactNode = this.state.rxData['icon-main'] || this.state.objects?.main?.common?.icon;
        if (mainIcon) {
            mainIcon = (
                <Icon
                    src={mainIcon as string}
                    style={{ ...styles.mainIcon, width: 24, color: this.state.rxData['color-main'] }}
                />
            );
        } else if (
            this.state.objects?.main?.common?.role?.includes('temperature') ||
            this.state.objects?.main?.common?.unit?.includes('°')
        ) {
            mainIcon = <ThermostatIcon style={styles.mainIcon} />;
        } else {
            mainIcon = null;
        }

        let secondaryIcon: React.ReactNode =
            this.state.rxData['icon-secondary'] || this.state.objects?.secondary?.common?.icon;
        if (secondaryIcon) {
            secondaryIcon = (
                <Icon
                    src={secondaryIcon as string}
                    style={{ ...styles.secondaryIcon, width: 20, color: this.state.rxData['color-secondary'] }}
                />
            );
        } else if (this.state.objects?.secondary?.common?.role?.includes('humidity')) {
            secondaryIcon = <HumidityIcon style={styles.secondaryIcon} />;
        } else {
            secondaryIcon = null;
        }
        const mainFontSize = parseInt(this.state.rxData['font-size-main'], 10) || 0;
        const secondaryFontSize = parseInt(this.state.rxData['font-size-secondary'], 10) || 0;

        const content = (
            <div
                style={{
                    width: '100%',
                    height:
                        this.state.rxData.noCard !== true &&
                        this.state.rxData.noCard !== 'true' &&
                        !props.widget.usedInWidget &&
                        this.state.rxData.widgetTitle
                            ? 'calc(100% - 32px)'
                            : '100%',
                }}
                ref={this.refContainer}
            >
                <style>
                    {`
@keyframes vis-2-widgets-material-newValueAnimationLight {
    0% {
        color: #00bd00;
    }
    80% {
        color: #008000;
    }
    100% {
        color: rgba(243,177,31);
    }
}
@keyframes vis-2-widgets-material-newValueAnimationDark {
    0% {
        color: #008000;
    }
    80% {
        color: #00bd00;
    }
    100% {
        color: rgba(243,177,31);
    }
}                
                `}
                </style>
                {mainValue !== undefined ? (
                    <Tooltip
                        title={
                            this.state.rxData['title-main'] ||
                            Generic.getText(this.state.objects?.main?.common?.name || '') ||
                            null
                        }
                        slotProps={{ popper: { sx: styles.tooltip } }}
                    >
                        <div style={styles.mainDiv}>
                            {mainIcon}
                            <span
                                key={`${mainValue}valText`}
                                style={{
                                    ...styles.temperatureValue,
                                    ...classUpdateVal,
                                    fontSize: mainFontSize || undefined,
                                    fontStyle: this.state.rxData['font-style-main'],
                                    color: this.state.rxData['color-main'],
                                }}
                            >
                                {mainValue}
                            </span>
                            <span
                                style={{
                                    ...styles.temperatureUnit,
                                    fontSize: mainFontSize ? mainFontSize * 0.5 : undefined,
                                    fontStyle: this.state.rxData['font-style-main'],
                                    color: this.state.rxData['color-main'],
                                }}
                            >
                                {this.state.rxData['unit-main'] || this.state.objects?.main?.common?.unit}
                            </span>
                        </div>
                    </Tooltip>
                ) : null}
                {secondaryValue !== undefined ? (
                    <Tooltip
                        title={
                            this.state.rxData['title-secondary'] ||
                            Generic.getText(this.state.objects?.secondary?.common?.name || '') ||
                            null
                        }
                        slotProps={{ popper: { sx: styles.tooltip } }}
                    >
                        <div style={styles.secondaryDiv}>
                            {secondaryIcon}
                            <span
                                key={`${secondaryValue}valText`}
                                style={{
                                    ...styles.humidityValue,
                                    ...classUpdateVal,
                                    fontSize: secondaryFontSize || undefined,
                                    fontStyle: this.state.rxData['font-style-secondary'],
                                    color: this.state.rxData['color-secondary'],
                                }}
                            >
                                {secondaryValue}
                            </span>
                            <span
                                style={{
                                    ...styles.humidityUnit,
                                    fontSize: secondaryFontSize ? secondaryFontSize / 2 : undefined,
                                    fontStyle: this.state.rxData['font-style-secondary'],
                                    color: this.state.rxData['color-secondary'],
                                }}
                            >
                                {this.state.rxData['unit-secondary'] || this.state.objects?.secondary?.common?.unit}
                            </span>
                        </div>
                    </Tooltip>
                ) : null}
                {this.state.containerHeight &&
                (this.state.chartData[this.state.rxData['oid-main']] ||
                    this.state.chartData[this.state.rxData['oid-secondary']]) ? (
                    <ReactEchartsCore
                        echarts={echarts}
                        option={this.getOptions()}
                        notMerge
                        lazyUpdate
                        theme={this.props.context.themeType === 'dark' ? 'dark' : ''}
                        style={{
                            ...styles.chart,
                            height: this.state.containerHeight - 26,
                            width: '100%',
                        }}
                        opts={{ renderer: 'svg' }}
                    />
                ) : null}
                {this.renderDialog()}
            </div>
        );

        if (this.state.rxData.noCard === true || this.state.rxData.noCard === 'true' || props.widget.usedInWidget) {
            return content;
        }

        return this.wrapContent(
            content,
            null,
            {
                paddingLeft: 0,
                paddingRight: 0,
                paddingBottom: 0,
                height: 'calc(100% - 16px)',
            },
            { paddingLeft: 16 },
            onCardClick,
        );
    }
}
