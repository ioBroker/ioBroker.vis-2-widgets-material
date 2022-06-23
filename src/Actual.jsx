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
                        name: 'temperature',
                        type: 'id',
                    },
                    {
                        name: 'humidity',
                        type: 'id',
                    },
                ],
            },
            ],
            visPrev: 'widgets/material-widgets/img/prev_switch.png',
        };
    }

    getSubscribeState = (id, cb) => {
        this.props.socket.getState(id).then(result => cb(result));
        this.props.socket.subscribeState(id, (resultId, result) => cb(result));
    };

    async componentDidMount() {
        super.componentDidMount();

        const now = new Date();
        if (this.state.data.temperature) {
            this.props.socket.getHistory(this.state.data.temperature, {
                instance:  'history.0',
                start:     now.getTime() - 1000 * 60 * 60 * 24,
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
                });
        }
        if (this.state.data.humidity) {
            this.props.socket.getHistory(this.state.data.humidity, {
                instance:  'history.0',
                start:     now.getTime() - 1000 * 60 * 60 * 24,
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
                });
        }
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Actual.getWidgetInfo();
    }

    getOption(type) {
        return {
            color: ['#009C95', '#21ba45'],
            title : {
                text: type === 'temperature' ? 'Temperature' : 'Humidity',
                textStyle: {
                    fontFamily: 'lato',
                },
            },
            tooltip : {
                trigger: 'axis',
            },
            calculable : true,
            xAxis : [
                {
                    type: 'time',
                    boundaryGap:false,
                },
            ],
            yAxis : [
                {
                    type : 'value',
                },
            ],
            series : [
                {
                    backgroundColor: '#4D86FF',
                    name: type === 'temperature' ? 'Temperature' : 'Humidity',
                    type:'line',
                    smooth:true,
                    itemStyle: { normal: { areaStyle: { type: 'default' } } },
                    data: this.state[type === 'temperature' ? 'temperatureChartValues' : 'humidityChartValues'].map(value => [value.ts, value.val]),
                },
            ],
        };
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        return <div style={{ textAlign: 'center' }}>
            <Card
                style={{ width: this.state.style?.width, height: this.state.style?.height }}
            >
                {this.state.temperatureChartValues ?
                    <ReactEchartsCore
                        echarts={echarts}
                        option={this.getOption('temperature')}
                        notMerge
                        lazyUpdate
                        theme={this.props.themeType === 'dark' ? 'dark' : ''}
                        style={{ height: '200px', width: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                    : null}
                {this.state.humidityChartValues ?
                    <ReactEchartsCore
                        echarts={echarts}
                        option={this.getOption('humidity')}
                        notMerge
                        lazyUpdate
                        theme={this.props.themeType === 'dark' ? 'dark' : ''}
                        style={{ height: '200px', width: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                    : null}
            </Card>
        </div>;
    }
}

export default Actual;
