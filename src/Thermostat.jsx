/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2022 bluefox https://github.com/GermanBluefox,
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */

import React from 'react';
import PropTypes from 'prop-types';

import VisRxWidget from './visRxWidget';
import { Button } from '@mui/material';

class Thermostat extends VisRxWidget {

    static getWidgetInfo() {
        return {
            id: 'tplMaterialDemo',
            visSet: 'material-widgets',
            visName: 'Demo',
            visAttrs: 'button_name',
            visPrev: 'widgets/material-widgets/img/prev_switch.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Thermostat.getWidgetInfo();
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        // if (!this.state.ready) {
        //     return null;
        // }

        return <div>
            <Button 
                variant="contained" 
                style={{width: this.state.style?.width, height: this.state.style?.height}}
                onClick={async () =>{
                    console.log((await this.props.socket.getState('javascript.0.humidityActual')));
                }}
            >
                {this.state.data?.button_name}
            </Button>
        </div>;
        /*return <SmartTile
            editMode={false}
            socket={this.props.socket}
            systemConfig={this.state.systemConfig}
            themeType="dark"
            doNavigate={() =>
                console.log('Navigate')}
        />;*/
    }
}

export default Thermostat;
