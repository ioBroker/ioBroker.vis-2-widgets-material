import React from 'react';
import {
    Card, CardContent,
} from '@mui/material';

import VisRxWidget from './visRxWidget';
import WeatherComponent from './react-weather/Weather';

class Weather extends (window.visRxWidget || VisRxWidget) {
    static getWidgetInfo() {
        return {
            id: 'tplMaterialWeather',
            visSet: 'material-widgets',
            visName: 'Weather',
            visAttrs_: 'name;oid-mode;oid-temp;oid-temp-state;oid-power',
            visAttrs: [{
                name: 'common',
                fields: [
                    {
                        name: 'name',
                    },
                    {
                        name: 'oid-mode',
                        type: 'id',
                    },
                    {
                        name: 'oid-temp',
                        type: 'id',
                    },
                    {
                        name: 'oid-temp-state',
                        type: 'id',
                    },
                    {
                        name: 'oid-power',
                        type: 'id',
                    },
                ],
            },
            ],
            visPrev: 'widgets/material-widgets/img/prev_switch.png',
        };
    }

    getSubscribeState = (id, cb) => {
        this.props.socket.getState(id).then(result => cb(result));
        this.props.socket.subscribeState(id, (resultId, result) => cb(result));
    };

    async componentDidMount() {
        super.componentDidMount();
        if (this.state.data['oid-mode']) {
            const modeVal = await this.props.socket.getState(this.state.data['oid-mode']);
            this.setState({ mode: modeVal.val });
            const mode = await this.props.socket.getObject(this.state.data['oid-mode']);
            this.setState({ modes: mode.common.states });
        }
        if (this.state.data['oid-power']) {
            const powerVal = await this.props.socket.getState(this.state.data['oid-power']);
            this.setState({ power: powerVal.val });
        }
        if (this.state.data['oid-temp']) {
            const temp = await this.props.socket.getState(this.state.data['oid-temp']);
            this.setState({ temp: temp.val });
            const tempObject = await this.props.socket.getObject(this.state.data['oid-temp']);
            this.setState({ min: tempObject.common.min, max: tempObject.common.max, tempObject });
        }
        if (this.state.data['oid-temp-state']) {
            const tempStateObject = await this.props.socket.getObject(this.state.data['oid-temp-state']);
            this.setState({ tempStateObject });
            this.getSubscribeState(
                this.state.data['oid-temp-state'],
                tempState => this.setState({ tempState: tempState.val }),
            );
        }
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Weather.getWidgetInfo();
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        return <div style={{ textAlign: 'center' }}>
            <Card
                style={{ width: this.state.style?.width, height: this.state.style?.height }}
            >
                <CardContent>
                    <WeatherComponent
                        socket={this.props.socket}
                        data={{
                            current: {
                                temperature: 'openweathermap.0.forecast.current.temperature',
                                humidity: 'openweathermap.0.forecast.current.humidity',
                                state: 'openweathermap.0.forecast.current.state',
                                icon: 'openweathermap.0.forecast.current.icon',
                            },
                            days: [0, 1, 2, 3, 4, 5].map(day => ({
                                temperatureMin: `openweathermap.0.forecast.day${day}.temperatureMin`,
                                temperatureMax: `openweathermap.0.forecast.day${day}.temperatureMax`,
                                state: `openweathermap.0.forecast.day${day}.state`,
                                icon: `openweathermap.0.forecast.day${day}.icon`,
                            })),
                        }}
                    />
                </CardContent>
            </Card>
        </div>;
    }
}

export default Weather;
