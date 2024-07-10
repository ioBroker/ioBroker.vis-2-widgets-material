import React, { createRef, Component } from 'react';
import PropTypes from 'prop-types';

// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { LocalizationProvider, TimePicker, DatePicker } from '@mui/x-date-pickers';
import {
    Paper,
    LinearProgress,
    InputLabel,
    MenuItem,
    FormControl,
    Select,
    Toolbar,
    Fab, Box,
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

/*
import frLocale from 'date-fns/locale/fr';
import ruLocale from 'date-fns/locale/ru';
import enLocale from 'date-fns/locale/en-US';
import esLocale from 'date-fns/locale/es';
import plLocale from 'date-fns/locale/pl';
import ptLocale from 'date-fns/locale/pt';
import itLocale from 'date-fns/locale/it';
import cnLocale from 'date-fns/locale/zh-CN';
import brLocale from 'date-fns/locale/pt-BR';
import deLocale from 'date-fns/locale/de';
import nlLocale from 'date-fns/locale/nl';
*/
import { Utils, withWidth } from '@iobroker/adapter-react-v5';

// icons
// import EchartsIcon from '../../assets/echarts.png';

echarts.use([TimelineComponent, ToolboxComponent, TitleComponent, TooltipComponent, GridComponent, LineChart, SVGRenderer]);

const SplitLineIcon = props => <svg viewBox="0 0 512 512" width={props.width || 20} height={props.height || props.width || 20} xmlns="http://www.w3.org/2000/svg" style={props.style}>
    <path fill="currentColor" d="M496 384H64V80c0-8.84-7.16-16-16-16H16C7.16 64 0 71.16 0 80v336c0 17.67 14.33 32 32 32h464c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM464 96H345.94c-21.38 0-32.09 25.85-16.97 40.97l32.4 32.4L288 242.75l-73.37-73.37c-12.5-12.5-32.76-12.5-45.25 0l-68.69 68.69c-6.25 6.25-6.25 16.38 0 22.63l22.62 22.62c6.25 6.25 16.38 6.25 22.63 0L192 237.25l73.37 73.37c12.5 12.5 32.76 12.5 45.25 0l96-96 32.4 32.4c15.12 15.12 40.97 4.41 40.97-16.97V112c.01-8.84-7.15-16-15.99-16z" />
</svg>;

/* const localeMap = {
    en: enLocale,
    fr: frLocale,
    ru: ruLocale,
    de: deLocale,
    es: esLocale,
    br: brLocale,
    nl: nlLocale,
    it: itLocale,
    pt: ptLocale,
    pl: plLocale,
    'zh-cn': cnLocale,
}; */

function padding3(ms) {
    if (ms < 10) {
        return `00${ms}`;
    }
    if (ms < 100) {
        return `0${ms}`;
    }
    return ms;
}

function padding2(num) {
    if (num < 10) {
        return `0${num}`;
    }
    return num;
}

const styles = {
    paper: {
        height: '100%',
        maxHeight: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        width: '100%',
    },
    chart: {
        width: '100%',
        overflow: 'hidden',
    },
    chartWithToolbar: theme => ({
        height: `calc(100% - ${(theme?.mixins?.toolbar.minHeight || 48) + 8}px)`,
    }),
    chartWithoutToolbar: {
        height: '100%',
    },
    selectHistoryControl: {
        width: 130,
    },
    selectRelativeTime: {
        marginLeft: 10,
        width: 200,
    },
    notAliveInstance: {
        opacity: 0.5,
    },
    customRange: theme => ({
        color: theme?.palette?.primary.main || '#00bcd4',
    }),
    splitLineButtonIcon: {
        marginRight: 8,
    },
    splitLineButton: {
        float: 'right',
    },
    grow: {
        flexGrow: 1,
    },

    toolbarTime: {
        width: 100,
        marginTop: 9,
        marginLeft: 8,
    },
    toolbarDate: {
        width: 160,
        marginTop: 9,
    },
    toolbarTimeGrid: {
        marginLeft: 8,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 4,
        paddingBottom: 4,
        border: '1px dotted #AAAAAA',
        borderRadius: 8,
        display: 'flex',
    },
    buttonIcon: {
        width: 24,
        height: 24,
    },
    echartsButton: {
        marginRight: 8,
        height: 34,
        width: 34,
    },
    dateInput: {
        width: 140,
        marginRight: 8,
    },
    timeInput: {
        width: 80,
    },
};

const GRID_PADDING_LEFT = 80;
const GRID_PADDING_RIGHT = 25;

class ObjectChart extends Component {
    constructor(props) {
        super(props);
        if (!this.props.from) {
            const from = new Date();
            from.setHours(from.getHours() - 24 * 7);
            this.start = from.getTime();
        } else {
            this.start = this.props.from;
        }
        if (!this.props.end) {
            this.end = Date.now();
        } else {
            this.end = this.props.end;
        }
        let relativeRange = window.localStorage.getItem('App.relativeRange') || '30';
        const min           = parseInt(window.localStorage.getItem('App.absoluteStart'), 10) || 0;
        const max           = parseInt(window.localStorage.getItem('App.absoluteEnd'), 10)   || 0;

        if ((!min || !max) && (!relativeRange || relativeRange === 'absolute')) {
            relativeRange = '30';
        }

        if (max && min) {
            relativeRange = 'absolute';
        }

        this.state = {
            // loaded: false,
            historyInstance: this.props.historyInstance || '',
            historyInstances: null,
            defaultHistory: '',
            chartHeight: 300,
            chartWidth: 500,
            relativeRange,
            splitLine: window.localStorage.getItem('App.splitLine') === 'true',
            // dateFormat: 'dd.MM.yyyy',
            // min,
            max,
            maxYLen: 0,
            maxYLen2: 0,
        };

        this.echartsReact = createRef();
        this.rangeRef     = createRef();
        this.readTimeout  = null;
        this.chartValues  = null;
        this.rangeValues  = null;

        this.unit         = this.props.unit  ? ` ${this.props.unit}`  : (this.props.obj?.common?.unit  ? ` ${this.props.obj.common.unit}`  : '');
        this.unit2        = this.props.unit2 ? ` ${this.props.unit2}` : (this.props.obj2?.common?.unit ? ` ${this.props.obj2.common.unit}` : '');

        this.divRef       = createRef();

        this.chart        = {};

        this.onChange = this.onChange.bind(this);
        this.onResize = this.onResize.bind(this);
    }

    componentDidMount() {
        const ids = [];
        if (this.props.obj._id && this.props.obj._id !== 'nothing_selected') {
            ids.push(this.props.obj._id);
        }
        if (this.props.obj2?._id && this.props.obj2._id !== 'nothing_selected') {
            ids.push(this.props.obj2._id);
        }

        ids.length && this.props.socket.subscribeState(ids, this.onChange);
        window.addEventListener('resize', this.onResize);
        this.prepareData()
            .then(() => !this.props.noToolbar && this.readHistoryRange())
            .then(() => this.setRelativeInterval(this.state.relativeRange, true, () =>
                this.forceUpdate()));
    }

    componentWillUnmount() {
        this.readTimeout && clearTimeout(this.readTimeout);
        this.readTimeout = null;

        this.timeTimer && clearTimeout(this.timeTimer);
        this.timeTimer = null;

        this.maxYLenTimeout && clearTimeout(this.maxYLenTimeout);
        this.maxYLenTimeout = null;

        this.maxYLenTimeout2 && clearTimeout(this.maxYLenTimeout2);
        this.maxYLenTimeout2 = null;

        const ids = [];
        if (this.props.obj._id && this.props.obj._id !== 'nothing_selected') {
            ids.push(this.props.obj._id);
        }
        if (this.props.obj2?._id && this.props.obj2._id !== 'nothing_selected') {
            ids.push(this.props.obj2._id);
        }

        ids.length && this.props.socket.unsubscribeState(ids, this.onChange);

        window.removeEventListener('resize', this.onResize);
    }

    onResize = () => {
        this.timerResize && clearTimeout(this.timerResize);
        this.timerResize = setTimeout(() => {
            this.timerResize = null;
            this.componentDidUpdate();
        });
    };

    onChange = (id, state) => {
        if ((id === this.props.obj._id || id === this.props.obj2._id) &&
            state &&
            this.rangeValues &&
            (!this.rangeValues.length || this.rangeValues[this.rangeValues.length - 1].ts < state.ts)
        ) {
            if (!this.state.max || state.ts - this.state.max < 120000) {
                this.chartValues && this.chartValues[id] && this.chartValues[id].push({ val: state.val, ts: state.ts });
                if (id === this.props.obj._id) {
                    this.rangeValues.push({ val: state.val, ts: state.ts });
                }

                // update only if the end is near to now
                if (state.ts >= this.chart.min && state.ts <= this.chart.max + 300000) {
                    this.updateChart();
                }
            }
        }
    };

    prepareData() {
        let list;

        if (this.props.noToolbar) {
            return new Promise(resolve => {
                this.setState({
                    // dateFormat: this.props.dateFormat.replace(/D/g, 'd').replace(/Y/g, 'y'),
                    defaultHistory: this.props.defaultHistory,
                    historyInstance: this.props.defaultHistory,
                }, () => resolve());
            });
        }

        return this.getHistoryInstances()
            .then(_list => {
                list = _list;
                // read default history
                return this.props.systemConfig ? Promise.resolve(this.props.systemConfig) : this.props.socket.getSystemConfig();
            })
            .then(config => {
                const defaultHistory = config && config.common && config.common.defaultHistory;

                // find current history
                // first read from localstorage
                let historyInstance = window.localStorage.getItem('App.historyInstance') || '';
                if (!historyInstance || !list.find(it => it.id === historyInstance && it.alive)) {
                    // try default history
                    historyInstance = defaultHistory;
                }
                if (!historyInstance || !list.find(it => it.id === historyInstance && it.alive)) {
                    // find first alive history
                    historyInstance = list.find(it => it.alive);
                    if (historyInstance) {
                        historyInstance = historyInstance.id;
                    }
                }
                // get first entry
                if (!historyInstance && list.length) {
                    historyInstance = defaultHistory;
                }

                this.setState({
                    // dateFormat: (config.common.dateFormat || 'dd.MM.yyyy').replace(/D/g, 'd').replace(/Y/g, 'y'),
                    historyInstances: list,
                    defaultHistory,
                    historyInstance,
                });
            });
    }

    async getHistoryInstances() {
        const list = [];
        const ids  = [];

        if (this.props.historyInstance) {
            return list;
        }
        let customsInstances = this.props.customsInstances;
        const objects = this.props.objects  || {};
        if (!customsInstances) {
            const instances = await this.props.socket.getAdapterInstances();
            customsInstances = instances.filter(it => {
                objects[it._id] = it;
                return it.common?.getHistory;
            }).map(obj => obj._id.replace('system.adapter.', ''));
        }

        customsInstances.forEach(instance => {
            const instObj = objects[`system.adapter.${instance}`];
            if (instObj?.common?.getHistory) {
                const listObj = { id: instance, alive: false };
                list.push(listObj);
                ids.push(`system.adapter.${instance}.alive`);
            }
        });

        if (ids.length) {
            for (let i = 0; i < ids.length; i++) {
                const alive = await this.props.socket.getState(ids[i]);
                const item = list.find(it => ids[i].endsWith(`${it.id}.alive`));
                if (item) {
                    item.alive = alive && alive.val;
                }
            }
        }

        return list;
    }

    readHistoryRange() {
        const now = new Date();
        const oldest = new Date(2000, 0, 1);

        return this.props.socket.getHistory(this.props.obj._id, {
            instance:  this.state.historyInstance,
            start:     oldest.getTime(),
            end:       now.getTime(),
            // step:      3600000, // hourly
            limit:     1,
            from:      false,
            ack:       false,
            q:         false,
            addID:     false,
            comment:   false,
            user:      false,
            aggregate: 'none',
        })
            .then(values => {
                // remove interpolated first value
                if (values && values[0]?.val === null) {
                    values.shift();
                }
                this.rangeValues = values;
            });
    }

    readHistory(start, end, id) {
        /* interface GetHistoryOptions {
            instance?: string;
            start?: number;
            end?: number;
            step?: number;
            count?: number;
            from?: boolean;
            ack?: boolean;
            q?: boolean;
            addID?: boolean;
            limit?: number;
            ignoreNull?: boolean;
            sessionId?: any;
            aggregate?: 'minmax' | 'min' | 'max' | 'average' | 'total' | 'count' | 'none';
        } */
        const options = {
            instance:  this.state.historyInstance,
            start,
            end,
            from:      false,
            ack:       false,
            q:         false,
            addID:     false,
            comment:   false,
            user:      false,
            aggregate: 'none',
            returnNewestEntries: true,
        };

        // if more than 30 minutes => aggregate
        if (!id &&
            end - start > 60000 * 30 &&
            !(this.props.obj.common.type === 'boolean' || (this.props.obj.common.type === 'number' && this.props.obj.common.states))
        ) {
            options.aggregate = 'minmax';
            // options.step = 60000;
        }

        return this.props.socket.getHistory(id || this.props.obj._id, options)
            .then(values => {
                // merge range and chart
                const chart = [];
                let r = 0;
                const range = this.rangeValues;
                let minY  = null;
                let maxY  = null;

                for (let t = 0; t < values.length; t++) {
                    if (!id && range) {
                        while (r < range.length && range[r].ts < values[t].ts) {
                            chart.push(range[r]);
                            // console.log(`add ${new Date(range[r].ts).toISOString()}: ${range[r].val}`);
                            r++;
                        }
                    }
                    // if range and details are not equal
                    if (!chart.length || chart[chart.length - 1].ts < values[t].ts) {
                        chart.push(values[t]);
                        // console.log(`add value ${new Date(values[t].ts).toISOString()}: ${values[t].val}`)
                    } else if (chart[chart.length - 1].ts === values[t].ts && chart[chart.length - 1].val !== values[t].ts) {
                        console.error('Strange data!');
                    }
                    if (minY === null || values[t].val < minY) {
                        minY = values[t].val;
                    }
                    if (maxY === null || values[t].val > maxY) {
                        maxY = values[t].val;
                    }
                }

                if (id && range) {
                    while (r < range.length) {
                        chart.push(range[r]);
                        console.log(`add range ${new Date(range[r].ts).toISOString()}: ${range[r].val}`);
                        r++;
                    }
                }

                // sort
                chart.sort((a, b) => (a.ts > b.ts ? 1 : (a.ts < b.ts ? -1 : 0)));

                id = id || this.props.obj._id;
                this.chartValues = this.chartValues || {};
                this.minY = this.minY || {};
                this.maxY = this.maxY || {};
                this.minX = this.minX || {};
                this.maxX = this.maxX || {};

                this.chartValues[id] = chart;
                this.minY[id] = minY;
                this.maxY[id] = maxY;

                this.minX[id] = minY;
                this.maxX[id] = maxY;

                if (this.minY[id] < 10) {
                    this.minY[id] = Math.round(this.minY[id] * 10) / 10;
                } else {
                    this.minY[id] = Math.ceil(this.minY[id]);
                }
                if (this.maxY[id] < 10) {
                    this.maxY[id] = Math.round(this.maxY[id] * 10) / 10;
                } else {
                    this.maxY[id] = Math.ceil(this.maxY[id]);
                }
                return chart;
            });
    }

    convertData(values, id) {
        values = values || this.chartValues[id];
        const data = [];
        if (!values || !values.length) {
            return data;
        }
        for (let i = 0; i < values.length; i++) {
            const dp = { value: [values[i].ts, values[i].val] };
            if (values[i].i) {
                dp.exact = false;
            }
            data.push(dp);
        }

        if (id === this.props.obj._id && !this.chart.min) {
            this.chart.min = values[0].ts;
            this.chart.max = values[values.length - 1].ts;
        }

        return data;
    }

    getOption() {
        let widthAxis;
        if (this.minY[this.props.obj._id] !== null && this.minY[this.props.obj._id] !== undefined) {
            widthAxis = (this.minY[this.props.obj._id].toString() + this.unit).length * 9 + 12;
        }
        if (this.maxY[this.props.obj._id] !== null && this.maxY[this.props.obj._id] !== undefined) {
            const w = (this.maxY[this.props.obj._id].toString() + this.unit).length * 9 + 12;
            if (w > widthAxis) {
                widthAxis = w;
            }
        }

        if (this.state.maxYLen) {
            const w = this.state.maxYLen * 9 + 12;
            if (w > widthAxis) {
                widthAxis = w;
            }
        }

        let widthAxis2;
        if (this.props.obj2) {
            if (this.minY[this.props.obj2._id] !== null && this.minY[this.props.obj2._id] !== undefined) {
                widthAxis2 = (this.minY[this.props.obj2._id].toString() + this.unit2).length * 9 + 12;
            }
            if (this.maxY[this.props.obj2._id] !== null && this.maxY[this.props.obj2._id] !== undefined) {
                const w = (this.maxY[this.props.obj2._id].toString() + this.unit2).length * 9 + 12;
                if (w > widthAxis2) {
                    widthAxis2 = w;
                }
            }

            if (this.state.maxYLen2) {
                const w = this.state.maxYLen2 * 9 + 12;
                if (w > widthAxis2) {
                    widthAxis2 = w;
                }
            }
        }

        const serie = {
            xAxisIndex: 0,
            type: 'line',
            step: this.props.objLineType === 'step' ? 'start' : undefined,
            showSymbol: false,
            hoverAnimation: true,
            animation: false,
            data: this.convertData(null, this.props.obj._id),
            backgroundColor: this.props.objBackgroundColor || 'rgba(243,177,31,0.14)',
            color: this.props.objColor || '#f5ba4d',
            areaStyle: {},
        };

        const yAxis = [
            {
                type: 'value',
                boundaryGap: [0, '100%'],
                splitLine: {
                    show: this.props.noToolbar || !!this.state.splitLine,
                },
                splitNumber: Math.round(this.state.chartHeight / 50),
                name: this.props.title || undefined,
                axisLabel: {
                    formatter: value => {
                        let text;
                        value = Math.round(value * 10) / 10;
                        if (this.props.isFloatComma) {
                            text = value.toString().replace(',', '.') + this.unit;
                        } else {
                            text = value + this.unit;
                        }

                        if (this.state.maxYLen < text.length) {
                            this.maxYLenTimeout && clearTimeout(this.maxYLenTimeout);
                            this.maxYLenTimeout = setTimeout(maxYLen => this.setState({ maxYLen }), 200, text.length);
                        }
                        return text;
                    },
                    showMaxLabel: true,
                    showMinLabel: true,
                },
                axisTick: {
                    alignWithLabel: true,
                },
            },
        ];

        let serie2;
        if (this.props.obj2) {
            serie2 = {
                xAxisIndex: 0,
                type: 'line',
                yAxisIndex: 1,
                step: this.props.obj2LineType === 'step' || !this.props.obj2LineType ? 'start' : undefined,
                showSymbol: false,
                hoverAnimation: true,
                animation: false,
                data: this.convertData(null, this.props.obj2._id),
                backgroundColor: this.props.obj2BackgroundColor || 'rgba(141,243,31,0.14)',
                color: this.props.obj2Color || '#21b400',
                areaStyle: {},
            };
            yAxis.push({
                type: 'value',
                alignTicks: true,
                boundaryGap: [0, '100%'],
                name: this.props.title2 || undefined,
                splitLine: {
                    show: this.props.noToolbar || !!this.state.splitLine,
                },
                splitNumber: Math.round(this.state.chartHeight / 50),
                axisLabel: {
                    formatter: value => {
                        let text;
                        value = Math.round(value * 10) / 10;
                        if (this.props.isFloatComma) {
                            text = value.toString().replace(',', '.') + this.unit2;
                        } else {
                            text = value + this.unit2;
                        }

                        if (this.state.maxYLen2 < text.length) {
                            this.maxYLenTimeout2 && clearTimeout(this.maxYLenTimeout2);
                            this.maxYLenTimeout2 = setTimeout(maxYLen2 => this.setState({ maxYLen2 }), 200, text.length);
                        }
                        return text;
                    },
                    showMaxLabel: true,
                    showMinLabel: true,
                },
                axisTick: {
                    alignWithLabel: true,
                },
            });
        }

        if (this.props.obj?.common?.type === 'boolean') {
            serie.step = 'end';
            yAxis[0].axisLabel.showMaxLabel = false;
            yAxis[0].axisLabel.formatter = value => (value === 1 ? 'TRUE' : 'FALSE');
            yAxis[0].max = 1.5;
            yAxis[0].interval = 1;
            widthAxis = 50;
        } else if (this.props.obj?.common?.type === 'number' && this.props.obj.common.states) {
            serie.step = 'end';
            yAxis[0].axisLabel.showMaxLabel = false;
            yAxis[0].axisLabel.formatter = value => (this.props.obj.common.states[value] !== undefined ? this.props.obj.common.states[value] : value);
            const keys = Object.keys(this.props.obj.common.states);
            keys.sort();
            yAxis[0].max = parseFloat(keys[keys.length - 1]) + 0.5;
            yAxis[0].interval = 1;
            let max = '';
            for (let i = 0; i < keys.length; i++) {
                if (typeof this.props.obj.common.states[keys[i]] === 'string' && this.props.obj.common.states[keys[i]].length > max.length) {
                    max = this.props.obj.common.states[keys[i]];
                }
            }
            widthAxis = ((max.length * 9) || 50) + 12;
        } else if (this.props.obj?.common?.type === 'number') {
            if (this.props.obj.common.min !== undefined && this.props.obj.common.max !== undefined) {
                yAxis[0].max = this.props.obj.common.max;
                yAxis[0].min = this.props.obj.common.min;
            } else if (this.props.obj.common.unit === '%') {
                yAxis[0].max = 100;
                yAxis[0].min = 0;
            }
        }

        if (this.props.obj2?.common?.type === 'boolean') {
            serie.step = 'end';
            yAxis[1].axisLabel.showMaxLabel = false;
            yAxis[1].axisLabel.formatter = value => (value === 1 ? 'TRUE' : 'FALSE');
            yAxis[1].max = 1.5;
            yAxis[1].interval = 1;
            widthAxis2 = 50;
        } else if (this.props.obj2?.common?.type === 'number' && this.props.obj2.common.states) {
            serie.step = 'end';
            yAxis[1].axisLabel.showMaxLabel = false;
            yAxis[1].axisLabel.formatter = value => (this.props.obj2.common.states[value] !== undefined ? this.props.obj2.common.states[value] : value);
            const keys = Object.keys(this.props.obj2.common.states);
            keys.sort();
            yAxis[1].max = parseFloat(keys[keys.length - 1]) + 0.5;
            yAxis[1].interval = 1;
            let max = '';
            for (let i = 0; i < keys.length; i++) {
                if (typeof this.props.obj2.common.states[keys[i]] === 'string' && this.props.obj2.common.states[keys[i]].length > max.length) {
                    max = this.props.obj2.common.states[keys[i]];
                }
            }
            widthAxis2 = ((max.length * 9) || 50) + 12;
        } else if (this.props.obj2?.common?.type === 'number') {
            if (this.props.obj2.common.min !== undefined && this.props.obj2.common.max !== undefined) {
                yAxis[1].max = this.props.obj2.common.max;
                yAxis[1].min = this.props.obj2.common.min;
            } else if (this.props.obj2.common.unit === '%') {
                yAxis[1].max = 100;
                yAxis[1].min = 0;
            }
        }

        const splitNumber = this.chart.withSeconds ?
            Math.round((this.state.chartWidth - GRID_PADDING_RIGHT - GRID_PADDING_LEFT) / 100)
            :
            Math.round((this.state.chartWidth - GRID_PADDING_RIGHT - GRID_PADDING_LEFT) / 60);

        return {
            backgroundColor: 'transparent',
            title: {
                text: this.props.noToolbar ? '' : (this.props.chartTitle !== undefined ? this.props.chartTitle : Utils.getObjectNameFromObj(this.props.obj, this.props.lang)),
                padding: [
                    10, // up
                    0,  // right
                    0,  // down
                    widthAxis ? widthAxis + 10 : GRID_PADDING_LEFT + 10, // left
                ],
            },
            grid: {
                left: widthAxis || GRID_PADDING_LEFT,
                top: yAxis[0].name || (yAxis[1] && yAxis[1].name) ? 38 : 8,
                right: widthAxis2 || (this.props.noToolbar ? 5 : GRID_PADDING_RIGHT),
                bottom: 40,
            },
            tooltip: {
                trigger: 'axis',
                formatter: params => {
                    params = params[0];
                    const date = new Date(params.value[0]);
                    let value = params.value[1];
                    if (value !== null && this.props.isFloatComma) {
                        value = value.toString().replace('.', ',');
                    }
                    return `${params.exact === false ? 'i' : ''}${date.toLocaleString()}.${padding3(date.getMilliseconds())}: ${value}${this.unit}`;
                },
                axisPointer: {
                    animation: true,
                },
            },
            xAxis: {
                type: 'time',
                splitLine: {
                    show: false,
                },
                splitNumber,
                min: this.chart.min,
                max: this.chart.max,
                axisTick: { alignWithLabel: true },
                axisLabel: {
                    formatter: value => {
                        const date = new Date(value);
                        if (this.chart.withSeconds) {
                            return `${padding2(date.getHours())}:${padding2(date.getMinutes())}:${padding2(date.getSeconds())}`;
                        } if (this.chart.withTime) {
                            return `${padding2(date.getHours())}:${padding2(date.getMinutes())}\n${padding2(date.getDate())}.${padding2(date.getMonth() + 1)}`;
                        }
                        return `${padding2(date.getDate())}.${padding2(date.getMonth() + 1)}\n${date.getFullYear()}`;
                    },
                },
            },
            yAxis,
            toolbox: {
                left: 'right',
                feature: this.props.noToolbar ? undefined : {
                    saveAsImage: {
                        title: this.props.t('Save as image'),
                        show: true,
                    },
                },
            },
            series: [serie, serie2],
        };
    }

    static getDerivedStateFromProps() {
        return null;
    }

    updateChart(start, end, withReadData, cb) {
        if (start) {
            this.start = start;
        }
        if (end) {
            this.end = end;
        }
        start = start || this.start;
        end   = end   || this.end;

        this.readTimeout && clearTimeout(this.readTimeout);

        this.readTimeout = setTimeout(() => {
            this.readTimeout = null;

            const diff = this.chart.max - this.chart.min;
            if (diff !== this.chart.diff) {
                this.chart.diff        = diff;
                this.chart.withTime    = this.chart.diff < 3600000 * 24 * 7;
                this.chart.withSeconds = this.chart.diff < 60000 * 30;
            }

            if (withReadData) {
                this.readHistory(start, end)
                    .then(async values => {
                        let values2;
                        if (this.props.obj2) {
                            values2 = await this.readHistory(start, end, this.props.obj2._id);
                        }

                        if (this.echartsReact && typeof this.echartsReact.getEchartsInstance === 'function') {
                            this.echartsReact.getEchartsInstance().setOption({
                                series: [
                                    { data: this.convertData(values, this.props.obj._id) },
                                    this.props.obj2 ? { data: this.convertData(values2, this.props.obj2._id) } : undefined,
                                ],
                                xAxis: {
                                    min: this.chart.min,
                                    max: this.chart.max,
                                },
                            });
                        }
                        cb && cb();
                    });
            } else if (this.echartsReact && typeof this.echartsReact.getEchartsInstance === 'function') {
                this.echartsReact.getEchartsInstance().setOption({
                    series: [
                        { data: this.convertData(null, this.props.obj._id) },
                        this.props.obj2 ? { data: this.convertData(null, this.props.obj2._id) } : undefined,
                    ],
                    xAxis: {
                        min: this.chart.min,
                        max: this.chart.max,
                    },
                });
                cb && cb();
            }
        }, 400);
    }

    setNewRange(readData) {
        /* if (this.rangeRef.current &&
            this.rangeRef.current.childNodes[1] &&
            this.rangeRef.current.childNodes[1].value) {
            this.rangeRef.current.childNodes[0].innerHTML = '';
            this.rangeRef.current.childNodes[1].value = '';
        } */
        this.chart.diff        = this.chart.max - this.chart.min;
        this.chart.withTime    = this.chart.diff < 3600000 * 24 * 7;
        this.chart.withSeconds = this.chart.diff < 60000 * 30;

        if (this.state.relativeRange !== 'absolute') {
            this.setState({ relativeRange: 'absolute' });
            // stop shift timer
            this.timeTimer && clearTimeout(this.timeTimer);
            this.timeTimer = null;
        } else if (this.echartsReact && typeof this.echartsReact.getEchartsInstance === 'function') {
            this.echartsReact.getEchartsInstance().setOption({
                xAxis: {
                    min: this.chart.min,
                    max: this.chart.max,
                },
            });

            readData && this.updateChart(this.chart.min, this.chart.max, true);
        }
    }

    shiftTime() {
        const now = new Date();
        const delay = 60000 - now.getSeconds() - (1000 - now.getMilliseconds());

        if (now.getMilliseconds()) {
            now.setMilliseconds(1000);
        }
        if (now.getSeconds()) {
            now.setSeconds(60);
        }

        const max = now.getTime();
        let min;
        let mins = this.state.relativeRange;

        if (mins === 'day') {
            now.setHours(0);
            now.setMinutes(0);
            min = now.getTime();
        } else if (mins === 'week') {
            now.setHours(0);
            now.setMinutes(0);
            // find week start
            if (now.getDay()) { // if not sunday
                now.setDate(now.getDate() - now.getDay() - 1);
            } else {
                now.setDate(now.getDate() - 6);
            }
            min = now.getTime();
        } else if (mins === '2weeks') {
            now.setHours(0);
            now.setMinutes(0);
            // find week start
            if (now.getDay()) { // if not sunday
                now.setDate(now.getDate() - now.getDay() - 8);
            } else {
                now.setDate(now.getDate() - 13);
            }
            min = now.getTime();
        } else if (mins === 'month') {
            now.setHours(0);
            now.setMinutes(0);
            now.setDate(1);
            min = now.getTime();
        } else if (mins === 'year') {
            now.setHours(0);
            now.setMinutes(0);
            now.setDate(1);
            now.setMonth(0);
            min = now.getTime();
        }  else if (mins === '12months') {
            now.setHours(0);
            now.setMinutes(0);
            now.setFullYear(now.getFullYear() - 1);
            min = now.getTime();
        } else {
            mins = parseInt(mins, 10);
            min = max - mins * 60000;
        }

        this.chart.min = min;
        this.chart.max = max;

        this.setState({ /* min, */ max }, () =>
            this.updateChart(this.chart.min, this.chart.max, true));

        this.timeTimer = setTimeout(() => {
            this.timeTimer = null;
            this.shiftTime();
        }, delay || 60000);
    }

    setRelativeInterval(mins, dontSave, cb) {
        if (!dontSave) {
            window.localStorage.setItem('App.relativeRange', mins);
            this.setState({ relativeRange: mins });
        }
        if (mins === 'absolute') {
            this.timeTimer && clearTimeout(this.timeTimer);
            this.timeTimer = null;
            this.updateChart(this.chart.min, this.chart.max, true, cb);
            return;
        }
        window.localStorage.removeItem('App.absoluteStart');
        window.localStorage.removeItem('App.absoluteEnd');

        const now = new Date();

        if (!this.timeTimer) {
            const delay = 60000 - now.getSeconds() - (1000 - now.getMilliseconds());
            this.timeTimer = setTimeout(() => {
                this.timeTimer = null;
                this.shiftTime();
            }, delay || 60000);
        }

        if (now.getMilliseconds()) {
            now.setMilliseconds(1000);
        }
        if (now.getSeconds()) {
            now.setSeconds(60);
        }

        this.chart.max = now.getTime();

        if (mins === 'day') {
            now.setHours(0);
            now.setMinutes(0);
            this.chart.min = now.getTime();
        } else if (mins === 'week') {
            now.setHours(0);
            now.setMinutes(0);
            // find week start
            if (now.getDay()) { // if not sunday
                now.setDate(now.getDate() - now.getDay() - 1);
            } else {
                now.setDate(now.getDate() - 6);
            }
            this.chart.min = now.getTime();
        } else if (mins === '2weeks') {
            now.setHours(0);
            now.setMinutes(0);
            // find week start
            if (now.getDay()) { // if not sunday
                now.setDate(now.getDate() - now.getDay() - 8);
            } else {
                now.setDate(now.getDate() - 13);
            }
            this.chart.min = now.getTime();
        } else if (mins === 'month') {
            now.setHours(0);
            now.setMinutes(0);
            now.setDate(1);
            this.chart.min = now.getTime();
        } else if (mins === 'year') {
            now.setHours(0);
            now.setMinutes(0);
            now.setDate(1);
            now.setMonth(0);
            this.chart.min = now.getTime();
        } else if (mins === '12months') {
            now.setHours(0);
            now.setMinutes(0);
            now.setFullYear(now.getFullYear() - 1);
            this.chart.min = now.getTime();
        } else {
            mins = parseInt(mins, 10);
            this.chart.min = this.chart.max - mins * 60000;
        }

        this.setState({ /* min: this.chart.min, */ max: this.chart.max }, () =>
            this.updateChart(this.chart.min, this.chart.max, true, cb));
    }

    installEventHandlers() {
        if (!this.echartsReact || typeof this.echartsReact.getEchartsInstance !== 'function') {
            return;
        }

        const zr = this.echartsReact.getEchartsInstance().getZr();
        if (!zr._iobInstalled) {
            zr._iobInstalled = true;
            zr.on('mousedown', e => {
                console.log('mouse down');
                this.mouseDown = true;
                this.chart.lastX = e.offsetX;
            });
            zr.on('mouseup', () => {
                console.log('mouse up');
                this.mouseDown = false;
                this.setNewRange(true);
            });
            zr.on('mousewheel', e => {
                let diff = this.chart.max - this.chart.min;
                const width = this.state.chartWidth - GRID_PADDING_RIGHT - GRID_PADDING_LEFT;
                const x = e.offsetX - GRID_PADDING_LEFT;
                const pos = x / width;

                const oldDiff = diff;
                const amount = e.wheelDelta > 0 ? 1.1 : 0.9;
                diff *= amount;
                const move = oldDiff - diff;
                this.chart.max += move * (1 - pos);
                this.chart.min -= move * pos;

                this.setNewRange();
            });
            zr.on('mousemove', e => {
                if (this.mouseDown) {
                    const moved = this.chart.lastX - (e.offsetX - GRID_PADDING_LEFT);
                    this.chart.lastX = e.offsetX - GRID_PADDING_LEFT;
                    const diff = this.chart.max - this.chart.min;
                    const width = this.state.chartWidth - GRID_PADDING_RIGHT - GRID_PADDING_LEFT;

                    const shift = Math.round((moved * diff) / width);
                    this.chart.min += shift;
                    this.chart.max += shift;
                    this.setNewRange();
                }
            });

            zr.on('touchstart', e => {
                e.preventDefault();
                this.mouseDown = true;
                const touches = e.touches || e.originalEvent.touches;
                if (touches) {
                    this.chart.lastX = touches[touches.length - 1].pageX;
                    if (touches.length > 1) {
                        this.chart.lastWidth = Math.abs(touches[0].pageX - touches[1].pageX);
                    } else {
                        this.chart.lastWidth = null;
                    }
                }
            });
            zr.on('touchend', e => {
                e.preventDefault();
                this.mouseDown = false;
                this.setNewRange(true);
            });
            zr.on('touchmove', e => {
                e.preventDefault();
                const touches = e.touches || e.originalEvent.touches;
                if (!touches) {
                    return;
                }
                const pageX = touches[touches.length - 1].pageX - GRID_PADDING_LEFT;
                if (this.mouseDown) {
                    if (touches.length > 1) {
                        // zoom
                        const fingerWidth = Math.abs(touches[0].pageX - touches[1].pageX);
                        if (this.chart.lastWidth !== null && fingerWidth !== this.chart.lastWidth) {
                            let diff = this.chart.max - this.chart.min;
                            const chartWidth = this.state.chartWidth - GRID_PADDING_RIGHT - GRID_PADDING_LEFT;

                            const amount     = fingerWidth > this.chart.lastWidth ? 1.1 : 0.9;
                            const positionX  = touches[0].pageX > touches[1].pageX ?
                                touches[1].pageX - GRID_PADDING_LEFT + fingerWidth / 2 :
                                touches[0].pageX - GRID_PADDING_LEFT + fingerWidth / 2;

                            const pos = positionX / chartWidth;

                            const oldDiff = diff;
                            diff *= amount;
                            const move = oldDiff - diff;

                            this.chart.max += move * (1 - pos);
                            this.chart.min -= move * pos;

                            this.setNewRange();
                        }
                        this.chart.lastWidth = fingerWidth;
                    } else {
                        // swipe
                        const moved = this.chart.lastX - pageX;
                        const diff  = this.chart.max - this.chart.min;
                        const chartWidth = this.state.chartWidth - GRID_PADDING_RIGHT - GRID_PADDING_LEFT;

                        const shift = Math.round((moved * diff) / chartWidth);
                        this.chart.min += shift;
                        this.chart.max += shift;

                        this.setNewRange();
                    }
                }
                this.chart.lastX = pageX;
            });
        }
    }

    renderChart() {
        if (this.chartValues && this.chartValues[this.props.obj._id]) {
            return <ReactEchartsCore
                ref={e => this.echartsReact = e}
                echarts={echarts}
                option={this.getOption()}
                notMerge
                lazyUpdate
                theme={this.props.themeType === 'dark' ? 'dark' : ''}
                style={{ height: `${this.state.chartHeight}px`, width: '100%' }}
                opts={{ renderer: 'svg' }}
                onEvents={{ rendered: () => this.installEventHandlers() }}
            />;
        }
        return <LinearProgress />;
    }

    componentDidUpdate() {
        if (this.divRef.current) {
            const width = this.divRef.current.offsetWidth;
            const height = this.divRef.current.offsetHeight;
            if (this.state.chartHeight !== height) { // || this.state.chartHeight !== height) {
                setTimeout(() => this.setState({ chartHeight: height, chartWidth: width }), 100);
            }
        }
    }
    /*
    setStartDate(min) {
        min = min.getTime();
        if (this.timeTimer) {
            clearTimeout(this.timeTimer);
            this.timeTimer = null;
        }
        window.localStorage.setItem('App.relativeRange', 'absolute');
        window.localStorage.setItem('App.absoluteStart', min);
        window.localStorage.setItem('App.absoluteEnd', this.state.max);

        this.chart.min = min;

        this.setState({ min, relativeRange: 'absolute' }, () =>
            this.updateChart(this.chart.min, this.chart.max, true));
    }

    setEndDate(max) {
        max = max.getTime();
        window.localStorage.setItem('App.relativeRange', 'absolute');
        window.localStorage.setItem('App.absoluteStart', this.state.min);
        window.localStorage.setItem('App.absoluteEnd', max);
        if (this.timeTimer) {
            clearTimeout(this.timeTimer);
            this.timeTimer = null;
        }
        this.chart.max = max;
        this.setState({ max, relativeRange: 'absolute'  }, () =>
            this.updateChart(this.chart.min, this.chart.max, true));
    }
   */

    renderToolbar() {
        if (this.props.noToolbar) {
            return null;
        }

        const showTimeSettings = window.clientWidth > 600;

        return <Toolbar>
            <FormControl variant="standard" style={styles.selectRelativeTime}>
                <InputLabel>{this.props.t('relative')}</InputLabel>
                <Select
                    variant="standard"
                    ref={this.rangeRef}
                    value={this.state.relativeRange}
                    onChange={e => this.setRelativeInterval(e.target.value)}
                >
                    <MenuItem value="absolute" sx={styles.customRange}>{this.props.t('custom_range')}</MenuItem>
                    <MenuItem value={10}>{this.props.t('last 10 minutes')}</MenuItem>
                    <MenuItem value={30}>{this.props.t('last 30 minutes')}</MenuItem>
                    <MenuItem value={60}>{this.props.t('last hour')}</MenuItem>
                    <MenuItem value="day">{this.props.t('this day')}</MenuItem>
                    <MenuItem value={24 * 60}>{this.props.t('last 24 hours')}</MenuItem>
                    <MenuItem value="week">{this.props.t('this week')}</MenuItem>
                    <MenuItem value={24 * 60 * 7}>{this.props.t('last week')}</MenuItem>
                    <MenuItem value="2weeks">{this.props.t('this 2 weeks')}</MenuItem>
                    <MenuItem value={24 * 60 * 14}>{this.props.t('last 2 weeks')}</MenuItem>
                    <MenuItem value="month">{this.props.t('this month')}</MenuItem>
                    <MenuItem value={30 * 24 * 60}>{this.props.t('last 30 days')}</MenuItem>
                    <MenuItem value="year">{this.props.t('this year')}</MenuItem>
                    <MenuItem value="12months">{this.props.t('last 12 months')}</MenuItem>
                </Select>
            </FormControl>
            {/* showTimeSettings ? null
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={localeMap[this.props.lang]}>
                    <div style={styles.toolbarTimeGrid}>
                        <DatePicker
                            style={styles.toolbarDate}
                            disabled={this.state.relativeRange !== 'absolute'}
                            disableToolbar
                            variant="inline"
                            margin="normal"
                            inputFormat={this.state.dateFormat}
                            // format="fullDate"
                            label={this.props.t('Start date')}
                            value={new Date(this.state.min)}
                            onChange={date => this.setStartDate(date)}
                            renderInput={params => <TextField style={styles.dateInput} variant="standard" {...params} />}
                        />
                        <TimePicker
                            disabled={this.state.relativeRange !== 'absolute'}
                            style={styles.toolbarTime}
                            margin="normal"
                            // format="fullTime24h"
                            ampm={false}
                            label={this.props.t('Start time')}
                            value={new Date(this.state.min)}
                            onChange={date => this.setStartDate(date)}
                            renderInput={params => <TextField style={styles.timeInput} variant="standard" {...params} />}
                        />
                    </div>
                    <div style={styles.toolbarTimeGrid}>
                        <DatePicker
                            disabled={this.state.relativeRange !== 'absolute'}
                            style={styles.toolbarDate}
                            disableToolbar
                            inputFormat={this.state.dateFormat}
                            variant="inline"
                            // format="fullDate"
                            margin="normal"
                            label={this.props.t('End date')}
                            value={new Date(this.state.max)}
                            onChange={date => this.setEndDate(date)}
                            renderInput={params => <TextField style={styles.dateInput} variant="standard" {...params} />}
                        />
                        <TimePicker
                            disabled={this.state.relativeRange !== 'absolute'}
                            style={styles.toolbarTime}
                            margin="normal"
                            // format="fullTime24h"
                            ampm={false}
                            label={this.props.t('End time')}
                            value={new Date(this.state.max)}
                            onChange={date => this.setEndDate(date)}
                            renderInput={params => <TextField style={styles.timeInput} variant="standard" {...params} />}
                        />
                    </div>
                </LocalizationProvider>
                : null */}
            {showTimeSettings ? <Fab
                variant="extended"
                size="small"
                color={this.state.splitLine ? 'primary' : 'inherit'}
                aria-label="show lines"
                onClick={() => {
                    window.localStorage.setItem('App.splitLine', this.state.splitLine ? 'false' : 'true');
                    this.setState({ splitLine: !this.state.splitLine });
                }}
                style={styles.splitLineButton}
            >
                <SplitLineIcon style={styles.splitLineButtonIcon} />
                {this.props.t('Show lines')}
            </Fab> : null}
        </Toolbar>;
    }

    render() {
        if (!this.state.historyInstances && !this.state.defaultHistory) {
            return <LinearProgress />;
        }

        return <Paper style={styles.paper}>
            {this.renderToolbar()}
            <Box
                component="div"
                ref={this.divRef}
                style={styles.chart}
                sx={this.props.noToolbar ? styles.chartWithoutToolbar : styles.chartWithToolbar}
            >
                {this.renderChart()}
            </Box>
        </Paper>;
    }
}

ObjectChart.propTypes = {
    t: PropTypes.func,
    lang: PropTypes.string,
    socket: PropTypes.object,
    obj: PropTypes.object,
    obj2: PropTypes.object,
    unit: PropTypes.string,
    unit2: PropTypes.string,
    title: PropTypes.string,
    title2: PropTypes.string,
    objLineType: PropTypes.string,
    obj2LineType: PropTypes.string,
    objColor: PropTypes.string,
    obj2Color: PropTypes.string,
    objBackgroundColor: PropTypes.string,
    obj2BackgroundColor: PropTypes.string,
    customsInstances: PropTypes.array,
    themeType: PropTypes.string,
    objects: PropTypes.object,
    from: PropTypes.number,
    end: PropTypes.number,
    noToolbar: PropTypes.bool,
    defaultHistory: PropTypes.string,
    historyInstance: PropTypes.string,
    isFloatComma: PropTypes.bool,
    chartTitle: PropTypes.string,
};

export default withWidth()(ObjectChart);
