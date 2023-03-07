import PropTypes from 'prop-types';

import {
    Card, CardContent,
} from '@mui/material';

import { VisRxWidget } from '@iobroker/vis-2-widgets-react-dev';

class Generic extends (window.visRxWidget || VisRxWidget) {
    getPropertyValue = stateName => this.state.values[`${this.state.rxData[stateName]}.val`];

    static getI18nPrefix() {
        return 'vis_2_widgets_material_';
    }

    // TODO: remove this method when vis-2-widgets-react-dev is updated
    static getText(text) {
        if (typeof text === 'object') {
            return text[(window.visRxWidget || VisRxWidget).getLanguage()] || text.en;
        }
        return text;
    }

    async getParentObject(id) {
        const parts = id.split('.');
        parts.pop();
        const parentOID = parts.join('.');
        return this.props.socket.getObject(parentOID);
    }

    wrapContent(content, addToHeader, cardContentStyle, headerStyle, onCardClick) {
        return super.wrapContent(content, addToHeader, cardContentStyle, headerStyle, onCardClick, { Card, CardContent });
    }
}

Generic.propTypes = {
    systemConfig: PropTypes.object,
    socket: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default Generic;
