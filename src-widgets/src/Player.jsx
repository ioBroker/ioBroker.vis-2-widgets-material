import React from 'react';
import Color from 'color';
import ColorThief from 'colorthief';
import { withStyles } from '@mui/styles';

import {
    PauseRounded, PlayArrowRounded, SkipNextRounded, SkipPreviousRounded,
    RepeatRounded, RepeatOneRounded, ShuffleRounded, VolumeUp, VolumeMute,
} from '@mui/icons-material';

import {
    Card, CardContent, IconButton, Slider,
} from '@mui/material';
import Generic from './Generic';

const styles = theme => ({
    content: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
    },
    volume: { display: 'flex', alignItems: 'center', gap: 10 },
    seek: { display: 'flex', alignItems: 'center', gap: 10 },
    buttons: { display: 'flex' },
    mode: { display: 'flex' },
    title:  { fontSize: '140%' },
    zIndex: { zIndex: 1 },
    player: { display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    seekSlider: {
        color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
        height: 4,
        '& .MuiSlider-thumb': {
            width: 8,
            height: 8,
            transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
            '&:before': {
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
            },
            '&.Mui-active': {
                width: 20,
                height: 20,
            },
        },
        '& .MuiSlider-rail': {
            opacity: 0.28,
        },
    },
    volumeSlider: {
        color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
        '& .MuiSlider-track': {
            border: 'none',
        },
        '& .MuiSlider-thumb': {
            width: 24,
            height: 24,
            backgroundColor: '#fff',
            '&:before': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
            },
            '&:hover, &.Mui-focusVisible, &.Mui-active': {
                boxShadow: 'none',
            },
        },
    },
});

const mediaTypes = ['title', 'artist', 'cover', 'state', 'duration', 'elapsed', 'prev', 'next', 'volume', 'mute', 'repeat', 'shuffle'];

