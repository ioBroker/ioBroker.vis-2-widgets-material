import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import {
    Dialog, DialogContent, DialogTitle, IconButton,
} from '@mui/material';

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

import {
    Close as IconClose,
    DeviceThermostat as ThermostatIcon,
    Opacity as HumidityIcon,
} from '@mui/icons-material';

import { i18n as I18n, Utils } from '@iobroker/adapter-react-v5';
import ObjectChart from './ObjectChart';
import Generic from './Generic';

echarts.use([TimelineComponent, ToolboxComponent, TitleComponent, TooltipComponent, GridComponent, LineChart, LegendComponent, SVGRenderer]);

const styles = () => ({
    chart: {
        height: 'calc(100% - 40px)',
        width: '100%',
    },
    temperatureDiv: {
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
    temperatureIcon: {
        verticalAlign: 'middle',
        fontSize: 20,
    },
    humidityDiv: {
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
    humidityIcon: {
        verticalAlign: 'middle',
        fontSize: 20,
    },
    newValueLight: {
        animation: '$newValueAnimationLight 2s ease-in-out',
    },
    '@keyframes newValueAnimationLight': {
        '0%': {
            color: '#00bd00',
        },
        '80%': {
            color: '#008000',
        },
        '100%': {
            color: 'rgba(243,177,31)',
        },
    },
    newValueDark: {
        animation: '$newValueAnimationDark 2s ease-in-out',
    },
    '@keyframes newValueAnimationDark': {
        '0%': {
            color: '#008000',
        },
        '80%': {
            color: '#00bd00',
        },
        '100%': {
            color: 'rgba(243,177,31)',
        },
    },
});

class Actual extends Generic {
    constructor(props) {
        super(props);
        this.state.showDialog = false;
        this.state.dialogTab = 0;
        this.onStateChanged = this.onStateChanged.bind(this);
        this.refContainer = React.createRef();
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Actual',
            visSet: 'vis-2-widgets-material',

            visSetLabel: 'vis_2_widgets_material_set_label', // Label of widget set
            visSetColor: '#0783ff', // Color of widget set

            visWidgetLabel: 'vis_2_widgets_material_actual_temperature',  // Label of widget
            visName: 'Actual temperature',
            visAttrs: [{
                name: 'common',
                fields: [
                    {
                        name: 'name',
                        label: 'vis_2_widgets_material_name',
                    },
                    {
                        name: 'timeInterval',
                        label: 'vis_2_widgets_material_hours',
                        type: 'slider',
                        min: 0,
                        max: 48,
                        step: 1,
                        default: 12,
                    },
                    {
                        label: 'vis_2_widgets_material_temperature_oid',
                        name: 'oid-temperature',
                        type: 'id',
                    },
                    {
                        label: 'vis_2_widgets_material_humidity_oid',
                        name: 'oid-humidity',
                        type: 'id',
                    },
                ],
            }],
            visDefaultStyle: {
                width: '100%',
                height: 120,
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_actual.png',
        };
    }

    async propertiesUpdate() {
        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData === actualRxData) {
            return;
        }

        this.lastRxData = actualRxData;

        const objects = {};

        // try to find icons for all OIDs
        if (this.state.rxData['oid-temperature'] && this.state.rxData['oid-temperature'] !== 'nothing_selected') {
            // read object itself
            const object = await this.props.socket.getObject(this.state.rxData['oid-temperature']);
            if (!object) {
                objects.temp = { common: {} };
            } else {
                object.common = object.common || {};
                if (!object.common.icon && (object.type === 'state' || object.type === 'channel')) {
                    const idArray = this.state.rxData['oid-temperature'].split('.');

                    // read channel
                    const parentObject = await this.props.socket.getObject(idArray.slice(0, -1).join('.'));
                    if (!parentObject?.common?.icon && (object.type === 'state' || object.type === 'channel')) {
                        const grandParentObject = await this.props.socket.getObject(idArray.slice(0, -2).join('.'));
                        if (grandParentObject?.common?.icon) {
                            object.common.icon = grandParentObject.common.icon;
                        }
                    } else {
                        object.common.icon = parentObject.common.icon;
                    }
                }
                objects.temp = { common: object.common, _id: object._id };
            }
        }

        if (this.state.rxData['oid-humidity'] && this.state.rxData['oid-humidity'] !== 'nothing_selected') {
            // read object itself
            const object = await this.props.socket.getObject(this.state.rxData['oid-humidity']);
            if (!object) {
                objects.humidity = { common: {} };
            } else {
                object.common = object.common || {};
                if (!object.common.icon && (object.type === 'state' || object.type === 'channel')) {
                    const idArray = this.state.rxData['oid-humidity'].split('.');

                    // read channel
                    const parentObject = await this.props.socket.getObject(idArray.slice(0, -1).join('.'));
                    if (!parentObject?.common?.icon && (object.type === 'state' || object.type === 'channel')) {
                        const grandParentObject = await this.props.socket.getObject(idArray.slice(0, -2).join('.'));
                        if (grandParentObject?.common?.icon) {
                            object.common.icon = grandParentObject.common.icon;
                        }
                    } else {
                        object.common.icon = parentObject.common.icon;
                    }
                }
                objects.humidity = { common: object.common, _id: object._id };
            }
        }

        const isChart = (objects.temp?.common?.custom && objects.temp.common.custom[this.props.systemConfig?.common?.defaultHistory]) ||
            (objects.humidity?.common?.custom && objects.humidity.common.custom[this.props.systemConfig?.common?.defaultHistory]);

        if (JSON.stringify(objects) !== JSON.stringify(this.state.objects) || isChart !== this.state.isChart) {
            this.setState({ objects, isChart });
        }
    }

    static convertData = (values, chart) => {
        const data = [];
        if (!values || !values.length) {
            return data;
        }
        for (let i = 0; i < values.length; i++) {
            if (values[i].val === true) {
                values[i].val = 1;
            } else if (values[i].val === false) {
                values[i].val = 0;
            }

            data.push({ value: [values[i].ts, values[i].val] });
        }
        if (!chart.min) {
            chart.min = values[0].ts;
            chart.max = values[values.length - 1].ts;
        }

        return data;
    };

    readHistory = async id => {
        const timeInterval = this.state.rxData.timeInterval || 12;
        const now = new Date();
        now.setHours(now.getHours() - timeInterval);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);
        const start = now.getTime();
        const end = Date.now();

        const options = {
            instance: this.props.systemConfig?.common?.defaultHistory || 'history.0',
            start,
            end,
            step: 1800000, // 30 minutes
            from: false,
            ack: false,
            q: false,
            addID: false,
            aggregate: 'minmax',
        };

        let chart;
        return this.props.socket.getHistory(id, options)
            .then(_chart => {
                chart = _chart;
                return this.props.socket.getState(id);
            })
            .then(state => {
                // sort
                if (chart && chart[0] && chart[0].ts !== start) {
                    chart.unshift({ ts: start, val: null });
                }
                if (chart) {
                    chart.sort((a, b) => (a.ts > b.ts ? 1 : (a.ts < b.ts ? -1 : 0))).filter(e => e.val !== null);
                    state && state.val !== null && state.val !== undefined && chart.push({ ts: Date.now(), val: state.val });

                    const _chart = {};
                    _chart.data = Actual.convertData(chart, _chart);
                    this.setState({ [`chart-data-${id}`]: _chart });
                }
            })
            .catch(e => console.error(`Cannot read history: ${e}`));
    };

    async componentDidMount() {
        super.componentDidMount();
        await this.propertiesUpdate();

        if (this.state.rxData['oid-temperature'] && this.state.rxData['oid-temperature'] !== 'nothing_selected') {
            await this.readHistory(this.state.rxData['oid-temperature']);
            this.tempTimer = setInterval(async () => {
                await this.readHistory(this.state.rxData['oid-temperature']);
                if (this.state.rxData['oid-humidity'] && this.state.rxData['oid-humidity'] !== 'nothing_selected') {
                    await this.readHistory(this.state.rxData['oid-humidity']);
                }
            }, 60000); // every minute
        }
        if (this.state.rxData['oid-humidity'] && this.state.rxData['oid-humidity'] !== 'nothing_selected') {
            await this.readHistory(this.state.rxData['oid-humidity']);
            if (!this.tempTimer) {
                this.tempTimer = setInterval(() =>
                    this.readHistory(this.state.rxData['oid-humidity']), 60000); // every minute
            }
        }
    }

    componentWillUnmount() {
        clearInterval(this.tempTimer);
        super.componentWillUnmount();
    }

    async onPropertiesUpdated() {
        super.onPropertiesUpdated();
        await this.propertiesUpdate();
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Actual.getWidgetInfo();
    }

    getOptions() {
        const series = [];
        if (this.state[`chart-data-${this.state.rxData['oid-temperature']}`]) {
            series.push({
                backgroundColor: 'rgba(243,177,31,0.14)',
                color: 'rgba(243,177,31,0.65)',
                type: 'line',
                smooth: true,
                showSymbol: false,
                itemStyle: { normal: { areaStyle: { type: 'default' } } },
                data: this.state[`chart-data-${this.state.rxData['oid-temperature']}`].data,
                name: I18n.t('vis_2_widgets_material_temperature').replace('vis_2_widgets_material_', ''),
            });
        }
        if (this.state[`chart-data-${this.state.rxData['oid-humidity']}`]) {
            series.push({
                backgroundColor: 'rgba(77,134,255,0.14)',
                color: 'rgba(77,134,255,0.44)',
                type: 'line',
                smooth: true,
                showSymbol: false,
                itemStyle: { normal: { areaStyle: { type: 'default' } } },
                data: this.state[`chart-data-${this.state.rxData['oid-humidity']}`].data,
                name: I18n.t('vis_2_widgets_material_humidity').replace('vis_2_widgets_material_', ''),
            });
        }

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
            calculable : true,
            xAxis: {
                show: false,
                boundaryGap: false,
                type: 'time',
            },
            yAxis: {
                show: false,
            },
            series,
        };
    }

    componentDidUpdate() {
        if (this.refContainer.current && this.state.containerHeight !== this.refContainer.current.clientHeight) {
            this.setState({ containerHeight: this.refContainer.current.clientHeight });
        }
    }

    renderDialog() {
        if (!this.state.showDialog) {
            return null;
        }
        return <Dialog
            sx={{ '& .MuiDialog-paper': { height: '100%' } }}
            maxWidth="lg"
            fullWidth
            open={!0}
            onClose={() => this.setState({ showDialog: false })}
        >
            <DialogTitle>
                {this.state.rxData.name}
                <IconButton
                    style={{ float: 'right' }}
                    onClick={() => this.setState({ showDialog: false })}
                >
                    <IconClose />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <ObjectChart
                    t={I18n.t}
                    lang={I18n.getLanguage()}
                    socket={this.props.socket}
                    obj={this.state.objects.temp || this.state.objects.humidity}
                    obj2={this.state.objects.temp ? this.state.objects.humidity : null}
                    objLineType="line"
                    obj2LineType="line"
                    objColor={this.state.objects.temp ? 'rgba(243,177,31,0.65)' : 'rgba(77,134,255,0.44)'}
                    obj2Color="rgba(77,134,255,0.44)"
                    objBackgroundColor={this.state.objects.temp ? 'rgba(243,177,31,0.14)' : 'rgba(77,134,255,0.14)'}
                    obj2BackgroundColor="rgba(77,134,255,0.14)"
                    themeType={this.props.themeType}
                    defaultHistory={this.props.systemConfig?.common?.defaultHistory || 'history.0'}
                    noToolbar={false}
                    systemConfig={this.props.systemConfig}
                    dateFormat={this.props.systemConfig.common.dateFormat}
                />
            </DialogContent>
        </Dialog>;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData !== actualRxData) {
            this.updateTimeout = this.updateTimeout || setTimeout(async () => {
                this.updateTimeout = null;
                await this.propertiesUpdate();
            }, 50);
        }

        const onCardClick = !this.state.showDialog && this.state.isChart ? e => {
            e.preventDefault();
            e.stopPropagation();
            this.setState({ showDialog: true });
        } : undefined;

        const classUpdateVal = this.props.themeType === 'dark' ? this.props.classes.newValueDark : this.props.classes.newValueLight;

        const tempVal = this.state.objects && this.state.objects.temp && this.state.values[`${this.state.rxData['oid-temperature']}.val`] !== undefined ?
            this.formatValue(this.state.values[`${this.state.rxData['oid-temperature']}.val`]) : undefined;

        const humidityVal = this.state.objects && this.state.objects.humidity && this.state.values[`${this.state.rxData['oid-humidity']}.val`] !== undefined ?
            this.formatValue(this.state.values[`${this.state.rxData['oid-humidity']}.val`], 0) : undefined;

        const content = <div style={{ width: '100%', height: '100%' }} ref={this.refContainer}>
            {tempVal !== undefined ?
                <div className={this.props.classes.temperatureDiv}>
                    <ThermostatIcon className={this.props.classes.temperatureIcon} />
                    <span key={`${tempVal}valText`} className={Utils.clsx(this.props.classes.temperatureValue, classUpdateVal)}>{tempVal}</span>
                    <span className={this.props.classes.temperatureUnit}>{this.state.objects.temp.common.unit}</span>
                </div>
                : null}
            {humidityVal !== undefined ?
                <div className={this.props.classes.humidityDiv}>
                    <HumidityIcon className={this.props.classes.humidityIcon} />
                    <span key={`${humidityVal}valText`} className={Utils.clsx(this.props.classes.humidityValue, classUpdateVal)}>{humidityVal}</span>
                    <span className={this.props.classes.humidityUnit}>{this.state.objects.humidity.common.unit || '%'}</span>
                </div>
                : null}
            {this.state.containerHeight && (this.state[`chart-data-${this.state.rxData['oid-temperature']}`] || this.state[`chart-data-${this.state.rxData['oid-humidity']}`]) ?
                <ReactEchartsCore
                    className={this.props.classes.chart}
                    echarts={echarts}
                    option={this.getOptions()}
                    notMerge
                    lazyUpdate
                    theme={this.props.themeType === 'dark' ? 'dark' : ''}
                    style={{ height: this.state.containerHeight - 42, width: '100%' }}
                    opts={{ renderer: 'svg' }}
                />
                : null}
            {this.renderDialog()}
        </div>;

        return this.wrapContent(content, null, { paddingLeft: 0, paddingRight: 0 }, { paddingLeft: 16 }, onCardClick);
    }
}

Actual.propTypes = {
    systemConfig: PropTypes.object,
    socket: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default withStyles(styles)(Actual);
