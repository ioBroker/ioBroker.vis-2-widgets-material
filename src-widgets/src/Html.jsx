import React from 'react';
import PropTypes from 'prop-types';

import Generic from './Generic';

class Html extends Generic {
    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Static',
            visSet: 'vis-2-widgets-material',
            visName: 'Html template',
            visWidgetLabel: 'html',  // Label of widget
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            label: 'name',
                            noButton: true,
                            name: 'widgetTitle',
                        },
                        {
                            name: 'html',
                            type: 'html',
                            default: 'Admin Memory: <span style="color: #73b9ff">{system.adapter.admin.0.memHeapTotal.val}MB</span>',
                            label: 'html_template',
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 120,
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_html.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Html.getWidgetInfo();
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);
        const style = {
            width: '100%',
            height: '100%',
        };
        Object.keys(this.state.rxStyle).forEach(key => {
            if (key !== 'position' && key !== 'top' && key !== 'left' && key !== 'width' && key !== 'height') {
                if (this.state.rxStyle[key] !== undefined && this.state.rxStyle[key] !== null) {
                    if (key.includes('-')) {
                        const val = this.state.rxStyle[key];
                        key = key.replace(/-./g, x => x[1].toUpperCase());
                        style[key] = val;
                    } else {
                        style[key] = this.state.rxStyle[key];
                    }
                }
            }
        });

        return this.wrapContent(<div
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: this.state.rxData.html }}
            style={style}
        />);
    }
}

Html.propTypes = {
    systemConfig: PropTypes.object,
    socket: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default Html;
