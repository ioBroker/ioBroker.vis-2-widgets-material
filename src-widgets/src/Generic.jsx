import React from 'react';
import PropTypes from 'prop-types';

import {
    Card, CardContent,
} from '@mui/material';

import { VisRxWidget } from '@iobroker/vis-2-widgets-react-dev';

class Generic extends (window.visRxWidget || VisRxWidget) {
    // eslint-disable-next-line class-methods-use-this
    formatValue(value, round) {
        if (typeof value === 'number') {
            if (round === 0) {
                value = Math.round(value);
            } else {
                value = Math.round(value * 100) / 100;
            }
            if (this.props.systemConfig?.common) {
                if (this.props.systemConfig.common.isFloatComma) {
                    value = value.toString().replace('.', ',');
                }
            }
        }

        return value === undefined || value === null ? '' : value.toString();
    }

    // eslint-disable-next-line class-methods-use-this
    wrapContent(content, addToHeader, cardContentStyle, headerStyle, onCardClick) {
        return <Card style={{ width: 'calc(100% - 8px)', height: 'calc(100% - 8px)', margin: 4 }} onClick={onCardClick}>
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
}

Generic.propTypes = {
    systemConfig: PropTypes.object,
    socket: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default Generic;
