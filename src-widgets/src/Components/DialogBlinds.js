/*
 * Copyright 2018-2022 bluefox <dogafox@gmail.com>
 *
 * Licensed under the Creative Commons Attribution-NonCommercial License, Version 4.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { darken } from '@mui/material/styles';
import { withStyles } from '@mui/styles';

import {
    Dialog, DialogContent, DialogTitle, IconButton, Button, Fab,
} from '@mui/material';

import {
    Stop as IconStop,
    KeyboardDoubleArrowUp as IconUp,
    KeyboardDoubleArrowDown as IconDown,
    Lightbulb as IconLamp, Close as CloseIcon,
} from '@mui/icons-material';

import { I18n, Utils } from '@iobroker/adapter-react-v5';

const styles = () => ({
    dialogPaper: {
        maxHeight: 800,
    },
    dialogTitle: {
        textAlign: 'center',
    },
    wrapperSliderBlock: {
        display: 'flex',
        flexDirection: 'column',
    },
    buttonStopStyle: {
        float: 'left',
    },
    sliderText: {
        display: 'inline-block',
    },
    sliderStyle: {
        marginTop: '1em',
        marginBottom: '1em',
        position: 'relative',
        zIndex: 11,
        width: '10em',
        // border: '1px solid #b5b5b5',
        borderRadius: '2em',
        overflow: 'hidden',
        background: 'white',
        cursor: 'pointer',
        boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)',
        height: '20em',
        boxSizing: 'border-box',
    },
});

const LAMP_ON_COLOR = '#c7c70e';

let mouseDown = false;
class DialogBlinds extends Component {
    // expected:
    static types = {
        value: 0,
        dimmer: 1,
        blinds: 2,
    };

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.startValue || 0,
            toggleValue: this.props.startToggleValue || false,
            lastControl: 0,
        };

        this.refSlider = React.createRef();

        this.type = this.props.type || DialogBlinds.types.dimmer;
        // this.step = this.props.step || 20;
        this.button = {
            time: 0,
            name: '',
            timer: null,
            timeUp: 0,
        };
    }

    static getDerivedStateFromProps(nextProps, state) {
        let newState;
        if (nextProps.startValue !== state.value && !mouseDown && Date.now() - state.lastControl > 1000) {
            newState = newState || {};
            newState.value = nextProps.startValue;
        }
        if (nextProps.startToggleValue !== undefined && nextProps.startToggleValue !== state.toggleValue) {
            newState = newState || {};
            newState.toggleValue = nextProps.startToggleValue;
        }
        return newState || null;
    }

    eventToValue(e) {
        const pageY = e.touches ? e.touches[e.touches.length - 1].clientY : e.clientY;

        let value = 100 - Math.round(((pageY - this.top) / this.height) * 100) + 9;

        if (value > 100) {
            value = 100;
        } else if (value < 0) {
            value = 0;
        }
        this.setState({ value });
        if (Date.now() - this.state.lastControl > 200 && this.type !== DialogBlinds.types.blinds) {
            this.setState({ lastControl: Date.now() }, () =>
                this.props.onValueChange && this.props.onValueChange(value));
        }
    }

    onMouseMove = e => {
        if (mouseDown) {
            e.preventDefault();
            e.stopPropagation();
            this.eventToValue(e);
        }
    };

    onMouseDown = e => {
        e.preventDefault();
        e.stopPropagation();

        mouseDown = true;

        if (!this.height) {
            if (this.refSlider.current) {
                this.height = this.refSlider.current.offsetHeight;
                this.top = this.refSlider.current.offsetTop;
            } else {
                return;
            }
        }

        this.eventToValue(e);

        document.getElementById('dimmerId').addEventListener('mousemove', this.onMouseMove, { passive: false, capture: true });
        document.getElementById('dimmerId').addEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
        document.addEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
        document.getElementById('dimmerId').addEventListener('touchmove', this.onMouseMove, { passive: false, capture: true });
        document.getElementById('dimmerId').addEventListener('touchend', this.onMouseUp, { passive: false, capture: true });
    };

    onMouseUp = e => {
        e.preventDefault();
        e.stopPropagation();
        mouseDown = false;
        console.log('Stopped');
        document.getElementById('dimmerId')?.removeEventListener('mousemove', this.onMouseMove, { passive: false, capture: true });
        document.getElementById('dimmerId')?.removeEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
        document.removeEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
        document.getElementById('dimmerId')?.removeEventListener('touchmove', this.onMouseMove, { passive: false, capture: true });
        document.getElementById('dimmerId')?.removeEventListener('touchend', this.onMouseUp, { passive: false, capture: true });

        this.setState({ lastControl: Date.now() }, () => {
            console.log(this.state.value);
            this.props?.onValueChange && this.props.onValueChange(this.state.value);
        });
    };

    componentWillUnmount() {
        // document.getElementById('root').className = ``;
        document.getElementById('dimmerId')?.removeEventListener('mousemove', this.onMouseMove, { passive: false, capture: true });
        document.getElementById('dimmerId')?.removeEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
        document.removeEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
        document.getElementById('dimmerId')?.removeEventListener('touchmove', this.onMouseMove, { passive: false, capture: true });
        document.getElementById('dimmerId')?.removeEventListener('touchend', this.onMouseUp, { passive: false, capture: true });
    }

    getTopButtonName() {
        switch (this.props.type) {
            case DialogBlinds.types.blinds:
                return <IconUp style={{ width: 20, height: 20 }} />;

            case DialogBlinds.types.dimmer:
                return <IconLamp style={{ color: LAMP_ON_COLOR, width: 20, height: 20 }} />;

            default:
                return I18n.t('ON');
        }
    }

    getBottomButtonName() {
        switch (this.props.type) {
            case DialogBlinds.types.blinds:
                return <IconDown style={{ width: 20, height: 20 }} />;

            case DialogBlinds.types.dimmer:
                return <IconLamp style={{ width: 20, height: 20 }} />;

            default:
                return I18n.t('OFF');
        }
    }

    onButtonDown(e, buttonName) {
        e && e.stopPropagation();
        if (Date.now() - this.button.time < 50) {
            return;
        }
        if (this.button.timer) {
            clearTimeout(this.button.timer);
        }
        this.button.name = buttonName;
        this.button.time = Date.now();
        this.button.timer = setTimeout(() => {
            this.button.timer = null;
            let value;
            switch (this.button.name) {
                case 'top':
                    value = 100;
                    break;

                case 'bottom':
                    value = 0;
                    break;
                default:
                    break;
            }
            this.setState({ value }, () =>
                this.props.onValueChange && this.props.onValueChange(value));
        }, 400);
    }

    /*
    onButtonUp = e => {
        e && e.stopPropagation();
        if (Date.now() - this.button.timeUp < 100) {
            if (this.button.timer) {
                clearTimeout(this.button.timer);
                this.button.timer = null;
            }
        } else {
            console.log(`on Button UP: ${Date.now() - this.button.timeUp}`);
            this.button.timeUp = Date.now();

            if (this.button.timer) {
                clearTimeout(this.button.timer);
                this.button.timer = null;
                let value = this.state.value;
                switch (this.button.name) {
                    case 'top':
                        if (value % this.step === 0) {
                            value += this.step;
                        } else {
                            value += this.step - (value % this.step);
                        }
                        break;

                    case 'bottom':
                        if (value % this.step === 0) {
                            value -= this.step;
                        } else {
                            value -= value % this.step;
                        }
                        break;
                    default:
                        break;
                }
                if (value > 100) {
                    value = 100;
                } else if (value < 0) {
                    value = 0;
                }
                this.setState({ value });
                this.props.onValueChange && this.props.onValueChange(this.localValue2externalValue(value));
            }
        }
    };
    */
    getSliderColor() {
        if (this.props.type === DialogBlinds.types.blinds) {
            return undefined;
        }

        if (this.props.type === DialogBlinds.types.dimmer) {
            const val = this.state.value;
            return darken(LAMP_ON_COLOR, 1 - (val / 70 + 0.3));
        }

        return '#888';
    }

    getValueText() {
        let unit = '%';
        if (this.props.type !== DialogBlinds.types.blinds && this.props.type !== DialogBlinds.types.dimmer) {
            unit = (this.props.unit || '');
        }

        return this.state.value + unit;
    }

    getToggleButton() {
        if (!this.props.onToggle) {
            return null;
        }
        return <Fab
            key={`${this.props.dialogKey}-toggle-button`}
            active={this.props.startToggleValue}
            onClick={this.props.onToggle}
            className={Utils.clsx('dimmer-button', this.props.classes.buttonToggleStyle)}
        >
            <IconLamp />
        </Fab>;
    }

    getStopButton() {
        if (!this.props.onStop) {
            return null;
        }

        return <Fab
            className={this.props.classes.buttonStopStyle}
            size="small"
            onClick={this.props.onStop}
            color="secondary"
        >
            <IconStop />
        </Fab>;
    }

    generateContent() {
        const sliderStyle = {
            position: 'absolute',
            width: '100%',
            left: 0,
            height: `${this.props.type === DialogBlinds.types.blinds ? 100 - this.state.value : this.state.value}%`,
            background: this.props.background || this.getSliderColor(),
            transitionProperty: 'height',
            transitionDuration: '0.3s',
        };

        const handlerStyle = {
            position: 'absolute',
            width: '2em',
            height: '0.3em',
            left: 'calc(50% - 1em)',
            background: 'white',
            borderRadius: '0.4em',
        };

        if (this.props.type === DialogBlinds.types.blinds) {
            sliderStyle.top = 0;
            handlerStyle.bottom = '0.4em';
            sliderStyle.backgroundImage = 'linear-gradient(0deg, #949494 4.55%, #c9c9c9 4.55%, #c9c9c9 50%, #949494 50%, #949494 54.55%, #c9c9c9 54.55%, #c9c9c9 100%)';
            sliderStyle.backgroundSize = '100% 2.5em';
            sliderStyle.backgroundPosition = 'center bottom';
        } else {
            sliderStyle.bottom = 0;
            handlerStyle.top = '0.4em';
        }

        return <div className={this.props.classes.wrapperSlider}>
            <div className={this.props.classes.wrapperSliderBlock}>
                <Button variant="outlined" onClick={e => this.onButtonDown(e, 'top')}>
                    {this.getTopButtonName()}
                </Button>
                <div
                    id="dimmerId"
                    ref={this.refSlider}
                    onMouseDown={this.onMouseDown}
                    onTouchStart={this.onMouseDown}
                    onClick={e => e.stopPropagation()}
                    className={this.props.classes.sliderStyle}
                >
                    <div style={sliderStyle}>
                        <div style={handlerStyle} />
                    </div>
                </div>
                <Button variant="outlined" onClick={e => this.onButtonDown(e, 'bottom')}>
                    {this.getBottomButtonName()}
                </Button>
            </div>
            {this.getToggleButton()}
        </div>;
    }

    render() {
        return <Dialog
            open={!0}
            onClose={() => this.props.onClose()}
        >
            <DialogTitle className={this.props.classes.dialogTitle}>
                {this.getStopButton()}
                <div className={this.props.classes.sliderText}>
                    {this.getValueText()}
                </div>
                <IconButton onClick={() => this.props.onClose()} style={{ float: 'right' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {this.generateContent()}
            </DialogContent>
        </Dialog>;
    }
}

DialogBlinds.propTypes = {
    dialogKey: PropTypes.string,

    onClose: PropTypes.func,

    onStop: PropTypes.func,
    onToggle: PropTypes.func,

    onValueChange: PropTypes.func,
    startValue: PropTypes.number,
    startToggleValue: PropTypes.bool,
    type: PropTypes.number,
};

export default withStyles(styles)(DialogBlinds);
