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
            visWidgetLabel: 'vis_2_widgets_material_view_in_widget',  // Label of widget
            visName: 'View in Widget',
            visAttrs: [{
                name: 'common',
                fields: [
                    {
                        name: 'name',
                        label: 'vis_2_widgets_material_name',
                    },
                    {
                        name: 'view',
                        label: 'vis_2_widgets_material_view',
                        type: 'select-views',
                        multiple: false,
                    },
                    {
                        name: 'button',
                        label: 'vis_2_widgets_material_view_button',
                        type: 'checkbox',
                    },
                ],
            }],
            visDefaultStyle: {
                width: '100%',
                height: 120,
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_clock.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return ViewInWidget.getWidgetInfo();
    }

    onPropertiesUpdated() {
        super.onPropertiesUpdated();
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
        const VisView = this.props.VisView;
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

        const content = <div
            style={{
                overflow: 'hidden',
                position: 'absolute',
                top: this.state.rxData.name ? 53 : 16,
                left: 8,
                width: 'calc(100% - 16px)',
                height: this.state.rxData.name ? 'calc(100% - 100px)' : 'calc(100% - 64px)',
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
            {view ? <VisView
                key={`${this.props.id}_${view}`}
                view={view}
                activeView={view}
                views={this.props.views}
                can={this.props.can}
                canStates={this.props.canStates}
                user={this.props.user}
                userGroups={this.props.userGroups}
                allWidgets={this.props.allWidgets}
                jQuery={this.props.jQuery}
                visInWidget
                $$={this.props.$$}
                adapterName={this.props.adapterName}
                instance={this.props.instance}
                projectName={this.props.projectName}
                socket={this.props.socket}
                viewsActiveFilter={this.props.viewsActiveFilter}
                setValue={this.props.setValue}
                linkContext={this.props.linkContext}
                formatUtils={this.props.formatUtils}
                showWidgetNames={this.props.showWidgetNames}
                dateFormat={this.props.dateFormat}
                lang={this.props.lang}
                themeType={this.props.themeType}
                themeName={this.props.themeName}
                theme={this.props.theme}
                systemConfig={this.props.systemConfig}
                container={this.props.container}
                editMode={false}
                runtime={this.props.runtime}
                style={style}
            />
                : null}
        </div>;

        return this.wrapContent(content, null);
    }
}

ViewInWidget.propTypes = {
    systemConfig: PropTypes.object,
    socket: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
    VisView: PropTypes.func,
};

export default withStyles(styles)(ViewInWidget);
