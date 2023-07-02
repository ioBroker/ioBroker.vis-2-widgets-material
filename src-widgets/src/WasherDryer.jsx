import React from 'react';
import { withStyles } from '@mui/styles';
import moment from 'moment';
import 'moment/locale/de';
import 'moment/locale/es';
import 'moment/locale/fr';
import 'moment/locale/it';
import 'moment/locale/nl';
import 'moment/locale/pl';
import 'moment/locale/pt';
import 'moment/locale/ru';
import 'moment/locale/uk';
import 'moment/locale/zh-cn';

import Generic from './Generic';

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180.0);

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians)),
    };
}

function describeArc(x, y, radius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, endAngle);

    const arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

    return [
        'M', start.x, start.y,
        'A', radius, radius, 0, arcSweep, 1, end.x, end.y,
    ].join(' ');
}

const Dishes = props => <svg style={props.style} viewBox="0 0 44 35">
    <rect fill="#A1C8EC" height="35" width="44" y="0.00283" x="-0.01558" />
    <line stroke="#7FABDA" strokeMiterlimit="10" strokeLinejoin="round" strokeWidth="2" fill="none" y2="14.71955" x2="43.84278" y1="14.71955" x1="-0.01558" />
    <path fill="#7FABDA" d="m9.98442,15.00283l-6,0l0,-5c0,-1.657 1.343,-3 3,-3l0,0c1.657,0 3,1.343 3,3l0,5z" />
    <line strokeMiterlimit="10" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#7FABDA" fill="none" y2="3.00283" x2="8.98442" y1="3.00283" x1="4.98442" />
    <line strokeMiterlimit="10" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#7FABDA" fill="none" y2="7.00283" x2="6.98442" y1="3.00283" x1="6.98442" />
    <path fill="#7FABDA" d="m19.98442,15.00283l-6,0l0,-5c0,-1.657 1.343,-3 3,-3l0,0c1.657,0 3,1.343 3,3l0,5z" />
    <line strokeMiterlimit="10" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#7FABDA" fill="none" y2="3.00283" x2="18.98442" y1="3.00283" x1="14.98442" />
    <line strokeMiterlimit="10" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#7FABDA" fill="none" y2="7.00283" x2="16.98442" y1="3.00283" x1="16.98442" />
    <path fill="#7FABDA" d="m29.98442,15.00283l-6,0l0,-5c0,-1.657 1.343,-3 3,-3l0,0c1.657,0 3,1.343 3,3l0,5z" />
    <line strokeMiterlimit="10" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#7FABDA" fill="none" y2="3.00283" x2="28.98442" y1="3.00283" x1="24.98442" />
    <line strokeMiterlimit="10" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#7FABDA" fill="none" y2="7.00283" x2="26.98442" y1="3.00283" x1="26.98442" />
    <path fill="#7FABDA" d="m39.98442,15.00283l-6,0l0,-5c0,-1.657 1.343,-3 3,-3l0,0c1.657,0 3,1.343 3,3l0,5z" />
    <line strokeMiterlimit="10" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#7FABDA" fill="none" y2="3.00283" x2="38.98442" y1="3.00283" x1="34.98442" />
    <line strokeMiterlimit="10" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#7FABDA" fill="none" y2="7.00283" x2="36.98442" y1="3.00283" x1="36.98442" />
    <path fill="#6F98BC" d="m16.98442,31.00283c0,-6.627 -5.373,-12 -12,-12c-1.787,0 -3.476,0.401 -5,1.102l0,14.898l16.283,0c0.448,-1.253 0.717,-2.592 0.717,-4z" />
    <path fill="#7FABDA" d="m12.98442,31.00283c0,-4.418 -3.582,-8 -8,-8c-1.893,0 -3.63,0.661 -5,1.76l0,10.24l11.918,0c0.685,-1.177 1.082,-2.54 1.082,-4z" />
    <path fill="#568BB2" d="m13.98442,19.00283c-1.586,0 -3.087,0.33 -4.471,0.891c4.381,1.788 7.471,6.085 7.471,11.109c0,1.408 -0.269,2.747 -0.717,4l9,0c0.448,-1.253 0.717,-2.592 0.717,-4c0,-6.627 -5.373,-12 -12,-12z" />
    <path fill="#7FABDA" d="m13.98442,23.00283c-0.024,0 -0.047,0.003 -0.071,0.003c1.904,2.124 3.071,4.921 3.071,7.997c0,1.408 -0.269,2.747 -0.717,4l4.636,0c0.685,-1.177 1.082,-2.54 1.082,-4c-0.001,-4.418 -3.583,-8 -8.001,-8z" />
    <path fill="#6F98BC" d="m22.98442,19.00283c-1.586,0 -3.087,0.33 -4.471,0.891c4.381,1.788 7.471,6.085 7.471,11.109c0,1.408 -0.269,2.747 -0.717,4l9,0c0.448,-1.253 0.717,-2.592 0.717,-4c0,-6.627 -5.373,-12 -12,-12z" />
    <path fill="#7FABDA" d="m22.98442,23.00283c-0.024,0 -0.047,0.003 -0.071,0.003c1.904,2.124 3.071,4.921 3.071,7.997c0,1.408 -0.269,2.747 -0.717,4l4.636,0c0.685,-1.177 1.082,-2.54 1.082,-4c-0.001,-4.418 -3.583,-8 -8.001,-8z" />
    <path fill="#568BB2" d="m31.98442,19.00283c-1.586,0 -3.087,0.33 -4.471,0.891c4.381,1.788 7.471,6.085 7.471,11.109c0,1.408 -0.269,2.747 -0.717,4l9,0c0.448,-1.253 0.717,-2.592 0.717,-4c0,-6.627 -5.373,-12 -12,-12z" />
    <path fill="#7FABDA" d="m31.98442,23.00283c-0.024,0 -0.047,0.003 -0.071,0.003c1.904,2.124 3.071,4.921 3.071,7.997c0,1.408 -0.269,2.747 -0.717,4l4.636,0c0.685,-1.177 1.082,-2.54 1.082,-4c-0.001,-4.418 -3.583,-8 -8.001,-8z" />
