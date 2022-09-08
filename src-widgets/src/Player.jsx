import React from 'react';
import ColorThief from 'colorthief';
import { withStyles } from '@mui/styles';

import {
    PauseRounded, PlayArrowRounded, SkipNextRounded, SkipPreviousRounded,
    RepeatRounded,
    RepeatOneRounded,
    ShuffleRounded,
    VolumeUpRounded, VolumeDownRounded, VolumeUp, VolumeMute,
} from '@mui/icons-material';

import { IconButton, Slider } from '@mui/material';
import Generic from './Generic';

const styles = theme => ({

});

class Player extends Generic {
    constructor(props) {
        super(props);

        this.coverRef = React.createRef();
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Player',
            visSet: 'vis-2-widgets-material',
            visName: 'Player',
            visWidgetLabel: 'vis_2_widgets_material_player',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'name',
                            label: 'vis_2_widgets_material_name',
                        },
                        {
                            name: 'title',
                            type: 'id',
                            label: 'vis_2_widgets_material_title',
                        },
                        {
                            name: 'artist',
                            type: 'id',
                            label: 'vis_2_widgets_material_artist',
                        },
                        {
                            name: 'cover',
                            type: 'id',
                            label: 'vis_2_widgets_material_cover',
                        },
                        {
                            name: 'state',
                            type: 'id',
                            label: 'vis_2_widgets_material_state',
                        },
                        {
                            name: 'duration',
                            type: 'id',
                            label: 'vis_2_widgets_material_duration',
                        },
                        {
                            name: 'elapsed',
                            type: 'id',
                            label: 'vis_2_widgets_material_elapsed',
                        },
                        {
                            name: 'prev',
                            type: 'id',
                            label: 'vis_2_widgets_material_prev',
                        },
                        {
                            name: 'next',
                            type: 'id',
                            label: 'vis_2_widgets_material_next',
                        },
                        {
                            name: 'volume',
                            type: 'id',
                            label: 'vis_2_widgets_material_volume',
                        },
                        {
                            name: 'muted',
                            type: 'id',
                            label: 'vis_2_widgets_material_muted',
                        },
                        {
                            name: 'repeat',
                            type: 'id',
                            label: 'vis_2_widgets_material_repeat',
                        },
                        {
                            name: 'shuffle',
                            type: 'id',
                            label: 'vis_2_widgets_material_shuffle',
                        },
                    ],
                }],
            visDefaultStyle: {
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_player.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Player.getWidgetInfo();
    }

    async propertiesUpdate() {
        try {
            const volumeObject = this.props.socket.getObject(this.state.rxData.volume);
            if (volumeObject) {
                this.setState({ volumeObject });
            }
        } catch (e) {

        }
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.propertiesUpdate();
    }

    async onRxDataChanged(prevRxData) {
        if (prevRxData.volume !== this.state.rxData.volume) {
            await this.propertiesUpdate();
        }
    }

    getTimeString = seconds => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        let repeatIcon = null;
        if (parseInt(this.getPropertyValue('repeat')) === 1) {
            repeatIcon = <RepeatOneRounded />;
        } else if (parseInt(this.getPropertyValue('repeat')) === 2) {
            repeatIcon = <RepeatRounded />;
        } else {
            repeatIcon = <RepeatRounded />;
        }

        let color;
        if (this.state.coverColor) {
            color = (this.state.coverColor[0] + this.state.coverColor[1] + this.state.coverColor[2]) / 3 < 128 ? 'white' : 'black';
        }

        const content = <>
            <style>
                {color ? `
                .playerContent button:not(.MuiIconButton-colorPrimary) .MuiSvgIcon-root {
                    color: ${color};
                }
            ` : null}
            </style>
            <div
                className="playerContent"
                style={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: 10,
                    backgroundColor: this.state.coverColor ? `rgb(${this.state.coverColor.join(', ')}` : null,
                    color,
                }}
            >
                <div style={{
                    display: 'flex', flex: 1, width: '100%', justifyContent: 'space-between',
                }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>{this.getPropertyValue('title')}</div>
                        <div>{this.getPropertyValue('artist')}</div>
                        <div style={{ display: 'flex' }}>
                            <IconButton
                                color={this.getPropertyValue('repeat') ? 'primary' : undefined}
                                onClick={() => {
                                    let newValue = null;
                                    if (parseInt(this.getPropertyValue('repeat')) === 1) {
                                        newValue = 2;
                                    } else if (parseInt(this.getPropertyValue('repeat')) === 2) {
                                        newValue = 0;
                                    } else {
                                        newValue = 1;
                                    }
                                    this.props.socket.setState(this.state.rxData.repeat, newValue);
                                }}
                            >
                                {repeatIcon}
                            </IconButton>
                            <IconButton
                                color={this.getPropertyValue('shuffle') ? 'primary' : undefined}
                                onClick={() => {
                                    this.props.socket.setState(this.state.rxData.shuffle, !this.getPropertyValue('shuffle'));
                                }}
                            >
                                <ShuffleRounded />
                            </IconButton>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <IconButton onClick={() => {
                                this.props.socket.setState(this.state.rxData.prev, true);
                            }}
                            >
                                <SkipPreviousRounded fontSize="large" />
                            </IconButton>
                            <IconButton onClick={() => {
                                this.props.socket.setState(this.state.rxData.state, this.getPropertyValue('state') === 'play' ? 'pause' : 'play');
                            }}
                            >
                                {this.getPropertyValue('state') === 'play' ?
                                    <PlayArrowRounded fontSize="large" /> :
                                    <PauseRounded fontSize="large" />}
                            </IconButton>
                            <IconButton onClick={() => {
                                this.props.socket.setState(this.state.rxData.next, true);
                            }}
                            >
                                <SkipNextRounded fontSize="large" />
                            </IconButton>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <img
                            src={this.getPropertyValue('cover')}
                            alt="cover"
                            crossOrigin="anonymous"
                            ref={this.coverRef}
                            style={{ maxWidth: 100, maxHeight: 100 }}
                            onLoad={() => {
                                const img = this.coverRef.current;
                                const colorThief = new ColorThief();
                                this.setState({ coverColor: colorThief.getColor(img) });
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backgroundImage:
                    this.state.coverColor ?
                        `linear-gradient(to right, rgb(${this.state.coverColor.join(', ')}), rgba(${this.state.coverColor.join(', ')}, 0))`
                        : null,
                        }}
                        ></div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {this.getTimeString(this.getPropertyValue('elapsed'))}
                    <Slider
                        min={0}
                        max={this.getPropertyValue('duration') || 0}
                        value={this.getPropertyValue('elapsed') || 0}
                        valueLabelDisplay="auto"
                        valueLabelFormat={this.getTimeString}
                        onChange={e => {
                            this.props.socket.setState(this.state.rxData.elapsed, e.target.value);
                        }}
                    />
                    {this.getTimeString(this.getPropertyValue('duration'))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <IconButton onClick={() => {
                        this.props.socket.setState(this.state.rxData.muted, !this.getPropertyValue('muted'));
                    }}
                    >
                        {this.getPropertyValue('muted') ?
                            <VolumeMute /> :
                            <VolumeUp />}
                    </IconButton>
                    <Slider
                        min={this.state.volumeObject?.common?.min || 0}
                        max={this.state.volumeObject?.common?.max || 100}
                        value={this.getPropertyValue('volume') || 0}
                        valueLabelDisplay="auto"
                        onChange={e => {
                            this.props.socket.setState(this.state.rxData.volume, e.target.value);
                        }}
                    />
                </div>
            </div>
        </>;

        return this.wrapContent(content, null, {
            boxSizing: 'border-box',
            paddingBottom: 10,
        });
    }
}

export default withStyles(styles)(Player);
