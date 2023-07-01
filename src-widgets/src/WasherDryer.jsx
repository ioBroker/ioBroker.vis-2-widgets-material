// ------------------- deprecated, use Switches.jsx instead -------------------
import React from 'react';
import { withStyles } from '@mui/styles';

import { CircularSlider } from 'react-circular-slider-svg';

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


const styles = () => ({
});

class WasherDryer extends Generic {
    constructor(props) {
        super(props);
        this.refDiv = React.createRef();
        this.state.object = { common: {} };
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
                            options: [
                                { value: 'washer', label: 'washer' },
                                { value: 'dryer', label: 'dryer' },
                                { value: 'both', label: 'both' },
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
                            label: 'wash_or_dry',
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

    async componentDidMount() {
        super.componentDidMount();
        await this.propertiesUpdate();
    }

    async onRxDataChanged() {
        await this.propertiesUpdate();
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const width = this.refDiv.current?.clientWidth;
        const height = this.refDiv.current?.clientHeight;
        let wSize;
        const ratio = 1.3;
        if (width) {
            if (width * ratio < height) {
                wSize = width;
            } else {
                wSize = height / 1.3;
            }
        }
        const style = {
            width: wSize,
            height: wSize * ratio,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            margin: 'auto',
            fontSize: Math.round(wSize / 10),
            borderRadius: Math.round(wSize / 30),
            boxShadow: '1px 1px 5px 1px rgba(0,0,0,0.79)',
        };

        const brandLen = this.state.rxData.brand?.length || 0;

        let status = 'stop';
        let running;
        const mode = this.state.values[`${this.state.rxData['status-oid']}.val`];
        if (mode === true || mode === 'true') {
            running = true;
            status = 'run';
        } else if (mode === 'false' || mode === false) {
            running = false;
            status = 'inactive';
        } else if (this.state.object?.common?.states) {
            status = (this.state.object.common.states[mode] || mode || '').toString().toLowerCase();
            running = status.includes('run') || (status.includes('active') && !status.includes('inactive'));
        } else {
            status = mode || 'stop';
            running = status.includes('run') || (status.includes('active') && !status.includes('inactive'));
        }

        status = Generic.t(status.toLowerCase()).replace('vis_2_widgets_material_', '');

        let backgroundColor = '#264d72';
        let color = '#3679be';
        let statusColor;
        if (running) {
            statusColor = '#289f3c';
            if (this.state.rxData.type === 'dryer' ||
                (this.state.rxData.type === 'both' && this.state.values[`${this.state.rxData['dry-oid']}.val`])
            ) {
                backgroundColor = '#9f883f';
                color = '#945521';
                statusColor = '#b24a00';
            }
        } else {
            backgroundColor = '#565656';
            color = '#a2a2a2';
            statusColor = '#a2a2a2';
        }


        let circle;
        let timeText;
        if (running) {
            if (this.state.rxData['start-time-oid'] && this.state.rxData['end-time-oid']) {
                const time = new Date(this.state.values[`${this.state.rxData['end-time-oid']}.val`]);
                const totalTime = time.getTime() - new Date(this.state.values[`${this.state.rxData['start-time-oid']}.val`]).getTime();
                const ms = time.getTime() - Date.now();
                const value = Math.round(((totalTime - ms) / totalTime) * 360);
                const hours = Math.floor(ms / 1000 / 60 / 60);
                const minutes = Math.floor((ms - hours * 1000 * 60 * 60) / 1000 / 60);
                timeText = `${hours}:${minutes.toString().padStart(2, '0')}`;
                const thickness = wSize / 8;
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
                            viewBox="-82 -82 164 164"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            <path
                                d={describeArc(0, 0, 75, 0, value)}
                                fill="none"
                                style={{
                                    stroke: color,
                                    strokeWidth: 15,
                                }}
                            />
                        </svg>
                        <svg
                            viewBox="-82 -82 164 164"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',

                            }}
                        >
                            <path
                                d={describeArc(0, 0, 75, value, 359.999)}
                                fill="none"
                                style={{
                                    stroke: backgroundColor,
                                    strokeWidth: '15px',
                                }}
                            />
                        </svg>
                    </div>;
            } else if (this.state.rxData['end-time-oid']) {
                const time = new Date(this.state.values[`${this.state.rxData['end-time-oid']}.val`]);
                const ms = time.getTime() - Date.now();
                const hours = Math.floor(ms / 1000 / 60 / 60);
                const minutes = Math.floor((ms - hours * 1000 * 60 * 60) / 1000 / 60);
                timeText = `${hours}:${minutes.toString().padStart(2, '0')}`;
                circle = <>
                    <div
                        style={{
                            position: 'absolute',
                            height: '100%',
                            width: '100%',
                            borderRadius: '50%',
                            border: `${wSize / 20}px solid ${backgroundColor}`,
                            zIndex: 0,
                            boxSizing: 'border-box',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            height: '100%',
                            width: '100%',
                            borderRadius: '50%',
                            borderTop: `${wSize / 25}px solid ${color}`,
                            borderBottom: `${wSize / 25}px solid ${color}`,
                            borderLeft: `${wSize / 25}px solid ${color}`,
                            borderRight: `${wSize / 25}px solid transparent`, // transparent
                            boxSizing: 'border-box',
                            zIndex: 1,
                        }}
                    />
                </>;
            }
        }

        const content = <div
            style={{
                width: '100%',
                height: this.state.rxData.widgetTitle && !this.state.rxData.noCard && !props.widget.usedInWidget ? 'calc(100% - 36px)' : '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            ref={this.refDiv}
        >
            {width && height ? <div
                style={style}
            >
                {/* header */}
                <div
                    style={{
                        width: '100%',
                        height: '15%',
                        display: 'flex',
                        justifyContent: 'right',
                        alignItems: 'center',
                    }}
                >
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
                            fontSize: brandLen <= 3 ? Math.round(wSize / 10) : Math.round(wSize / (brandLen * 2.5)),
                        }}
                    >
                        {this.state.rxData.brand}
                    </div>
                    <div style={{ flexGrow: 1 }} />
                    {/* gray button 1 */}
                    <div
                        style={{
                            width: wSize / 10,
                            height: wSize / 10,
                            borderRadius: '50%',
                            backgroundColor: '#999',
                            marginRight: '3%',
                            marginTop: '4%',
                        }}
                    />
                    {/* gray button 2 */}
                    <div
                        style={{
                            width: wSize / 10,
                            height: wSize / 10,
                            borderRadius: '50%',
                            backgroundColor: '#999',
                            marginRight: '3%',
                            marginTop: '4%',
                        }}
                    />
                    {/* red/green button 3 */}
                    <div
                        style={{
                            width: wSize / 10,
                            height: wSize / 10,
                            borderRadius: '50%',
                            backgroundColor: statusColor,
                            marginRight: '10%',
                            marginTop: '4%',
                        }}
                    />
                </div>
                {/* divider */}
                <div
                    style={{
                        width: '95%',
                        height: '1%',
                        borderBottom: '1px solid grey',
                    }}
                />
                {/* main part */}
                <div
                    style={{
                        width: '90%',
                        height: '69%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            width: wSize / 1.8,
                            height: wSize / 1.8,
                            borderRadius: '50%',
                            border: `${wSize / 15}px solid grey`,
                            position: 'relative',
                        }}
                    >
                        {circle}
                        <div
                            style={{
                                position: 'absolute',
                                height: '100%',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 2,
                                fontSize: Math.round(wSize / 5),
                            }}
                        >
                            {timeText || ''}
                        </div>

                    </div>
                </div>
                {/* divider */}
                <div
                    style={{
                        width: '95%',
                        height: '1%',
                        borderBottom: '1px solid grey',
                    }}
                />
                <div
                    style={{
                        width: '100%',
                        height: '14%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: statusColor,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {status}
                </div>

            </div> : null}
        </div>;

        if (this.state.rxData.noCard || props.widget.usedInWidget) {
            return content;
        }

        return this.wrapContent(content);
    }
}

export default withStyles(styles)(WasherDryer);