</svg>;

const styles = () => ({
    rotatedItem: {
        animation: '$rotation 10000ms infinite',
    },
    '@keyframes rotation': {
        '100%': {
            transform: 'rotate(360deg)',
        },
    },
    body: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        width: '100%',
        height: '15%',
        display: 'flex',
        justifyContent: 'right',
        alignItems: 'center',
    },
    grayLed: {
        borderRadius: '50%',
        backgroundColor: '#999',
        marginRight: '3%',
        marginTop: '4%',
    },
    divider: {
        width: '95%',
        height: '1%',
        borderBottom: '1px solid grey',
    },
    mainPart: {
        width: '90%',
        height: '69%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerText: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        textAlign: 'center',
    },
    centerCircle: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        borderRadius: '50%',
        zIndex: 0,
        boxSizing: 'border-box',
    },
    footer: {
        width: '100%',
        height: '14%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
});

class WasherDryer extends Generic {
    constructor(props) {
        super(props);
        this.refDiv = React.createRef();
        this.state.object = { common: {} };
        moment.locale(props.context.lang);
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2WasherDryer',
            visSet: 'vis-2-widgets-material',
            visName: 'WasherDryer',
            visWidgetLabel: 'washer_dryer',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'noCard',
                            label: 'without_card',
                            type: 'checkbox',
                        },
                        {
                            name: 'widgetTitle',
                            label: 'name',
                            hidden: '!!data.noCard',
                        },
                        {
                            name: 'brand',
                            label: 'brand_name',
                        },
                        {
                            name: 'brandColor',
                            type: 'color',
                            label: 'brand_color',
                        },
                        {
                            name: 'type',
                            type: 'select',
                            label: 'type',
                            options: [
                                { value: 'washer', label: 'washer' },
                                { value: 'dryer', label: 'dryer' },
                                { value: 'both', label: 'washer_and_dryer' },
                                { value: 'dish', label: 'dishwasher' },
                            ],
                        },
                        {
                            name: 'status-oid',
                            type: 'id',
                            label: 'status_id',
                            onChange: async (/* field, data, changeData, socket */) => {
                                // detect other states
                            },
                        },
                        {
                            name: 'start-time-oid',
                            type: 'id',
                            label: 'start_time_id',
                        },
                        {
                            name: 'end-time-oid',
                            type: 'id',
                            label: 'end_time_id',
                        },
                        {
                            name: 'dry-oid',
                            type: 'id',
                            label: 'wash_or_dry_id',
                            tooltip: 'wash_or_dry_tooltip',
                            hidden: 'data.type !== "both"',
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 120,
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_washer_dryer.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return WasherDryer.getWidgetInfo();
    }

