import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';

import {
    Close as CloseIcon,
} from '@mui/icons-material';

import { Utils } from '@iobroker/adapter-react-v5';

import Generic from './Generic';

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
    },
    blindBlind4Opened_left: {
        transform: 'skew(0deg, 10deg) scale(0.9, 1)',
        transformOrigin: '0 0',
    },
    blindBlind4Opened_right: {
        transform: 'skew(0deg, -10deg) scale(0.9, 1)',
        transformOrigin: '100% 0',
    },
    blindBlind4Opened_top: {
        transform: 'skew(-10deg, 0deg) scale(1, 0.9)',
        transformOrigin: '0 100%',
    },
    blindBlind4Opened_bottom: {
        transform: 'skew(10deg, 0deg) scale(1, 0.9)',
        transformOrigin: '0 0',
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
                            onChange: async (field, data, changeData, socket) => {
                                const object = await socket.getObject(data[field.name]);
                                if (object && object.common) {
                                    let changed = false;
                                    if (object.common.min !== undefined && object.common.min !== data.min) {
                                        data.min = object.common.min;
                                        changed = true;
                                    }
                                    if (object.common.max !== undefined && object.common.max !== data.max) {
                                        data.max = object.common.max;
                                        changed = true;
                                    }

                                    changed && changeData(data);
                                }
                            },
                        },
                        {
                            label: 'show_value',
                            type: 'checkbox',
                            name: 'showValue',
                            default: true,
                        },
                        {
                            label: 'min_position',
                            type: 'number',
                            name: 'min',
                        },
                        {
                            label: 'max_position',
                            type: 'number',
                            name: 'max',
                        },
                        {
                            label: 'invert_position',
                            type: 'checkbox',
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
                            name: 'slideSensorOid',
                            type: 'id',
                            label: 'slide_sensor_oid',
                        },
                        {
                            name: 'slideHandleOid',
                            type: 'id',
                            label: 'handle_sensor_oid',
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

        // try to find icons for all OIDs
        for (let index = 1; index <= this.state.rxData.count; index++) {
            if (this.state.rxData[`oid${index}`] && this.state.rxData[`oid${index}`] !== 'nothing_selected') {
                // read object itself
                const object = await this.props.socket.getObject(this.state.rxData[`oid${index}`]);
                if (!object) {
                    objects[index] = { common: {} };
                    continue;
                }
                object.common = object.common || {};
                if (object.common.type === 'number') {
                    if (object.common.max === undefined) {
                        object.common.max = 100;
                    }
                    if (object.common.min === undefined) {
                        object.common.min = 0;
                    }
                }
                if (object.common.states && Array.isArray(object.common.states)) {
                    // convert to {'state1': 'state1', 'state2': 'state2', ...}
                    const states = {};
                    object.common.states.forEach(state => states[state] = state);
                    object.common.states = states;
                }

                if (!this.state.rxData[`icon${index}`] && !this.state.rxData[`iconSmall${index}`] && !object.common.icon && (object.type === 'state' || object.type === 'channel')) {
                    const idArray = this.state.rxData[`oid${index}`].split('.');

                    // read channel
                    const parentObject = await this.props.socket.getObject(idArray.slice(0, -1).join('.'));
                    if (!parentObject?.common?.icon && (object.type === 'state' || object.type === 'channel')) {
                        const grandParentObject = await this.props.socket.getObject(idArray.slice(0, -2).join('.'));
                        if (grandParentObject?.common?.icon) {
                            object.common.icon = grandParentObject.common.icon;
                            if (grandParentObject.type === 'instance' || grandParentObject.type === 'adapter') {
                                object.common.icon = `../${grandParentObject.common.name}.admin/${object.common.icon}`;
                            }
                        }
                    } else {
                        object.common.icon = parentObject.common.icon;
                        if (parentObject.type === 'instance' || parentObject.type === 'adapter') {
                            object.common.icon = `../${parentObject.common.name}.admin/${object.common.icon}`;
                        }
                    }
                }
                objects[index] = { common: object.common, _id: object._id };
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

    renderBlindsDialog() {
        const index = this.state.showBlindsDialog;
        if (index !== null) {
            return <Dialog
                fullWidth
                maxWidth="sm"
                open={!0}
                onClose={() => this.setState({ showBlindsDialog: null })}
            >
                <DialogTitle>
                    {this.state.rxData[`title${index}`] || this.state.objects[index].common.name}
                    <IconButton style={{ float: 'right' }} onClick={() => this.setState({ showBlindsDialog: null })}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent>

                </DialogContent>
            </Dialog>;
        }

        return null;
    }

    renderOneWindow(index, options) {
        const shutterPos = options.shutterPos || 0;
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
            if (!options.handleOid) {
                handlePos = slidePos;
            }
            if (slidePos === 2 || slidePos === '2') {
                slidePos = 2;
            }
            if (slidePos === '1' || slidePos === true || slidePos === 'true' || slidePos === 'open' || slidePos === 'opened') {
                handlePos = 1;
            } else if (slidePos === '2' || slidePos === 'tilt' || slidePos === 'tilted') {
                slidePos = 2;
            }
        }
        let divHandle = null;
        if (options.type) {
            let bbWidth = Math.round(options.borderWidth / 3);
            if (bbWidth < 1) {
                bbWidth = 1;
            }
            const style = { borderWidth: bbWidth };
            if (options.type === 'left' || options.type === 'right') {
                style.top = '50%';
                style.width = options.borderWidth;
                style.height = '10%';
            } else if (options.type === 'top' || options.type === 'bottom') {
                style.left = '50%';
                style.height = options.borderWidth;
                style.width = '10%';
            }
            if (options.type === 'left') {
                style.left = `calc(100% - ${bbWidth * 2 + options.borderWidth}px)`;
            } else if (options.type === 'bottom') {
                style.top = `calc(100% - ${bbWidth * 2 + options.borderWidth}px)`;
            }
            if (handlePos) {
                const w = Math.round(bbWidth + options.borderWidth / 2);
                if (options.type === 'right' || options.type === 'bottom') {
                    style.transformOrigin = `${w}px ${w}px`;
                    if (handlePos === 1) {
                        style.transform = 'rotate(-90)';
                    } else if (handlePos === 2) {
                        style.transform = 'rotate(180)';
                    }
                } else if (handlePos === 1) {
                    style.transform = 'rotate(90)';
                } else if (handlePos === 2) {
                    style.transform = 'rotate(180)';
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
            <div className={this.props.classes.blindBlind2} style={{ borderWidth: options.borderWidth }}>
                <div className={this.props.classes.blindBlind3}>
                    <div style={{ height: `${shutterPos}%` }} className={this.props.classes.blindBlind} />
                    <div
                        className={Utils.clsx(
                            this.props.classes.blindBlind4,
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

    renderWindow(shutterPos, size) {
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
                slideOid:  this.state.rxData[`slideSensorOid${i}`],
                handleOid: this.state.rxData[`slideHandleOid${i}`],
                type:      this.state.rxData[`slideType${i}`],
                flex:      this.state.rxData[`slideRatio${i}`],
                borderWidth,
                shutterPos,
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
            height = this.refCardContent.current.offsetHeight;
            width = this.refCardContent.current.offsetWidth;
        }

        let min = parseFloat(this.state.rxData.min);
        if (this.state.rxData.min === undefined || this.state.rxData.min === null || this.state.rxData.min === '' || Number.isNaN(min)) {
            min = 0;
        }
        let max = parseFloat(this.state.rxData.max);
        if (this.state.rxData.max === undefined || this.state.rxData.max === null || this.state.rxData.max === '' || Number.isNaN(max)) {
            max = 100;
        }

        // get position
        let shutterPos = 0;
        if (this.state.rxData.oid) {
            shutterPos = this.state.values[`${this.state.rxData.oid}.val`];
            if (shutterPos === undefined || shutterPos === null) {
                shutterPos = 0;
            } else {
                if (shutterPos < min) {
                    shutterPos = min;
                }
                if (shutterPos > max) {
                    shutterPos = max;
                }

                shutterPos = Math.round((100 * (shutterPos - min)) / (max - min));
            }
            if (this.state.rxData.invert) {
                shutterPos = 100 - shutterPos;
            }
        }

        const content = <div
            ref={this.refCardContent}
            className={this.props.classes.cardContent}
        >
            {height ? this.renderBlindsDialog() : null}
            {height ? this.renderWindow(shutterPos, { height, width }) : null}
        </div>;

        return this.wrapContent(
            content,
            this.state.rxData.showValue ?
                <span>
                    {shutterPos}
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
