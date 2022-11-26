import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import { Utils } from '@iobroker/adapter-react-v5';

import Generic from './Generic';
import DialogBlinds from './Components/DialogBlinds';

const styles = () => ({
    cardContent: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        overflow: 'hidden',
    },
    noSpace: {
        border: 0,
        margin: 0,
        padding: 0,
        borderSpacing: 0,
        borderImageWidth: 0,
    },
    blindHandle: {
        position: 'absolute',
        borderColor: '#a5aaad',
        borderStyle: 'solid',
        background: 'linear-gradient(to bottom, rgba(226, 226, 226, 1) 0%, rgba(219, 219, 219, 1) 50%, rgba(209, 209, 209, 1) 51%, rgba(254, 254, 254, 1) 100%)',
    },
    blindBlind: {
        backgroundImage: 'linear-gradient(0deg, #949494 4.55%, #c9c9c9 4.55%, #c9c9c9 50%, #949494 50%, #949494 54.55%, #c9c9c9 54.55%, #c9c9c9 100%)',
        backgroundSize: '100% 20px',
        backgroundPosition: 'center bottom',
        width: '100%',
        position: 'absolute',
        transitionProperty: 'height',
        transitionDuration: '0.3s',
    },
    blindBlind1: {
        height: '100%',
        boxSizing: 'border-box',
        borderStyle: 'solid',
        background: 'linear-gradient(45deg, rgba(173, 174, 178, 1) 0%, rgba(251, 251, 251, 1) 100%)',
    },
    blindBlind2: {
        position: 'relative',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        borderStyle: 'solid',
        borderColor: 'rgba(0, 0, 0, 0)',
    },
    blindBlind3: {
        position: 'relative',
        width: '100%;',
        height: '100%;',
        boxSizing: 'border-box',
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, rgba(0, 51, 135, 0.83) 100%)',
    },
    blindBlind4: {
        position: 'relative',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        borderStyle: 'solid',
        background: 'linear-gradient(45deg, rgba(221, 231, 243, 0.7) 0%, rgba(120, 132, 146, 0.7) 52%, rgba(166, 178, 190, 0.7) 68%, rgba(201, 206, 210, 0.7) 100%)',
        transitionProperty: 'transform',
        transitionDuration: '0.3s',
        transformOrigin: '0 100%',
    },
    blindBlind4_left: {
        transformOrigin: '0 0',
    },
    blindBlind4_right: {
        transformOrigin: '100% 0',
    },
    blindBlind4_top: {
        transformOrigin: '0 100%',
    },
    blindBlind4_bottom: {
        transformOrigin: '0 0',
    },
    blindBlind4Opened_left: {
        transform: 'skew(0deg, 10deg) scale(0.9, 1)',
    },
    blindBlind4Opened_right: {
        transform: 'skew(0deg, -10deg) scale(0.9, 1)',
    },
    blindBlind4Opened_top: {
        transform: 'skew(-10deg, 0deg) scale(1, 0.9)',
    },
    blindBlind4Opened_bottom: {
        transform: 'skew(10deg, 0deg) scale(1, 0.9)',
    },
    blindBlind4_tilted: {
        transform: 'skew(-10deg, 0deg) scale(1, 0.9)',
        transformOrigin: '0 100%',
    },
    blindHandleBG: {
    },
    blindHandleTiltedBG: {
        background: 'linear-gradient(to bottom, rgba(241, 231, 103, 1) 0%, rgba(254, 182, 69, 1) 100%)',
    },
});