    async propertiesUpdate() {
        if (this.statusOID === this.state.rxData['status-oid']) {
            return;
        }

        this.statusOID = this.state.rxData['status-oid'];
        if (!this.statusOID || this.statusOID === 'nothing_selected') {
            this.setState({ object: { common: {} } });
            return;
        }
        // read object itself
        let object = await this.props.context.socket.getObject(this.statusOID);
        object = { common: object?.common || {}, _id: object?._id };

        if (object.common.states && Array.isArray(object.common.states)) {
            // convert to {'state1': 'state1', 'state2': 'state2', ...}
            const states = {};
            object.common.states.forEach(state => states[state] = state);
            object.common.states = states;
        }
        if (JSON.stringify(this.state.object) !== JSON.stringify(object)) {
            this.setState({ object });
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.updateInterval && clearInterval(this.updateInterval);
        this.updateInterval = null;
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.propertiesUpdate();
    }

    async onRxDataChanged() {
        await this.propertiesUpdate();
    }

    renderWasher(options) {
        let circle;
        if (options.circle === 'full') {
            circle =
                <div
                    style={{
                        position: 'absolute',
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                    }}
                >
                    <svg
                        viewBox="-83 -83 166 166"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        <path
                            d={describeArc(0, 0, 75, 0, options.value)}
                            fill="none"
                            style={{
                                stroke: options.color,
                                strokeWidth: 15,
                            }}
                        />
                    </svg>
                    <svg
                        viewBox="-83 -83 166 166"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        <path
                            d={describeArc(0, 0, 75, options.value, 359.999)}
                            fill="none"
                            style={{
                                stroke: options.backgroundColor,
                                strokeWidth: '15px',
                            }}
                        />
                    </svg>
                </div>;
        } else if (options.circle === 'short') {
            circle = <>
                <div
                    className={this.props.classes.centerCircle}
                    style={{ border: `${options.wSize / 20}px solid ${options.backgroundColor}` }}
                />
                <div
                    className={`${this.props.classes.centerCircle} ${this.props.classes.rotatedItem}`}
                    style={{
                        zIndex: 1,
                        borderTop: `${options.wSize / 25}px solid ${options.color}`,
                        borderBottom: `${options.wSize / 25}px solid ${options.color}`,
                        borderLeft: `${options.wSize / 25}px solid ${options.color}`,
                        borderRight: `${options.wSize / 25}px solid transparent`, // transparent
                    }}
                />
            </>;
        }

        return <div style={options.style}>
            {/* header */}
            <div className={this.props.classes.header}>
                <div
                    style={{
                        width: '30%',
                        height: '70%',
                        marginTop: '3%',
                        borderRadius: '8%',
                        border: '1px solid grey',
                        marginLeft: '3%',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: this.state.rxData.brandColor || undefined,
                        fontSize: options.brandLen <= 3 ? Math.round(options.wSize / 10) : Math.round(options.wSize / (options.brandLen * 2.5)),
                    }}
                >
                    {this.state.rxData.brand}
                </div>
                <div style={{ flexGrow: 1 }} />
                {/* gray button 1 */}
                <div
                    className={this.props.classes.grayLed}
                    style={{
                        width: options.wSize / 10,
                        height: options.wSize / 10,
                    }}
                />
                {/* gray button 2 */}
                <div
                    className={this.props.classes.grayLed}
                    style={{
                        width: options.wSize / 10,
                        height: options.wSize / 10,
                    }}
                />
                {/* red/green button 3 */}
                <div
                    style={{
                        width: options.wSize / 10,
                        height: options.wSize / 10,
                        borderRadius: '50%',
                        backgroundColor: options.statusColor,
                        marginRight: '10%',
                        marginTop: '4%',
                    }}
                />
            </div>
            {/* divider */}
            <div className={this.props.classes.divider} />
            {/* main part */}
            <div className={this.props.classes.mainPart}>
                <div
                    style={{
                        width: options.wSize / 1.8,
                        height: options.wSize / 1.8,
                        border: `${options.wSize / 15}px solid grey`,
                        borderRadius: '50%',
                        position: 'relative',
                    }}
                >
                    {circle}
                    <div
                        className={this.props.classes.centerText}
                        style={{ fontSize: options.fontSize }}
                    >
                        {options.timeText || ''}
                    </div>
                </div>
            </div>
            {/* divider */}
            <div className={this.props.classes.divider} />
            <div
                className={this.props.classes.footer}
                style={{ color: options.statusColor }}
            >
                {options.status}
            </div>
        </div>;
    }

    renderDishWasher(options) {
        return <div style={options.style}>
            {/* header */}
            <div className={this.props.classes.header}>
                {/* red/green button 3 */}
                <div
                    style={{
                        width: options.wSize / 10,
                        height: options.wSize / 10,
                        borderRadius: '50%',
                        backgroundColor: options.statusColor,
                        marginLeft: '3%',
                        marginTop: '4%',
                    }}
                />
                <div style={{ flexGrow: 1 }} />
                <div
                    style={{
                        width: '33%',
                        height: '70%',
                        marginTop: '3%',
                        borderRadius: '8%',
                        border: '1px solid grey',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: this.state.rxData.brandColor || undefined,
                        fontSize: options.brandLen <= 3 ? Math.round(options.wSize / 10) : Math.round(options.wSize / (options.brandLen * 2.5)),
                    }}
                >
                    {this.state.rxData.brand}
                </div>
                <div style={{ width: '33%' }} />
            </div>
            {/* divider */}
            <div className={this.props.classes.divider} />
            {/* main part */}
            <div className={this.props.classes.mainPart}>
                <Dishes
                    style={{
                        width: '100%',
                        height: '100%',
                        opacity: 0.5,
                        filter: options.running ? '' : 'grayscale(1)',
                    }}
                />
                <div
                    className={this.props.classes.centerText}
                    style={{ fontSize: options.fontSize }}
                >
                    {options.timeText || ''}
                </div>
            </div>
            {/* divider */}
            <div className={this.props.classes.divider} />
            <div
                className={this.props.classes.footer}
                style={{ color: options.statusColor }}
            >
                {options.status}
            </div>
        </div>;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);
        const options = {};

        const width = this.refDiv.current?.clientWidth;
        const height = this.refDiv.current?.clientHeight;
        const ratio = 1.3;
        if (width) {
            if (width * ratio < height) {
                options.wSize = width;
            } else {
                options.wSize = height / 1.3;
            }
        }

        options.style = {
            width: options.wSize,
            height: options.wSize * ratio,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            margin: 'auto',
            fontSize: Math.round(options.wSize / 10),
            borderRadius: Math.round(options.wSize / 30),
            boxShadow: '1px 1px 5px 1px rgba(0,0,0,0.79)',
        };

        options.brandLen = this.state.rxData.brand?.length || 0;

        options.status = 'stop';
        const mode = this.state.values[`${this.state.rxData['status-oid']}.val`];
        if (mode === true || mode === 'true') {
            options.running = true;
            options.status = 'run';
        } else if (mode === 'false' || mode === false) {
            options.running = false;
            options.status = 'inactive';
        } else if (this.state.object?.common?.states) {
            options.status = (this.state.object.common.states[mode] || mode || '').toString().toLowerCase();
            options.running = options.status.includes('run') || (options.status.includes('active') && !options.status.includes('inactive'));
        } else {
            options.status = mode || 'stop';
            options.running = options.status.includes('run') || (options.status.includes('active') && !options.status.includes('inactive'));
        }

        options.status = Generic.t(options.status.toLowerCase()).replace('vis_2_widgets_material_', '');

        options.backgroundColor = '#264d72';
        options.color = '#3679be';
        if (options.running) {
            options.statusColor = '#289f3c';
            if (this.state.rxData.type === 'dryer' ||
                (this.state.rxData.type === 'both' && this.state.values[`${this.state.rxData['dry-oid']}.val`])
            ) {
                options.backgroundColor = '#9f883f';
                options.color = '#945521';
                options.statusColor = '#b24a00';
            }
        } else {
            options.backgroundColor = '#565656';
            options.color = '#a2a2a2';
            options.statusColor = '#a2a2a2';
        }

        if (options.running) {
            if (this.state.rxData['start-time-oid'] &&
                this.state.rxData['end-time-oid'] &&
                this.state.values[`${this.state.rxData['end-time-oid']}.val`] &&
                this.state.values[`${this.state.rxData['start-time-oid']}.val`]
            ) {
                const endTime = new Date(this.state.values[`${this.state.rxData['end-time-oid']}.val`]);
                const startTime = new Date(this.state.values[`${this.state.rxData['start-time-oid']}.val`]);
                const totalTime = endTime.getTime() - startTime.getTime();
                const ms = endTime.getTime() - Date.now();
                if (totalTime > 0) {
                    options.value = Math.round(((totalTime - ms) / totalTime) * 360);
                    const hours = Math.floor(ms / 1000 / 60 / 60);
                    const minutes = Math.floor((ms - hours * 1000 * 60 * 60) / 1000 / 60);
                    options.timeText = `${hours}:${minutes.toString().padStart(2, '0')}`;
                    options.circle = 'full';
                } else if (endTime.getTime() > Date.now()) {
                    const _ms = endTime.getTime() - Date.now();
                    const hours = Math.floor(_ms / 1000 / 60 / 60);
                    const minutes = Math.floor((_ms - hours * 1000 * 60 * 60) / 1000 / 60);
                    options.timeText = `${hours}:${minutes.toString().padStart(2, '0')}`;
                }
            } else if (this.state.rxData['end-time-oid']) {
                const endTime = new Date(this.state.values[`${this.state.rxData['end-time-oid']}.val`]);
                const ms = endTime.getTime() - Date.now();
                if (ms > 0) {
                    const hours = Math.floor(ms / 1000 / 60 / 60);
                    const minutes = Math.floor((ms - hours * 1000 * 60 * 60) / 1000 / 60);
                    options.timeText = `${hours}:${minutes.toString().padStart(2, '0')}`;
                }
            }
            options.circle = options.circle || 'short';
            options.fontSize = Math.round(options.wSize / 5);
        } else if (this.state.rxData['end-time-oid'] && this.state.values[`${this.state.rxData['end-time-oid']}.val`]) {
            const endTime = new Date(this.state.values[`${this.state.rxData['end-time-oid']}.val`]);
            if (Date.now() - endTime.getTime() > 0 && Date.now() - endTime.getTime() < 7200000) {
                options.timeText = moment(endTime).fromNow();
            }
            options.fontSize = Math.round(options.wSize / 10);
        }

        if (options.timeText && !this.updateInterval) {
            this.updateInterval = setInterval(() => this.forceUpdate(), 30000);
        } else if (!options.timeText && this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        const content = <div
            className={this.props.classes.body}
            style={{
                height: this.state.rxData.widgetTitle && !this.state.rxData.noCard && !props.widget.usedInWidget ? 'calc(100% - 36px)' : '100%',
            }}
            ref={this.refDiv}
        >
            {options.wSize && this.state.rxData.type !== 'dish' ? this.renderWasher(options) : null}
            {options.wSize && this.state.rxData.type === 'dish' ? this.renderDishWasher(options) : null}
        </div>;

        if (this.state.rxData.noCard || props.widget.usedInWidget) {
            return content;
        }

        return this.wrapContent(content);
    }
}

export default withStyles(styles)(WasherDryer);
