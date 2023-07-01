import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import Generic from './Generic';

const styles = () => ({
    overlay: {
        zIndex: 999,
        top: 0,
        bottom: 0,
        position: 'absolute',
        left: 0,
        right: 0,
    },
});

class ViewInWidget extends Generic {
    constructor(props) {
        super(props);
        this.state.width = 0;
        this.refContainer = React.createRef();
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2ViewInWidget',
            visSet: 'vis-2-widgets-material',
            visWidgetLabel: 'view_in_widget',  // Label of widget
            visName: 'View in Widget',
            visAttrs: [{
                name: 'common',
                fields: [
                    {
                        name: 'noCard',
                        label: 'without_card',
                        type: 'checkbox',
                    },
                    {
                        name: 'widgetTitle',
                        label: 'name',
                        hidden: '!!data.noCard',
                    },
                    {
                        name: 'view',
                        label: 'view',
                        type: 'select-views',
                        multiple: false,
                    },
                    {
                        name: 'button',
                        label: 'view_button',
                        type: 'checkbox',
                    },
                ],
            }],
            visDefaultStyle: {
                width: '100%',
                height: 120,
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_view.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return ViewInWidget.getWidgetInfo();
    }

    async componentDidMount() {
        super.componentDidMount();
        this.recalculateWidth();
    }

    recalculateWidth() {
        if (this.refContainer.current && this.refContainer.current.clientWidth !== this.state.width) {
            this.setState({
                width: this.refContainer.current.clientWidth,
            });
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    componentDidUpdate() {
        super.componentDidUpdate && super.componentDidUpdate();
        this.recalculateWidth();
    }

    onNavigate() {
        window.vis.changeView(this.state.rxData.view, this.state.rxData.view);
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);
        const view = this.state.rxData.view;

        if (view === this.props.view) {
            return <div className="vis-widget-body" style={{ overflow: 'hidden', position: 'absolute' }}>
                Cannot use recursive views
            </div>;
        }

        let style;

        if (this.state.width && this.state.rxData.button && this.props.refParent.current && this.refContainer.current) {
            const myWidth = this.refContainer.current.offsetWidth;
            const myHeight = this.refContainer.current.offsetHeight;
            let parentView = this.props.refParent.current;
            let count = 0;
            while (parentView.className.includes('vis-view') && count < 5) {
                parentView = parentView.parentNode;
                count += 1;
            }
            if (parentView) {
                const parentWidth = parentView.offsetWidth;
                const factor = myWidth / parentWidth;

                style = {
                    transform: `scale(${factor})`,
                    transformOrigin: 'top left',
                    width: `${(1 / factor) * 100}%`,
                    height: `${(1 / factor) * 100 * (myHeight / myWidth)}%`,
                    cursor: 'pointer',
                };
            }
        }

        const noCard = this.state.rxData.noCard || props.widget.usedInWidget;

        const content = <div
            style={{
                overflow: 'hidden',
                position: 'absolute',
                top: !noCard && this.state.rxData.widgetTitle ? 53 : (noCard ? 0 : 16),
                left: 8,
                width: 'calc(100% - 16px)',
                height: !noCard && this.state.rxData.widgetTitle ? 'calc(100% - 100px)' : (noCard ? '100%' : 'calc(100% - 64px)'),
                textAlign: 'center',
                lineHeight: this.state.height ? `${this.state.height}px` : undefined,
                fontFamily: this.state.rxStyle['font-family'],
                fontShadow: this.state.rxStyle['font-shadow'],
                fontStyle: this.state.rxStyle['font-style'],
                fontWeight: this.state.rxStyle['font-weight'],
                fontVariant: this.state.rxStyle['font-variant'],
            }}
            ref={this.refContainer}
        >
            { this.state.editMode || this.state.rxData.button ? <div
                className={this.props.classes.overlay}
                style={!this.state.editMode ? { cursor: 'pointer' } : undefined}
                onClick={!this.state.editMode && this.state.rxData.button ? () => this.onNavigate() : undefined}
            /> : null}
            {view ? this.getWidgetView(view, { style }) : null}
        </div>;

        if (this.state.rxData.noCard || props.widget.usedInWidget) {
            return content;
        }

        return this.wrapContent(content, null);
    }
}

ViewInWidget.propTypes = {
    context: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default withStyles(styles)(ViewInWidget);
