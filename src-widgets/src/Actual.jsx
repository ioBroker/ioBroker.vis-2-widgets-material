import React from 'react';
import {
    Card, CardHeader, IconButton,
} from '@mui/material';
import { withStyles } from '@mui/styles';

import ReactEchartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
    GridComponent,
    ToolboxComponent,
    TooltipComponent,
    TitleComponent,
    TimelineComponent,
    LegendComponent
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';

import {
    DeviceThermostat as ThermostatIcon, MoreVert as MoreVertIcon,
    Opacity as HumidityIcon,
} from '@mui/icons-material';

import { VisRxWidget } from '@iobroker/vis-widgets-react-dev';
import { i18n as I18n } from '@iobroker/adapter-react-v5';

echarts.use([TimelineComponent, ToolboxComponent, TitleComponent, TooltipComponent, GridComponent, LineChart, LegendComponent, SVGRenderer]);

const styles = theme => ({
    root: {
        width: 'calc(100% - 8px)',
        height: 'calc(100% - 8px)',
        margin: 4,
    },
    chart: {
        height: 'calc(100% - 40px)',
        width: '100%'
    },
    container: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    mainName: {
        fontSize: 24,
        paddingTop: 16,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 4,
    },
    temperatureDiv: {
        marginLeft: 4,
        color: 'rgba(243,177,31)',
        display: 'inline-block',
        lineHeight: '24px',
    },
    temperatureValue: {
        verticalAlign: 'middle',
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
});

class Actual extends (window.visRxWidget || VisRxWidget) {
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
            visPrev: 'widgets/vis-2-widgets-material/img/prev_actual.png',
        };
    }

    async propertiesUpdate() {
        const objects = {};

        // try to find icons for all OIDs
        if (this.state.data['oid-temperature']) {
            // read object itself
            const object = await this.props.socket.getObject(this.state.data['oid-temperature']);
            if (!object) {
                objects.temp = { common: {} };
            } else {
                object.common = object.common || {};
                if (!object.common.icon && (object.type === 'state' || object.type === 'channel')) {
                    const idArray = this.state.data['oid-temperature'].split('.');

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
                objects.temp = object;
            }
        }
        if (this.state.data['oid-humidity']) {
            // read object itself
            const object = await this.props.socket.getObject(this.state.data['oid-humidity']);
            if (!object) {
                objects.humidity = { common: {} };
            } else {
                object.common = object.common || {};
                if (!object.common.icon && (object.type === 'state' || object.type === 'channel')) {
                    const idArray = this.state.data['oid-humidity'].split('.');

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
                objects.humidity = object;
            }
        }

        this.setState({ objects });
    }

    convertData = (values, chart) => {
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
    }

    readHistory = async id => {
        const timeInterval = this.state.data.timeInterval || 12;
        const now = new Date();
        now.setHours(now.getHours() - timeInterval);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);
        let start = now.getTime();
        let end = Date.now();

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
                    chart.sort((a, b) => a.ts > b.ts ? 1 : (a.ts < b.ts ? -1 : 0)).filter(e => e.val !== null);
                    state && state.val !== null && state.val !== undefined && chart.push({ts: Date.now(), val: state.val});

                    const _chart = {};
                    _chart.data = this.convertData(chart, _chart);
                    this.setState({ ['chart-data-' + id]: _chart });
                }
            })
            .catch(e =>
                console.error('Cannot read history: ' + e)
            );
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.propertiesUpdate();

        if (this.state.data['oid-temperature']) {
            await this.readHistory(this.state.data['oid-temperature']);
            this.tempTimer = setInterval(async () => {
                await this.readHistory(this.state.data['oid-temperature']);
                if (this.state.data['oid-humidity']) {
                    await this.readHistory(this.state.data['oid-humidity']);
                }
            }, 60000); // every minute
        }
        if (this.state.data['oid-humidity']) {
            await this.readHistory(this.state.data['oid-humidity']);
            if (!this.tempTimer) {
                this.tempTimer = setInterval(() => this.readHistory(this.state.data['oid-humidity']), 60000); // every minute
            }
        }
    }

    componentWillUnmount() {
        clearInterval(this.tempTimer);
        super.componentWillUnmount();
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Actual.getWidgetInfo();
    }

    getOptions() {
        const series = [];
        if (this.state['chart-data-' + this.state.data['oid-temperature']]) {
            series.push({
                backgroundColor: 'rgba(243,177,31,0.14)',
                color: 'rgba(243,177,31,0.65)',
                type: 'line',
                smooth: true,
                showSymbol: false,
                itemStyle: { normal: { areaStyle: { type: 'default' } } },
                data: this.state['chart-data-' + this.state.data['oid-temperature']].data,
                name: I18n.t('vis_2_widgets_material_temperature').replace('vis_2_widgets_material_', ''),
            });
        }
        if (this.state['chart-data-' + this.state.data['oid-humidity']]) {
            series.push({
                backgroundColor: 'rgba(77,134,255,0.14)',
                color: 'rgba(77,134,255,0.44)',
                type: 'line',
                smooth: true,
                showSymbol: false,
                itemStyle: { normal: { areaStyle: { type: 'default' } } },
                data: this.state['chart-data-' + this.state.data['oid-humidity']].data,
                name: I18n.t('vis_2_widgets_material_humidity').replace('vis_2_widgets_material_', ''),
            });
        }

        return {
            animation: false,
            grid: {
                show: false,
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
            },
            legend: undefined,
            tooltip: {
                trigger: 'axis',
            },
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

    formatValue(value, round) {
        if (typeof value === 'number') {
            if (round === 0) {
                value = Math.round(value);
            } else {
                value = Math.round(value * 100) / 100;
            }
            if (this.props.systemConfig?.common) {
                if (this.props.systemConfig.common.isFloatComma) {
                    value = value.toString().replace('.', ',');
                }
            }
        }

        return value === undefined || value === null ? '' : value.toString();
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        return <Card className={this.props.classes.root}>
            <div ref={this.refContainer} className={this.props.classes.container}>
                <div className={this.props.classes.mainName}>{this.state.data.name}</div>
                {this.state.objects && this.state.values[this.state.data['oid-temperature'] + '.val'] !== undefined ?
                    <div className={this.props.classes.temperatureDiv}>
                        <ThermostatIcon className={this.props.classes.temperatureIcon} />
                        <span className={this.props.classes.temperatureValue}>{this.formatValue(this.state.values[this.state.data['oid-temperature'] + '.val'])}</span>
                        <span className={this.props.classes.temperatureUnit}>{this.state.objects.temp.common.unit}</span>
                    </div>
                    : null}
                {this.state.objects && this.state.values[this.state.data['oid-humidity'] + '.val'] !== undefined ?
                    <div className={this.props.classes.humidityDiv}>
                        <HumidityIcon className={this.props.classes.humidityIcon} />
                        <span className={this.props.classes.humidityValue}>{this.formatValue(this.state.values[this.state.data['oid-humidity'] + '.val'], 0)}</span>
                        <span className={this.props.classes.humidityUnit}>{this.state.objects.humidity.common.unit || '%'}</span>
                    </div>
                    : null}
                {this.state.containerHeight && (this.state['chart-data-' + this.state.data['oid-temperature']] || this.state['chart-data-' + this.state.data['oid-humidity']]) ?
                    <ReactEchartsCore
                        className={this.props.classes.chart}
                        echarts={echarts}
                        option={this.getOptions()}
                        notMerge
                        lazyUpdate
                        theme={this.props.themeType === 'dark' ? 'dark' : ''}
                        style={{ height: this.state.containerHeight - 77, width: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                    : null}
            </div>
        </Card>;
    }
}

export default withStyles(styles)(Actual);