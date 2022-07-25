import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import AnalogClock from './AnalogClock/AnalogClock';
import Generic from './Generic';

const styles = theme => ({
    '@keyframes uClockFadeIn': {
        from: {
            opacity: 0
        },
        to: {
            opacity: 1,
        },
    },
    uClock: {
        verticalAlign: 'middle',
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

function getTextWidth(text, font) {
    // re-use canvas object for better performance
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
}

function getCssStyle(element, prop) {
    return window.getComputedStyle(element, null).getPropertyValue(prop);
}

function getCanvasFont(el = document.body) {
    const fontWeight = getCssStyle(el, 'font-weight') || 'normal';
    const fontSize = getCssStyle(el, 'font-size') || '16px';
    const fontFamily = getCssStyle(el, 'font-family') || 'Times New Roman';

    return {fontWeight, fontSize, fontFamily};
}

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
            visWidgetLabel: 'vis_2_widgets_material_clock',  // Label of widget
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
                            {
                                value: 'digital2',
                                label: 'vis_2_widgets_material_digital2'
                            },
                        ],
                        default: 'analog'
                    },
                    {
                        name: 'backgroundColor',
                        hidden: 'data.type === "digital" || data.type === "digital2"',
                        label: 'vis_2_widgets_material_background',
                        type: 'color'
                    },
                    {
                        name: 'ticksColor',
                        hidden: 'data.type === "digital" || data.type === "digital2"',
                        label: 'vis_2_widgets_material_color',
                        type: 'color'
                    },
                    {
                        name: 'handsColor',
                        hidden: 'data.type === "digital" || data.type === "digital2"',
                        label: 'vis_2_widgets_material_hands_color',
                        type: 'color'
                    },
                    {
                        name: 'secondHandColor',
                        hidden: 'data.type === "digital" || data.type === "digital2"',
                        label: 'vis_2_widgets_material_seconds_hand_color',
                        type: 'color'
                    },
                    {
                        name: 'withSeconds',
                        label: 'vis_2_widgets_material_seconds',
                        type: 'checkbox',
                        default: true
                    },
                    {
                        name: 'showNumbers',
                        hidden: 'data.type === "digital" || data.type === "digital2"',
                        label: 'vis_2_widgets_material_show_numbers',
                        type: 'checkbox',
                        default: true
                    },
                    {
                        name: 'blinkDelimiter',
                        label: 'vis_2_widgets_material_blink',
                        hidden: '(data.type !== "digital" && data.type !== "digital2") || data.withSeconds',
                        type: 'checkbox',
                        default: true
                    },
                    {
                        name: 'hoursFormat',
                        label: 'vis_2_widgets_material_am_pm',
                        hidden: 'data.type !== "digital" && data.type !== "digital2"',
                        type: 'select',
                        options: ['24', '12'],
                        default: '24'
                    }
                ],
            }],
            visDefaultStyle: {
                width: 120,
                height: 120
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_clock.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Clock.getWidgetInfo();
    }

    nextTick = () => {
        const data = this.state.data || {};
        const time = new Date();
        let timeout;
        this.setState({time});
        if (data.withSeconds || (data.type === 'digital' && data.blinkDelimiter)) {
            timeout = 1000 - time.getMilliseconds();
        } else {
            timeout = (1000 - time.getMilliseconds()) + 1000 * (60 - time.getSeconds());
        }
        this.timeInterval = setTimeout(this.nextTick, timeout);
    }

    onPropertiesUpdated() {
        this.timeInterval && clearTimeout(this.timeInterval);
        this.timeInterval = setTimeout(this.nextTick, 1000 - new Date().getMilliseconds());
    }

    async componentDidMount() {
        super.componentDidMount();
        this.timeInterval = setTimeout(this.nextTick, 1000 - new Date().getMilliseconds());

        this.recalculateWidth();
    }

    recalculateWidth() {
        if (this.refContainer.current) {
            let size = this.refContainer.current.clientWidth;
            if (this.state.data.type !== 'digital') {
                if (size > this.refContainer.current.clientHeight) {
                    size = this.refContainer.current.clientHeight;
                }
            }

            let timeFormat = this.getDigitalClockText(true);
            if (size !== this.state.width || this.state.height !== this.refContainer.current.clientHeight || this.state.timeFormat !== timeFormat) {
                let fontSize = this.refContainer.current.clientHeight;
                if (this.state.data.type === 'digital' && !this.state.style['font-size']) {
                    const font = getCanvasFont(this.refContainer.current);
                    let textWidth;
                    do {
                        fontSize -= 2;
                        textWidth = getTextWidth(timeFormat, `${font.fontWeight} ${fontSize}px ${font.fontFamily}`);
                    } while (textWidth > this.refContainer.current.clientWidth || fontSize > this.refContainer.current.clientHeight);
                }

                this.setState({ width: size, height: this.refContainer.current.clientHeight, fontSize, timeFormat });
            }
        }
    }

    componentWillUnmount() {
        this.timeInterval && clearTimeout(this.timeInterval);
        super.componentWillUnmount();
    }

    componentDidUpdate() {
        super.componentDidUpdate && super.componentDidUpdate();
        this.recalculateWidth();
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
        const data = this.state.data || {};
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
            color={data.ticksColor || (this.props.themeType === 'dark' ? '#dedede' : '#212121')}
            fill="currentColor"
            width={this.state.width}
            height={this.state.width}
            style={{ backgroundColor: data.backgroundColor || (this.props.themeType === 'dark' ? '#111' : '#EEE') }}
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
                stroke={data.handsColor || (this.props.themeType === 'dark' ? '#dedede' : '#212121')}
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
                stroke={data.handsColor || (this.props.themeType === 'dark' ? '#dedede' : '#212121')}
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
            {data.withSeconds ?
                <g
                    style={{ transform: `rotate(${secondsDeg}deg)`, transformOrigin: 'center' }}
                    className={this.props.classes.uClockHand}
                    stroke="currentColor"
                    color={data.secondHandColor || '#F44336'}
                    strokeWidth="1"
                >
                    <line x1="50" y1="10" x2="50" y2="60" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="1.5" />
                </g> : null}
            {data.showNumbers ?
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
        const data = this.state.data || {};
        return <AnalogClock
            style={{
                marginTop:
                    this.refContainer.current.clientHeight > this.refContainer.current.clientWidth ?
                        (this.refContainer.current.clientHeight - this.refContainer.current.clientWidth) / 2 : undefined,
                marginLeft: this.refContainer.current.clientHeight < this.refContainer.current.clientWidth ?
                    (this.refContainer.current.clientWidth - this.refContainer.current.clientHeight) / 2 : undefined,
            }}
            size={this.state.width}
            ticksColor={data.ticksColor}
            backgroundColor={data.backgroundColor}
            showNumbers={data.showNumbers}
            withSeconds={data.withSeconds}
            handsColor={data.handsColor}
            secondHandColor={data.secondHandColor}
            themeType={this.props.themeType}
        />;
    }

    getDigitalClockText(replaceWithZero) {
        const data = this.state.data || {};
        let text;
        if (replaceWithZero) {
            text = '00:00';
            if (data.withSeconds) {
                text += ':00';
            }
            if (data.hoursFormat === '12') {
                text += ' pm';
            }
        } else {
            const time = new Date();
            text = time.getHours().toString().padStart(2, '0');
            if (data.hoursFormat === '12') {
                text = (time.getHours() % 12).toString().padStart(2, '0');
            }

            if (!data.withSeconds && data.blinkDelimiter && time.getSeconds() % 2 === 0) {
                text += ' ';
            } else {
                text += ':';
            }
            text += time.getMinutes().toString().padStart(2, '0');

            if (data.withSeconds) {
                text += ':' + time.getSeconds().toString().padStart(2, '0');
            }
            if (data.hoursFormat === '12') {
                text += time.getHours() > 11 ? ' pm' : ' am';
            }
        }

        return text;
    }

    renderDigitalClock() {
        return <div
            style={{
                display: 'inline-block',
                margin: '0 auto',
                fontSize: this.state.style['font-size'] || this.state.fontSize
            }}
        >
            {this.getDigitalClockText()}
        </div>
    }

    renderDigitalClock2() {
        const data = this.state.data || {};
        const time = new Date();
        let text = time.getHours().toString().padStart(2, '0');
        if (data.hoursFormat === '12') {
            text = (time.getHours() % 12).toString().padStart(2, '0');
        }

        if (!data.withSeconds && data.blinkDelimiter && time.getSeconds() % 2 === 0) {
            text += ' ';
        } else {
            text += ':';
        }
        text += time.getMinutes().toString().padStart(2, '0');

        if (data.withSeconds) {
            text += ':' + time.getSeconds().toString().padStart(2, '0');
        }

        const svgHeight = this.state.height / this.state.width * 100;
        let fontSize = data.withSeconds ? 28 : (data.blinkDelimiter ? 36 : 42);
        if (svgHeight < 100) {
            fontSize = data.withSeconds ? svgHeight * 0.8 : svgHeight * 0.9;
        }

        return <svg
            viewBox={`0 0 100 ${svgHeight}`}
            color={data.ticksColor || (this.props.themeType === 'dark' ? '#dedede' : '#212121')}
            fill="currentColor"
            width={this.state.width}
            height={this.state.height}
        >
            <text
                x="50%"
                y="50%"
                fontSize={fontSize}
                dominantBaseline="middle"
                textAnchor="middle"
                fontFamily={data.withSeconds || !data.blinkDelimiter ? undefined : 'monospace'}
            >
                {text}
            </text>
            {data.hoursFormat === '12' ?
                <text
                    x="50%"
                    y="50%"
                    transform={`translate(${data.withSeconds ? 28 : (data.blinkDelimiter ? 30 : 20)}, 17)`}
                    fontSize={data.withSeconds ? fontSize / 3 : (data.blinkDelimiter ? fontSize / 4 : fontSize / 3)}
                >{time.getHours() > 11 ? 'PM' : 'AM'}</text>
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
                case 'digital2':
                    clock = this.renderDigitalClock2();
                    break;
            }
        }

        const content = <div
            style={Object.assign({
                width: 'calc(100% - 16px)',
                height: 'calc(100% - 40px)',
                textAlign: 'center',
                lineHeight: this.state.height ? this.state.height + 'px' : undefined
            }, {
                fontFamily: this.state.style['font-family'],
                fontShadow: this.state.style['font-shadow'],
                fontStyle: this.state.style['font-style'],
                fontWeight: this.state.style['font-weight'],
                fontVariant: this.state.style['font-variant'],
            })}
            ref={this.refContainer}
        >
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
