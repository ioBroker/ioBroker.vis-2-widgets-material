import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

// import ReactClock1 from 'react-clock';
// import ReactClock2 from '@uiw/react-clock';
import AnalogClock from './AnalogClock/AnalogClock';
/*import FlipClockCountdown from '@leenguyen/react-flip-clock-countdown';
*/
import Generic from './Generic';

const styles = theme => ({
    reactClock: {
        backgroundColor: 'white',
        borderRadius: '50%',
        'react-clock__face': {
            border: '3px solid white',
        },

        'react-clock__second-hand': {
            transition: 'transform cubic-bezier(.68,0,.27,1.55) 0.2s',

            'react-clock__second-hand__body': {
                '&:before': {
                    content: '',
                    display: 'block',
                    width: 7,
                    height: 7,
                    position: 'absolute',
                    bottom: '20%',
                    left: '50%',
                    backgroundColor: 'red',
                    borderRadius: '50%',
                    transform: 'translateX(-50%) translateY(-50%)',
                },

                '&:after': {
                    content: '',
                    display: 'block',
                    width: 20,
                    height: 20,
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    backgroundColor: 'red',
                    borderRadius: '50%',
                    transform: 'translateX(-50%)',
                }
            }
        }
    },
    '@keyframes uClockFadeIn': {
        from: {
            opacity: 0
        },
        to: {
            opacity: 1,
        },
    },
    uClock: {
        animationName: '$uClockFadeIn',
        animationDuration: '500ms',
        animationEasing: 'ease-in-out',
        animationFillMode: 'both',
        backgroundColor: '#fff',
        borderRadius: '50%',
    },
    uClockHand: {
        transition: 'transform 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },
    uClockHourLabel: {
        position: 'absolute',
        display: 'flex',
        transformOrigin: 'center',
    },
    hourLabelSpan: {
        // fontWeight: 500,
    }
});

class Clock extends Generic {
    constructor(props) {
        super(props);
        this.state.time = new Date();
        this.state.width = 0;
        this.refContainer = React.createRef();
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Clock',
            visSet: 'vis-2-widgets-material',
            visName: 'Clock',
            visAttrs: [{
                name: 'common',
                fields: [
                    {
                        name: 'type',
                        label: 'vis_2_widgets_material_type',
                        type: 'select',
                        options: [
                            {
                                value: 'analog',
                                label: 'vis_2_widgets_material_analog'
                            },
                            {
                                value: 'analog2',
                                label: 'vis_2_widgets_material_analog2'
                            },
                            {
                                value: 'digital',
                                label: 'vis_2_widgets_material_digital'
                            },
                        ],
                        default: 'analog'
                    },
                    {
                        name: 'backgroundColor',
                        hidden: 'data.type === "digital"',
                        label: 'vis_2_widgets_material_background',
                        type: 'color',
                        default: '#EEE'
                    },
                    {
                        name: 'ticksColor',
                        label: 'vis_2_widgets_material_color',
                        type: 'color',
                        default: '#212121'
                    },
                    {
                        name: 'handsColor',
                        hidden: 'data.type === "digital"',
                        label: 'vis_2_widgets_material_hands_color',
                        type: 'color',
                        default: '#212121'
                    },
                    {
                        name: 'secondHandColor',
                        hidden: 'data.type === "digital"',
                        label: 'vis_2_widgets_material_seconds_hand_color',
                        type: 'color',
                        default: '#F44336'
                    },
                    {
                        name: 'withSeconds',
                        label: 'vis_2_widgets_material_seconds',
                        type: 'checkbox',
                        default: true
                    },
                    {
                        name: 'showNumbers',
                        hidden: 'data.type === "digital"',
                        label: 'vis_2_widgets_material_show_numbers',
                        type: 'checkbox',
                        default: true
                    },
                    {
                        name: 'blinkDelimiter',
                        label: 'vis_2_widgets_material_blink',
                        hidden: 'data.type !== "digital" || data.withSeconds',
                        type: 'checkbox',
                        default: true
                    },
                    {
                        name: 'hoursFormat',
                        label: 'vis_2_widgets_material_am_pm',
                        hidden: 'data.type !== "digital"',
                        type: 'options',
                        options: ['24', '12'],
                        default: '24'
                    },
                ],
            }],
            visPrev: 'widgets/vis-2-widgets-material/img/prev_clock.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Clock.getWidgetInfo();
    }

    nextTick = () => {
        const time = new Date();
        let timeout;
        this.setState({time});
        if (this.props.data.withSeconds || (this.props.data.type === 'digital' && this.props.data.blinkDelimiter)) {
            timeout = 1000 - time.getMilliseconds();
        } else {
            timeout = (1000 - time.getMilliseconds()) + 1000 * (60 - time.getSeconds());
        }
        this.timeInterval = setTimeout( this.nextTick, timeout);
    }

    async componentDidMount() {
        super.componentDidMount();
        this.timeInterval = setTimeout(this.nextTick, 1000 - new Date().getMilliseconds());

        if (this.refContainer.current) {
            let size = this.refContainer.current.clientWidth;
            if (size > this.refContainer.current.clientHeight) {
                size = this.refContainer.current.clientHeight;
            }

            if (size !== this.state.width) {
                this.setState({ width: size });
            }
        }
    }

    componentWillUnmount() {
        this.timeInterval && clearTimeout(this.timeInterval);
        super.componentWillUnmount();
    }

    componentDidUpdate() {
        super.componentDidUpdate && super.componentDidUpdate();

        if (this.refContainer.current) {
            let size = this.refContainer.current.clientWidth;
            if (size > this.refContainer.current.clientHeight) {
                size = this.refContainer.current.clientHeight;
            }

            if (size !== this.state.width) {
                this.setState({ width: size });
            }
        }
    }

    // Code was taken from here and modified as it didn't work: https://github.com/uiwjs/react-clock/blob/master/src/index.tsx
    /*
        MIT License

        Copyright (c) 2020 uiw

        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:

        The above copyright notice and this permission notice shall be included in all
        copies or substantial portions of the Software.

        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
        SOFTWARE.
     */
    renderSimpleClock() {
        const now = new Date();
        const seconds = now.getSeconds();
        const minutes = now.getMinutes();
        const hours = now.getHours() % 12;
        this.rotations = this.rotations || [0, 0, 0]; // [seconds, minutes, hours]

        if (seconds === 0) {
            this.rotations[0] += 1;
        }

        if (minutes === 0 && seconds === 0) {
            this.rotations[1] += 1;
        }

        if (hours === 0 && minutes === 0 && seconds === 0) {
            this.rotations[2] += 1;
        }

        const secondsDeg = (seconds / 60) * 360 + (this.rotations[0] * 360);
        const minutesDeg = (minutes / 60) * 360 + (this.rotations[1] * 360);
        const hoursDeg = ((hours / 12) * 360) + ((minutes / 60) * 30) + (this.rotations[2] * 360);

        return <svg
            viewBox="0 0 100 100"
            color={this.props.data.ticksColor || (this.props.typeName === 'dark' ? '#212121' : '#dedede')}
            fill="currentColor"
            width={this.state.width}
            height={this.state.width}
            style={{ backgroundColor: this.props.data.backgroundColor || (this.props.typeName === 'dark' ? '#EEE' : '#111') }}
            className={this.props.classes.uClock}
        >
            {[...Array(12)].map((_, idx) => (
                <line
                    style={{ transformOrigin: 'center' }}
                    key={idx}
                    stroke="currentColor"
                    opacity={0.7}
                    strokeWidth={1}
                    transform={`rotate(${30 * idx})`}
                    strokeLinecap="round"
                    x1="50"
                    y1="5"
                    x2="50"
                    y2="10"
                />
            ))}
            <line
                stroke={this.props.data.handsColor || (this.props.typeName === 'dark' ? '#212121' : '#dedede')}
                style={{ transform: `rotate(${hoursDeg}deg)`, transformOrigin: 'center' }}
                className={this.props.classes.uClockHand}
                strokeLinecap="round"
                strokeWidth="1.5"
                x1="50"
                y1="25"
                x2="50"
                y2="50"
            />
            <line
                stroke={this.props.data.handsColor || (this.props.typeName === 'dark' ? '#212121' : '#dedede')}
                style={{ transform: `rotate(${minutesDeg}deg)`, transformOrigin: 'center' }}
                className={this.props.classes.uClockHand}
                strokeLinecap="round"
                strokeWidth="1.5"
                x1="50"
                y1="10"
                x2="50"
                y2="50"
            />
            <circle stroke="currentColor" cx="50" cy="50" r="3" />
            {this.props.data.withSeconds ?
                <g
                    style={{ transform: `rotate(${secondsDeg}deg)`, transformOrigin: 'center' }}
                    className={this.props.classes.uClockHand}
                    stroke="currentColor"
                    color={this.props.data.secondHandColor || '#F44336'}
                    strokeWidth="1"
                >
                    <line x1="50" y1="10" x2="50" y2="60" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="1.5" />
                </g> : null}
            {this.props.data.showNumbers ?
                [...Array(12)].map((_, idx) =>
                    <text
                        key={idx.toString()}
                        className={this.props.classes.uClockHourLabel}
                        stroke="currentColor"
                        x={idx + 1 > 9 ? 46 : 48}
                        y="18"
                        transform={`rotate(${30 * (idx + 1)})`}
                        fontSize={6}
                        /*style={{
                            color: this.props.ticksColor,
                            transform: `rotate(${30 * idx}deg) translateX(${this.props.size * 0.4}px)`,
                        }}*/
                    >
                        {idx + 1}
                        {/*<text
                            className={this.props.classes.hourLabelSpan}
                            style={{
                                transform: `rotate(${-1 * 30 * index}deg)`,
                                fontSize: labelSize,
                            }}
                        >{index + 1}</text>*/}
                    </text>
                ) : null}
        </svg>;
    }

    renderAnalogClock() {
        return <AnalogClock
            size={this.state.width}
            ticksColor={this.props.data.ticksColor}
            backgroundColor={this.props.data.ticksColor}
            showNumbers={this.props.data.showNumbers}
            withSeconds={this.props.data.withSeconds}
            handsColor={this.props.data.handsColor}
            secondHandColor={this.props.data.secondHandColor}
        />;
    }

    renderDigitalClock() {
        const time = new Date();
        let text = time.getHours().toString().padStart(2, '0');
        if (this.props.data.hoursFormat === '12') {
            text = (time.getHours() % 12).toString().padStart(2, '0');
        }

        if (!this.props.data.withSeconds && this.props.data.blinkDelimiter && time.getSeconds() % 2 === 0) {
            text += ' ';
        } else {
            text += ':';
        }
        text += time.getMinutes().toString().padStart(2, '0');

        if (this.props.data.withSeconds) {
            text += ':' + time.getSeconds().toString().padStart(2, '0');
        }

        const fontSize = this.props.data.withSeconds ? 27 : 42;
        const y = this.props.data.withSeconds ? 50 + 6 : 50 + 12;

        return <svg
            viewBox="0 0 100 100"
            color={this.props.data.ticksColor || (this.props.typeName === 'dark' ? '#212121' : '#dedede')}
            fill="currentColor"
            width={this.state.width}
            height={this.state.width}
        >
            <text
                x="0"
                y={y}
                fontSize={fontSize}
            >
                {this.props.data.withSeconds ? text : time.getHours().toString().padStart(2, '0')}
            </text>
            {!this.props.data.withSeconds && (!this.props.data.blinkDelimiter || time.getSeconds() % 2 === 0) ? <text
                x={46}
                y={y}
                fontSize={fontSize}
            >:</text> : null}
            {!this.props.data.withSeconds ? <text
                x={55}
                y={y}
                fontSize={fontSize}
            >
                {time.getMinutes().toString().padStart(2, '0')}
            </text> : null}
            {this.props.data.hoursFormat === '12' ?
                <text
                    x={this.props.data.withSeconds ? 75 : 69}
                    y={y + fontSize / 2}
                    fontSize={fontSize / 2}
                >{time.getHours() > 12 ? 'PM' : 'AM'}</text>
            : null}

        </svg>
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        let clock = null;
        if (this.state.width) {
            switch (this.state.data.type) {
                default:
                case 'analog':
                    clock = this.renderSimpleClock();
                    break;
                case 'analog2':
                    clock = this.renderAnalogClock();
                    break;
                case 'digital':
                    clock = this.renderDigitalClock();
                    break;
            }
        }

        const content = <div style={{ width: '100%', height: '100%' }} ref={this.refContainer}>
            {clock}
        </div>;

        return this.wrapContent(content);
    }
}

Clock.propTypes = {
    systemConfig: PropTypes.object,
    socket: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default withStyles(styles)(Clock);