const loadStates = async (field, data, changeData, socket) => {
    const object = await socket.getObject(data[field.name]);
    if (object && object.common) {
        const id = data[field.name].split('.');
        id.pop();
        const states = await socket.getObjectView(`${id.join('.')}.`, `${id.join('.') + id.join('.')}.\u9999`, 'state');
        if (states) {
            const currentMediaTypes = [...mediaTypes];
            Object.values(states).forEach(state => {
                const role = state?.common?.role?.match(/^(media\.mode|media|button|level)\.(.*)$/)?.[2];
                if (role && currentMediaTypes.includes(role) && (!data[role] || data[role] === 'nothing_selected') && field !== role) {
                    currentMediaTypes.splice(currentMediaTypes.indexOf(role), 1);
                    data[role] = state._id;
                }
            });
            changeData(data);
        }
    }
};

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
                            onChange: loadStates,
                            type: 'id',
                            label: 'vis_2_widgets_material_title',
                        },
                        {
                            name: 'artist',
                            onChange: loadStates,
                            type: 'id',
                            label: 'vis_2_widgets_material_artist',
                        },
                        {
                            name: 'cover',
                            onChange: loadStates,
                            type: 'id',
                            label: 'vis_2_widgets_material_cover',
                        },
                        {
                            name: 'color',
                            type: 'color',
                            label: 'vis_2_widgets_material_color',
                        },
                        {
                            name: 'state',
                            onChange: loadStates,
                            type: 'id',
                            label: 'vis_2_widgets_material_state',
                        },
                        {
                            name: 'duration',
                            onChange: loadStates,
                            type: 'id',
                            label: 'vis_2_widgets_material_duration',
                        },
                        {
                            name: 'elapsed',
                            onChange: loadStates,
                            type: 'id',
                            label: 'vis_2_widgets_material_elapsed',
                        },
                        {
                            name: 'prev',
                            onChange: loadStates,
                            type: 'id',
                            label: 'vis_2_widgets_material_prev',
                        },
                        {
                            name: 'next',
                            onChange: loadStates,
                            type: 'id',
                            label: 'vis_2_widgets_material_next',
                        },
                        {
                            name: 'volume',
                            onChange: loadStates,
                            type: 'id',
                            label: 'vis_2_widgets_material_volume',
                        },
                        {
                            name: 'mute',
                            onChange: loadStates,
                            type: 'id',
                            label: 'vis_2_widgets_material_mute',
                        },
                        {
                            name: 'repeat',
                            onChange: loadStates,
                            type: 'id',
                            label: 'vis_2_widgets_material_repeat',
                        },
                        {
                            name: 'shuffle',
                            onChange: loadStates,
                            type: 'id',
                            label: 'vis_2_widgets_material_shuffle',
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 240,
                position: 'relative',
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
            // ignore
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

    static getTimeString = seconds =>
        `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;

    getColor() {
        return (this.state.rxData.color ? Color(this.state.rxData.color).rgb().color : null) || this.state.coverColor;
    }

    wrapContent(content, addToHeader, cardContentStyle, headerStyle, onCardClick) {
        const coverColor = this.getColor();
        let color;
        if (coverColor) {
            color = (coverColor[0] + coverColor[1] + coverColor[2]) / 3 < 128 ? 'white' : 'black';
        }

        return <Card
            style={{
                width: 'calc(100% - 8px)',
                height: 'calc(100% - 8px)',
                margin: 4,
                position: 'relative',
                backgroundImage: 'none',
                backgroundColor: coverColor ? `rgb(${coverColor.join(', ')}` : null,
                color,
            }}
            onClick={onCardClick}
            className="playerContent"
        >
            <style>
                {color ? `
                .playerContent button:not(.MuiIconButton-colorPrimary) .MuiSvgIcon-root {
                    color: ${color};
                }
            ` : null}
            </style>

            <div style={{
                position: 'absolute', width: '100%', height: '100%',
            }}
            >
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img
                        src={this.getPropertyValue('cover')}
                        alt="cover"
                        crossOrigin="anonymous"
                        ref={this.coverRef}
                        style={{ maxWidth: 0, maxHeight: 0, position: 'absolute' }}
                        onLoad={() => {
                            const img = this.coverRef.current;
                            const colorThief = new ColorThief();
                            this.setState({ coverColor: colorThief.getColor(img) });
                        }}
                    />
                    <div style={{
                        width: '50%',
                        height: '100%',
                        backgroundImage: `url(${this.getPropertyValue('cover')})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        position: 'absolute',
                        right: 0,
                    }}
                    />
                    <div style={{
                        position: 'absolute',
                        width: '50%',
                        height: '100%',
                        right: 0,
                        backgroundImage:
                    coverColor ?
                        `linear-gradient(to right, rgb(${coverColor.join(', ')}), rgba(${coverColor.join(', ')}, 0))`
                        : null,
                    }}
                    ></div>
                </div>
            </div>
            <CardContent
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    position: 'relative',
                    ...cardContentStyle,
                }}
            >
                {this.state.rxData.name ? <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    alignItems: 'center',
                }}
                >
                    <div
                        style={{
                            fontSize: 24,
                            paddingTop: 0,
                            paddingBottom: 4,
                            ...headerStyle,
                        }}
                    >
                        {this.state.rxData.name}
                    </div>
                    {addToHeader || null}
                </div> : (addToHeader || null)}
                {content}
            </CardContent>
        </Card>;
    }

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

        const coverColor = this.getColor();
        let color;
        if (coverColor) {
            color = (coverColor[0] + coverColor[1] + coverColor[2]) / 3 < 128 ? 'white' : 'black';
        }

        const content = <div
            className={this.props.classes.content}
        >

            <div className={this.props.classes.zIndex}>
                <div className={this.props.classes.player}>
                    <div className={this.props.classes.title}>{this.getPropertyValue('title')}</div>
                    <div>{this.getPropertyValue('artist')}</div>
                    <div className={this.props.classes.mode}>
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
                    <div className={this.props.classes.buttons}>
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

            </div>
            <div className={this.props.classes.seek}>
                {Player.getTimeString(this.getPropertyValue('elapsed'))}
                <Slider
                    className={this.props.classes.seekSlider}
                    style={{ color }}
                    sx={theme => ({
                        '& .MuiSlider-thumb': {
                            '&:hover, &.Mui-focusVisible': {
                                boxShadow: `0px 0px 0px 8px ${
                                    theme.palette.mode === 'dark' || color === 'white'
                                        ? 'rgb(255 255 255 / 16%)'
                                        : 'rgb(0 0 0 / 16%)'
                                }`,
                            },
                        },
                    })}
                    size="small"
                    min={0}
                    max={this.getPropertyValue('duration') || 0}
                    value={this.getPropertyValue('elapsed') || 0}
                    valueLabelDisplay="auto"
                    valueLabelFormat={Player.getTimeString}
                    onChange={e => {
                        this.props.socket.setState(this.state.rxData.elapsed, e.target.value);
                    }}
                />
                {Player.getTimeString(this.getPropertyValue('duration'))}
            </div>
            <div className={this.props.classes.volume}>
                <IconButton onClick={() => {
                    this.props.socket.setState(this.state.rxData.mute, !this.getPropertyValue('mute'));
                }}
                >
                    {this.getPropertyValue('mute') ?
                        <VolumeMute /> :
                        <VolumeUp />}
                </IconButton>
                <Slider
                    className={this.props.classes.volumeSlider}
                    style={{ color }}
                    min={this.state.volumeObject?.common?.min || 0}
                    max={this.state.volumeObject?.common?.max || 100}
                    value={this.getPropertyValue('volume') || 0}
                    valueLabelDisplay="auto"
                    onChange={e => {
                        this.props.socket.setState(this.state.rxData.volume, e.target.value);
                    }}
                />
            </div>
        </div>;

        return this.wrapContent(content, null, {
            boxSizing: 'border-box',
            paddingBottom: 10,
        });
    }
}

export default withStyles(styles)(Player);
