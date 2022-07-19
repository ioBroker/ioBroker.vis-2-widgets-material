import React from 'react';
import {
    Card,
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
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import VisRxWidget from './visRxWidget';

echarts.use([TimelineComponent, ToolboxComponent, TitleComponent, TooltipComponent, GridComponent, LineChart, SVGRenderer]);

class Actual extends (window.visRxWidget || VisRxWidget) {
    constructor(props) {
        super(props);
        this.state.showDialog = false;
        this.state.dialogTab = 0;
        this.onStateChanged = this.onStateChanged.bind(this);
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterialActual',
            visSet: 'material-widgets',
            visName: 'Actual',
            visAttrs_: 'name;oid-mode;oid-temp;oid-temp-state;oid-power',
            visAttrs: [{
                name: 'common',
                fields: [
                    {
                        name: 'name',
                    },
                    {
                        name: 'oid-temperature',
                        type: 'id',
                    },
                    {
                        name: 'oid-humidity',
                        type: 'id',
                    },
                ],
            },
            ],
            visPrev: 'widgets/material-widgets/img/prev_switch.png',
        };
    }

    onStateChanged(id, state, doNotApplyState) {
        const result = super.onStateChanged(id, state, doNotApplyState);

        const now = new Date();

        if (this.state.data['oid-temperature'] && id === this.state.data['oid-temperature']) {
            this.props.socket.getHistory(this.state.data['oid-temperature'], {
                instance:  'history.0',
                start:     now.getTime() - 1000 * 60 * 5,
                end:       now.getTime(),
                // step:      3600000, // hourly
                limit:     1,
                from:      false,
                ack:       false,
                q:         false,
                addID:     false,
                aggregate: 'none',
            })
                .then(values => {
                    console.log(values);
                    this.setState({ temperatureChartValues: values });
                }).catch(() => this.setState({ temperatureChartValues: null }));
        }
        if (this.state.data['oid-humidity'] && id === this.state.data['oid-humidity']) {
            this.props.socket.getHistory(this.state.data['oid-humidity'], {
                instance:  'history.0',
                start:     now.getTime() - 1000 * 60 * 5,
                end:       now.getTime(),
                // step:      3600000, // hourly
                limit:     1,
                from:      false,
                ack:       false,
                q:         false,
                addID:     false,
                aggregate: 'none',
            })
                .then(values => {
                    console.log(values);
                    this.setState({ humidityChartValues: values });
                }).catch(() => this.setState({ temperatureChartValues: null }));
        }

        return result;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Actual.getWidgetInfo();
    }

    getOption(type) {
        return {
            color: ['#009C95', '#21ba45'],
            title: {
                text: type === 'temperature' ? 'Temperature' : 'Humidity',
                textStyle: {
                    fontFamily: 'lato',
                },
            },
            tooltip: {
                trigger: 'axis',
            },
            calculable : true,
            xAxis: [
                {
                    type: 'time',
                    boundaryGap:false,
                    // min:     now.getTime() - 1000 * 60 * 60 * 5,
                    // max:       now.getTime(),
                },
            ],
            yAxis: [
                {
                    type : 'value',
                },
            ],
            series: [
                {
                    backgroundColor: '#4D86FF',
                    name: type === 'temperature' ? 'Temperature' : 'Humidity',
                    type:'line',
                    smooth: true,
                    itemStyle: { normal: { areaStyle: { type: 'default' } } },
                    data: this.state[type === 'temperature' ? 'temperatureChartValues' : 'humidityChartValues'].map(value => [value.ts, value.val]),
                },
            ],
        };
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        return <Card
            style={{ width: '100%', height: '100%' }}
        >
            {this.state.values[`${this.state.data['oid-temperature']}.val`] && this.state.temperatureChartValues ?
                <ReactEchartsCore
                    echarts={echarts}
                    option={this.getOption('temperature')}
                    notMerge
                    lazyUpdate
                    theme={this.props.themeType === 'dark' ? 'dark' : ''}
                    style={{ height: 200, width: '100%' }}
                    opts={{ renderer: 'svg' }}
                />
                : null}
            {this.state.values[`${this.state.data['oid-humidity']}.val`] && this.state.humidityChartValues ?
                <ReactEchartsCore
                    echarts={echarts}
                    option={this.getOption('humidity')}
                    notMerge
                    lazyUpdate
                    theme={this.props.themeType === 'dark' ? 'dark' : ''}
                    style={{ height: 200, width: '100%' }}
                    opts={{ renderer: 'svg' }}
                />
                : null}
        </Card>;
    }
}

export default Actual;