class Blinds extends Generic {
    constructor(props) {
        super(props);
        this.state.showBlindsDialog = null;
        // this.state.values = {};
        this.state.objects = {};
        this.refCardContent = React.createRef();
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Blinds',
            visSet: 'vis-2-widgets-material',
            visName: 'Blinds',
            visWidgetLabel: 'blinds',  // Label of widget
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'name',
                            label: 'name',
                        },
                        {
                            name: 'sashCount',
                            type: 'number',
                            default: 1,
                            label: 'sash_count',
                        },
                        {
                            name: 'ratio',
                            type: 'slider',
                            min: 0.1,
                            max: 3,
                            step: 0.1,
                            label: 'window_ratio',
                            default: 1,
                        },
                        {
                            name: 'borderWidth',
                            type: 'slider',
                            min: 0,
                            max: 100,
                            step: 0.1,
                            label: 'border_width',
                            default: 3,
                        },
                        {
                            name: 'oid',
                            type: 'id',
                            default: '',
                            label: 'blinds_position_oid',
                            noInit: true,
                            onChange: async (field, data, changeData, socket) => {
                                const object = await socket.getObject(data[field.name]);
                                if (object && object.common) {
                                    let changed = false;

                                    // try to find stop button
                                    const id = object._id.split('.');
                                    id.pop();
                                    const states = await socket.getObjectView(`${id.join('.')}.`, `${id.join('.')}.\u9999`, 'state');
                                    if (states) {
                                        Object.values(states).forEach(state => {
                                            if (state?.common?.role?.includes('stop')) {
                                                data.blinds_stop_oid = state._id;
                                                changed = true;
                                            }
                                        });
                                    }

                                    changed && changeData(data);
                                }
                            },
                        },
                        {
                            name: 'oid_stop',
                            type: 'id',
                            default: '',
                            label: 'blinds_stop_oid',
                            noInit: true,
                            hidden: data => !data.oid,
                        },
                        {
                            label: 'show_value',
                            type: 'checkbox',
                            name: 'showValue',
                            hidden: data => !data.oid,
                            default: true,
                        },
                        {
                            label: 'min_position',
                            type: 'number',
                            hidden: data => !data.oid,
                            name: 'min',
                        },
                        {
                            label: 'max_position',
                            type: 'number',
                            hidden: data => !data.oid,
                            name: 'max',
                        },
                        {
                            label: 'invert_position',
                            type: 'checkbox',
                            hidden: data => !data.oid,
                            name: 'invert',
                        },
                    ],
                },
                {
                    name: 'sashes',
                    label: 'sash',
                    indexFrom: 1,
                    indexTo: 'sashCount',
                    fields: [
                        {
                            name: 'slideSensor_oid',
                            type: 'id',
                            label: 'slide_sensor_oid',
                            noInit: true,
                        },
                        {
                            name: 'slideHandle_oid',
                            type: 'id',
                            label: 'handle_sensor_oid',
                            noInit: true,
                        },
                        {
                            name: 'slideType',
                            type: 'select',
                            label: 'sash_type',
                            options: [
                                { value: '', label: 'sash_none' },
                                { value: 'left', label: 'left' },
                                { value: 'right', label: 'right' },
                                { value: 'top', label: 'top' },
                                { value: 'bottom', label: 'bottom' },
                            ],
                        },
                        {
                            name: 'slideRatio',
                            type: 'slider',
                            label: 'slide_ratio',
                            default: 1,
                            min: 0.1,
                            max: 4,
                            step: 0.1,
                            hidden: data => data.sashCount < 2,
                        },
                        {
                            name: 'slidePos_oid',
                            type: 'id',
                            default: '',
                            label: 'blinds_position_oid',
                            hidden: data => !!data.oid,
                            noInit: true,
                            onChange: async (field, data, changeData, socket) => {
                                const object = await socket.getObject(data[field.name]);
                                const index = field.name.match(/(\d+)$/)[1];
                                if (object && object.common) {
                                    let changed = false;
                                    // try to find stop button
                                    const id = object._id.split('.');
                                    id.pop();
                                    const states = await socket.getObjectView(`${id.join('.')}.`, `${id.join('.')}.\u9999`, 'state');
                                    if (states) {
                                        Object.values(states).forEach(state => {
                                            if (state?.common?.role?.includes('stop')) {
                                                data[`slideStop_oid${index}`] = state._id;
                                                changed = true;
                                            }
                                        });
                                    }
                                    changed && changeData(data);
                                }
                            },
                        },
                        {
                            name: 'slideStop_oid',
                            type: 'id',
                            default: '',
                            label: 'blinds_stop_oid',
                            noInit: true,
                            hidden: (data, index) => !!data.oid || !data[`slidePos_oid${index}`],
                        },
                        {
                            label: 'min_position',
                            type: 'number',
                            hidden: (data, index) => !!data.oid || !data[`slidePos_oid${index}`],
                            name: 'slideMin',
                        },
                        {
                            label: 'max_position',
                            type: 'number',
                            hidden: (data, index) => !!data.oid || !data[`slidePos_oid${index}`],
                            name: 'slideMax',
                        },
                        {
                            label: 'invert_position',
                            type: 'checkbox',
                            hidden: (data, index) => !!data.oid || !data[`slidePos_oid${index}`],
                            name: 'slideInvert',
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 120,
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_blinds.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Blinds.getWidgetInfo();
    }

    async propertiesUpdate() {
        const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData === actualRxData) {
            return;
        }

        this.lastRxData = actualRxData;
        const objects = {};

        const _object = this.state.rxData.oid && this.state.rxData.oid !== 'nothing_selected' ? (await this.props.socket.getObject(this.state.rxData.oid)) : null;
        objects.main = _object?.common || {};

        // try to find icons for all OIDs
        for (let index = 1; index <= this.state.rxData.sashCount; index++) {
            if (this.state.rxData[`slidePos_oid${index}`] && this.state.rxData[`slidePos_oid${index}`] !== 'nothing_selected') {
                // read object itself
                const object = await this.props.socket.getObject(this.state.rxData[`slidePos_oid${index}`]);
                if (!object) {
                    objects[index] = { };
                    continue;
                }

                objects[index] = object?.common || {};
            }
        }

        if (JSON.stringify(objects) !== JSON.stringify(this.state.objects)) {
            this.setState({ objects });
        }
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.propertiesUpdate();
    }

    async onRxDataChanged() {
        await this.propertiesUpdate();
    }

    getMinMaxPosition(index) {
        const stopOid     = index ? this.state.rxData[`slideStop_oid${index}`] : this.state.rxData.oid_stop;
        let   positionOid = index && !this.state.rxData.oid ? this.state.rxData[`slidePos_oid${index}`] : this.state.rxData.oid;
        let   invert      = index && !this.state.rxData.oid ? this.state.rxData[`slideInvert${index}`] : this.state.rxData.invert;

        if (index && (positionOid === 'nothing_selected' || !positionOid)) {
            positionOid = this.state.rxData.oid;
            invert      = this.state.rxData.invert;
        }

        let min;
        let max;

        if (!index) {
            min = parseFloat(this.state.rxData.min);
            if (Number.isNaN(min)) {
                min = this.state.objects.main?.min;
                if (Number.isNaN(min)) {
                    min = 0;
                }
            }
            max = parseFloat(this.state.rxData.max);
            if (Number.isNaN(max)) {
                max = this.state.objects.main?.max;
                if (Number.isNaN(max)) {
                    max = 100;
                }
            }
        } else {
            min = parseFloat(this.state.rxData[`slideMin${index}`]);
            if (Number.isNaN(min)) {
                min = parseFloat(this.state.objects[index]?.min);
                if (Number.isNaN(min)) {
                    min = parseFloat(this.state.rxData.min);
                    if (Number.isNaN(min)) {
                        min = parseFloat(this.state.objects.main?.min);
                        if (Number.isNaN(min)) {
                            min = 0;
                        }
                    }
                }
            }
            max = parseFloat(this.state.rxData[`slideMa${index}`]);
            if (Number.isNaN(max)) {
                max = parseFloat(this.state.objects[index]?.max);
                if (Number.isNaN(max)) {
                    max = parseFloat(this.state.rxData.max);
                    if (Number.isNaN(max)) {
                        max = parseFloat(this.state.objects.main?.max);
                        if (Number.isNaN(max)) {
                            max = 100;
                        }
                    }
                }
            }
        }

        let shutterPos = this.state.values[`${positionOid}.val`];
        if (shutterPos === undefined || shutterPos === null) {
            shutterPos = 0;
        } else {
            if (shutterPos < min) {
                shutterPos = min;
            }
            if (shutterPos > max) {
                shutterPos = max;
            }

            // console.log(`[${index}]shutterPos: ${shutterPos}, positionOid: ${positionOid}, min: ${min}, max: ${max}, invert: ${invert}`);
            shutterPos = Math.round((100 * (shutterPos - min)) / (max - min));
        }
        if (invert) {
            shutterPos = 100 - shutterPos;
        }

        return {
            min,
            max,
            shutterPos,
            invert,
            stopOid,
            positionOid,
            customOid: positionOid !== this.state.rxData.oid,
            hasControl: positionOid !== 'nothing_selected' && positionOid,
        };
    }

    renderBlindsDialog() {
        if (this.state.showBlindsDialog !== null) {
            const data = this.getMinMaxPosition(this.state.showBlindsDialog === true ? 0 : this.state.showBlindsDialog);

            return <DialogBlinds
                onClose={() => {
                    this.lastClick = Date.now();
                    this.setState({ showBlindsDialog: null });
                }}
                onStop={data.stopOid && data.stopOid !== 'nothing_selected' ? () => this.props.socket.setState(data.stopOid, { val: true, ack: false }) : null}
                onValueChange={value => {
                    // calculate real value
                    if (data.invert) {
                        value = 100 - value;
                    }

                    value = ((data.max - data.min) / 100) * value + data.min;

                    this.props.socket.setState(data.positionOid, { val: value, ack: false });
                }}
                startValue={data.shutterPos}
                type={DialogBlinds.types.blinds}
            />;
        }

        return null;
    }

    renderOneWindow(index, options) {
        const data = this.getMinMaxPosition(index);

        let handlePos = null;
        let slidePos = null;
        if (options.handleOid) {
            handlePos = this.state.values[`${options.handleOid}.val`];
            /* problem ?? */
            if (handlePos === 2 || handlePos === '2') {
                handlePos = 1;
            } else if (handlePos === 1 || handlePos === '1') {
                handlePos = 2;
            }
            if (handlePos === '1' || handlePos === true || handlePos === 'true' || handlePos === 'open' || handlePos === 'opened') {
                handlePos = 1;
            } else if (handlePos === '2' || handlePos === 'tilt' || handlePos === 'tilted') {
                handlePos = 2;
            }

            slidePos = handlePos;
        }
        if (options.slideOid) {
            slidePos = this.state.values[`${options.slideOid}.val`];
            if (slidePos === 2 || slidePos === '2') {
                slidePos = 2;
            }
            if (slidePos === '1' || slidePos === true || slidePos === 'true' || slidePos === 'open' || slidePos === 'opened') {
                slidePos = 1;
            } else if (slidePos === '2' || slidePos === 'tilt' || slidePos === 'tilted') {
                slidePos = 2;
            }
            if (!options.handleOid) {
                handlePos = slidePos;
            }
        }
        let divHandle = null;
        if (options.type) {
            let bbWidth = Math.round(options.borderWidth / 3);
            if (bbWidth < 1) {
                bbWidth = 1;
            }
            const style = {
                borderWidth: bbWidth,
                transitionProperty: 'transform',
                transitionDuration: '0.3s',
            };
            if (options.type === 'left' || options.type === 'right') {
                style.top = '50%';
                style.width = options.borderWidth;
                style.height = '10%';
            } else if (options.type === 'top' || options.type === 'bottom') {
                style.left = '50%';
                // noinspection JSSuspiciousNameCombination
                style.height = options.borderWidth;
                style.width = '10%';
            }
            if (options.type === 'left') {
                style.left = `calc(100% - ${bbWidth * 2 + options.borderWidth}px)`;
            } else if (options.type === 'bottom') {
                style.top = `calc(100% - ${bbWidth * 2 + options.borderWidth}px)`;
            }
            if (handlePos) {
                if (options.type === 'right') {
                    const w = Math.round(bbWidth + options.borderWidth / 2);
                    style.transformOrigin = `${w}px ${w}px`;
                    style.top = `calc(50% + ${w}px)`;
                    if (handlePos === 1) {
                        style.transform = 'rotate(-90deg)';
                    } else if (handlePos === 2) {
                        style.transform = 'rotate(180deg)';
                    }
                } else if (options.type === 'bottom') {
                    const w = Math.round(bbWidth + options.borderWidth / 2);
                    style.transformOrigin = `${w}px ${w}px`;
                    if (handlePos === 1) {
                        style.transform = 'rotate(-90deg)';
                    } else if (handlePos === 2) {
                        style.transform = 'rotate(180deg)';
                    }
                } else if (handlePos === 1) {
                    style.transform = 'rotate(90deg)';
                } else if (handlePos === 2) {
                    style.transform = 'rotate(180deg)';
                }
            }

            divHandle = <div
                className={Utils.clsx(
                    this.props.classes.blindHandle,
                    handlePos === 2 && this.props.classes.blindHandleTiltedBG,
                )}
                style={style}
            />;
        }

        return <div
            key={index}
            className={this.props.classes.blindBlind1}
            style={{
                borderWidth: options.borderWidth,
                borderColor: '#a9a7a8',
                flex: options.flex || 1,
            }}
        >
            <div
                className={this.props.classes.blindBlind2}
                style={{ borderWidth: options.borderWidth }}
                onClick={data.customOid ? e => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.lastClick = Date.now();
                    this.setState({ showBlindsDialog: index });
                } : undefined}
            >
                <div className={this.props.classes.blindBlind3}>
                    <div style={{ height: `${100 - data.shutterPos}%` }} className={this.props.classes.blindBlind} />
                    <div
                        className={Utils.clsx(
                            this.props.classes.blindBlind4,
                            options.type && this.props.classes[`blindBlind4_${options.type}`],
                            slidePos === 1 && options.type && this.props.classes[`blindBlind4Opened_${options.type}`],
                            slidePos === 2 && options.type && this.props.classes.blindBlind4_tilted,
                        )}
                        style={{ borderWidth: options.borderWidth, borderColor: '#a5aaad' }}
                    >
                        {divHandle}
                    </div>
                </div>
            </div>
        </div>;
    }

    renderWindows(size) {
        /*
        $div.find('.hq-blind-blind2').each(function (id) {
            id++;
            if (data['oid-slide-sensor-lowbat' + id]) {
                data['oid-slide-sensor-lowbat'][id] = vis.states[data['oid-slide-sensor-lowbat' + id] + '.val'];
                $(this).batteryIndicator({
                    show:    data['oid-slide-sensor-lowbat'][id] || false,
                    title:   _('Low battery on sash sensor'),
                    classes: 'slide-low-battery'
                });
            }
        });
        $div.find('.hq-blind-blind3').each(function (id) {
            id++;
            if (data['oid-slide-handle-lowbat' + id]) {
                data['oid-slide-handle-lowbat'][id] = vis.states[data['oid-slide-handle-lowbat' + id] + '.val'];
                $(this).batteryIndicator({
                    show:    data['oid-slide-handle-lowbat'][id] || false,
                    color:   '#FF55FA',
                    title:   _('Low battery on handle sensor'),
                    classes: 'handle-low-battery'
                });
                $(this).find('.handle-low-battery').css({top: 8});
            }
        });

        var width = $div.width();
        var offset = width - 20;
        if (offset < width / 2) offset = width / 2;
        $div.find('.vis-hq-leftinfo').css({right: offset + 'px'});
        $div.find('.vis-hq-rightinfo').css({'padding-left': (5 + (width / 2) + (parseInt(data.infoRightPaddingLeft, 10) || 0)) + 'px'});
        */
        let width;
        let height;
        const ratio = parseFloat(this.state.rxData.ratio) || 1;
        height = size.height;
        width = Math.round(height * ratio);
        if (width > size.width) {
            width = size.width;
            height = Math.round(width / ratio);
        }
        const _size = size.width > size.height ? size.height : size.width;

        let borderWidth = parseFloat(this.state.rxData.borderWidth) || 2.5;
        borderWidth = Math.round((_size * borderWidth) / 10) / 10;
        if (borderWidth < 1) {
            borderWidth = 1;
        }

        const windows = [];
        for (let i = 1; i <= this.state.rxData.sashCount; i++) {
            const options = {
                slideOid:  this.state.rxData[`slideSensor_oid${i}`],
                handleOid: this.state.rxData[`slideHandle_oid${i}`],
                type:      this.state.rxData[`slideType${i}`],
                flex:      this.state.rxData[`slideRatio${i}`],
                borderWidth,
                size,
            };
            windows.push(this.renderOneWindow(i, options));
        }

        // noinspection JSSuspiciousNameCombination
        const style = {
            paddingTop: borderWidth,
            paddingBottom: borderWidth - 1,
            paddingRight: borderWidth + 1,
            paddingLeft: borderWidth + 1,
            width,
            height,
            display: 'flex',
            alignItems: 'stretch',
        };
        return <div style={style}>
            {windows}
        </div>;
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

        let height;
        let width;
        if (!this.refCardContent.current) {
            setTimeout(() => this.forceUpdate(), 50);
        } else {
            height = this.refCardContent.current.offsetHeight; // take 10° for opened slash
            // if one of the slashes could be opened, find length of it
            let length = 0;
            for (let i = 1; i <= this.state.rxData.sashCount; i++) {
                if (this.state.rxData[`slideSensor_oid${i}`] || this.state.rxData[`slideHandle_oid${i}`]) {
                    if (length < this.state.rxData[`slideRatio${i}`]) {
                        length = this.state.rxData[`slideRatio${i}`];
                    }
                }
            }

            width = this.refCardContent.current.offsetWidth;

            if (length) {
                const oneWidth = (width / this.state.rxData.sashCount) * length;
                height -= 0.12 * oneWidth;
            }
        }

        const data = this.getMinMaxPosition(0);

        const content = <div
            ref={this.refCardContent}
            className={this.props.classes.cardContent}
            style={{ cursor: data.hasControl ? 'pointer' : undefined }}
            onClick={data.hasControl ? e => {
                e.stopPropagation();
                e.preventDefault();
                if (!this.lastClick || Date.now() - this.lastClick > 300) {
                    this.setState({ showBlindsDialog: true });
                }
            } : undefined}
        >
            {height ? this.renderBlindsDialog() : null}
            {height ? this.renderWindows({ height, width }) : null}
        </div>;

        return this.wrapContent(
            content,
            this.state.rxData.showValue && data.hasControl ?
                <span>
                    {data.shutterPos}
                    %
                </span> : null,
            { height: 'calc(100% - 40px)' },
        );
    }
}

Blinds.propTypes = {
    systemConfig: PropTypes.object,
    socket: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default withStyles(styles)(Blinds);
