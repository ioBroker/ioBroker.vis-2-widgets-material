import React from 'react';
import PropTypes from 'prop-types';

import Generic from './Generic';

class Html extends Generic {
    constructor(props) {
        super(props);

        this.state.q = Date.now();
        this.widgetRef = React.createRef();
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Static',
            visSet: 'vis-2-widgets-material',
            visName: 'Html template',
            visWidgetLabel: 'html', // Label of widget
            visAttrs: [
                {
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
                            name: 'html',
                            type: 'html',
                            default:
                                'Admin Memory: <span style="color: #73b9ff">{system.adapter.admin.0.memHeapTotal.val}MB</span>',
                            label: 'html_template',
                            hidden: data =>
                                !!data.iframe || !!data.image || !!data.image_oid || !!data.iframe_oid || !!data.widget,
                        },
                        {
                            name: 'iframe',
                            type: 'url',
                            label: 'iframe_url',
                            hidden: data =>
                                !!data.html || !!data.image || !!data.image_oid || !!data.iframe_oid || !!data.widget,
                        },
                        {
                            name: 'iframe_oid',
                            type: 'id',
                            label: 'iframe_oid',
                            hidden: data =>
                                !!data.html || !!data.image || !!data.image_oid || !!data.iframe || !!data.widget,
                        },
                        {
                            name: 'image',
                            type: 'url',
                            label: 'image_url',
                            hidden: data =>
                                !!data.iframe || !!data.html || !!data.image_oid || !!data.iframe_oid || !!data.widget,
                        },
                        {
                            name: 'image_oid',
                            type: 'id',
                            label: 'image_oid',
                            hidden: data =>
                                !!data.iframe || !!data.html || !!data.image || !!data.iframe_oid || !!data.widget,
                        },
                        {
                            name: 'objectFit',
                            type: 'select',
                            noTranslation: true,
                            options: [
                                { value: 'fill', label: 'fill' },
                                { value: 'contain', label: 'contain' },
                                { value: 'cover', label: 'cover' },
                                { value: 'none', label: 'none' },
                                { value: 'scale-down', label: 'scale-down' },
                            ],
                            default: 'fill',
                            label: 'object_fit',
                            hidden: data => !data.image && !data.image_oid,
                        },
                        {
                            name: 'refreshInterval',
                            type: 'slider',
                            min: 0,
                            max: 180000,
                            step: 100,
                            label: 'refresh_interval',
                            hidden: data => !!data.html || !!data.widget,
                        },
                        {
                            name: 'refreshOnWakeUp',
                            type: 'checkbox',
                            label: 'refresh_on_wake_up',
                            hidden: data => !!data.html || !!data.widget,
                        },
                        {
                            name: 'refreshOnViewChange',
                            type: 'checkbox',
                            label: 'refresh_on_view_change',
                            hidden: data => !!data.html || !!data.widget,
                        },
                        {
                            name: 'scrollX',
                            type: 'checkbox',
                            label: 'scroll_x',
                            hidden: data => !data.iframe && !data.iframe_oid,
                        },
                        {
                            name: 'scrollY',
                            type: 'checkbox',
                            label: 'scroll_y',
                            hidden: data => !data.iframe && !data.iframe_oid,
                        },
                        {
                            name: 'seamless',
                            type: 'checkbox',
                            label: 'seamless',
                            default: true,
                            hidden: data => !data.iframe && !data.iframe_oid,
                        },
                        {
                            name: 'noSandbox',
                            type: 'checkbox',
                            label: 'no_sandbox',
                            default: true,
                            hidden: data => !data.iframe && !data.iframe_oid,
                        },
                        {
                            name: 'allowUserInteractions',
                            type: 'checkbox',
                            label: 'allow_user_interactions',
                            default: true,
                            hidden: data => !data.image && !data.image_oid,
                        },
                        {
                            name: 'refreshWithNoQuery',
                            type: 'checkbox',
                            label: 'refresh_with_no_query',
                            default: true,
                            hidden: data => !data.image && !data.image_oid && !data.iframe && !data.iframe_oid,
                        },
                        {
                            name: 'widget',
                            type: 'widget',
                            label: 'widget_id',
                            hidden: data =>
                                !!data.image || !!data.image_oid || !!data.iframe || !!data.iframe_oid || !!data.html,
                        },
                        {
                            label: 'doNotWantIncludeWidgets',
                            name: 'doNotWantIncludeWidgets',
                            type: 'checkbox',
                            default: false,
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

    getWidgetInfo() {
        return Html.getWidgetInfo();
    }

    componentDidMount() {
        super.componentDidMount();
        this.reinitInterval();
        this.doNotWantIncludeWidgets = !!this.state.rxData.doNotWantIncludeWidgets;

        // inform view about, that this widget can include other widgets
        this.props.askView &&
            this.props.askView('update', {
                id: this.props.id,
                uuid: this.uuid,
                canHaveWidgets: true,
                doNotWantIncludeWidgets: !!this.state.rxData.doNotWantIncludeWidgets,
            });

        if (this.state.rxData.refreshOnWakeUp && !this.state.rxData.widget) {
            this.wakeUpInstalled = true;
            window.vis.onWakeUp(() => this.refresh(), this.props.id);
        }
        if (this.state.rxData.refreshOnViewChange && !this.state.rxData.widget) {
            this.viewChangeInstalled = true;
            window.vis.navChangeCallbacks.push({
                cb: view => view === this.props.view && this.refresh(),
                id: this.props.id,
            });
        }
    }

    // eslint-disable-next-line
    onCommand(command, options) {
        const result = super.onCommand(command, options);
        if (result === false) {
            if (command === 'include') {
                const project = JSON.parse(JSON.stringify(this.props.context.views));
                const widget = project[this.props.view].widgets[this.props.id];
                widget.data.widget = options;
                this.props.context.changeProject(project);
                return true;
            }
        }

        return result;
    }

    reinitInterval() {
        const refreshInterval = parseInt(this.state.rxData.refreshInterval, 10);
        if (refreshInterval !== this.lastRefreshInterval || this.state.rxData.widget !== this.lastWidget) {
            this.refreshInterval && clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            this.lastWidget = this.state.rxData.widget;

            this.lastRefreshInterval = refreshInterval;
            if (refreshInterval && !this.lastWidget) {
                this.refreshInterval = setInterval(() => this.refresh(), refreshInterval);
            }
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.refreshInterval && clearInterval(this.refreshInterval);
        this.refreshInterval = null;
        if (this.wakeUpInstalled) {
            this.wakeUpInstalled = false;
            // remove the wake-up handler
            window.vis.onWakeUp(this.props.id);
        }
        if (this.viewChangeInstalled) {
            this.viewChangeInstalled = false;
            // remove the view change handler
            window.vis.navChangeCallbacks = window.vis.navChangeCallbacks.filter(item => item.id !== this.props.id);
        }
    }

    refresh() {
        this.setState({ q: Date.now() });
    }

    getUrl() {
        let url = this.state.rxData.image || this.state.rxData.iframe;
        if (this.state.rxData.iframe_oid) {
            url = this.state.values[`${this.state.rxData.iframe_oid}.val`];
        }
        if (this.state.rxData.image_oid) {
            url = this.state.values[`${this.state.rxData.image_oid}.val`];
        }
        if (!this.state.rxData.refreshWithNoQuery) {
            if (url.includes('?')) {
                url += `&_=${this.state.q}`;
            } else {
                url += `?_=${this.state.q}`;
            }
        }
        return url;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);
        const noCard = this.state.rxData.noCard || props.widget.usedInWidget;

        if (
            typeof this.doNotWantIncludeWidgets === 'boolean' &&
            this.doNotWantIncludeWidgets !== !!this.state.rxData.doNotWantIncludeWidgets
        ) {
            this.doNotWantIncludeWidgets = !!this.state.rxData.doNotWantIncludeWidgets;
            setTimeout(
                () =>
                    this.props.askView &&
                    this.props.askView('update', {
                        id: this.props.id,
                        uuid: this.uuid,
                        doNotWantIncludeWidgets: !!this.state.rxData.doNotWantIncludeWidgets,
                    }),
                100,
            );
        }

        const style = {
            width: '100%',
            height: !noCard && this.state.rxData.widgetTitle ? 'calc(100% - 36px)' : '100%',
            border: '0',
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

        let content;

        if (this.state.rxData.html) {
            content = (
                <div
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: this.state.rxData.html }}
                    style={style}
                />
            );
        }

        if (this.state.rxData.iframe_oid || this.state.rxData.iframe) {
            const key = this.state.rxData.refreshWithNoQuery ? this.state.q : 'element';
            this.reinitInterval();

            style.overflowX = this.state.rxData.scrollX ? 'scroll' : 'hidden';
            style.overflowY = this.state.rxData.scrollY ? 'scroll' : 'hidden';
            content = (
                <iframe
                    key={key}
                    title={this.props.id}
                    seamless={this.state.rxData.seamless}
                    src={this.getUrl()}
                    style={style}
                    sandbox={
                        this.state.rxData.noSandbox
                            ? undefined
                            : 'allow-scripts allow-same-origin allow-modals allow-forms allow-pointer-lock allow-popups'
                    }
                ></iframe>
            );
        }

        if (this.state.rxData.image || this.state.rxData.image_oid) {
            const key = this.state.rxData.refreshWithNoQuery ? this.state.q : 'element';
            this.reinitInterval();

            if (this.state.rxData.allowUserInteractions) {
                style.touchCallout = 'none';
                style.touchSelect = 'none';
                style.touchAction = 'none';
                style.userSelect = 'none';
                style.pointerEvents = 'none';
            }

            style.objectFit = this.state.rxData.objectFit;

            content = (
                <img
                    key={key}
                    src={this.getUrl()}
                    style={style}
                    alt={this.props.id}
                />
            );
        }

        if (this.state.rxData.widget) {
            this.reinitInterval(); // disable interval

            const wid = this.state.rxData.widget;
            const widget = this.props.context.views[this.props.view]?.widgets?.[wid];
            if (widget && this.getWidgetInWidget && wid !== this.props.id) {
                // todo: remove this condition after vis release
                // come again when the ref is filled
                if (!this.widgetRef.current) {
                    setTimeout(() => this.forceUpdate(), 50);
                }
                style.justifyContent = 'center';
                style.display = 'flex';
                style.alignItems = 'center';
                content = (
                    <div
                        ref={this.widgetRef}
                        style={style}
                    >
                        {this.widgetRef.current
                            ? this.getWidgetInWidget(this.props.view, wid, { refParent: this.widgetRef })
                            : null}
                    </div>
                );
            }
        }

        content = content || <div style={style}>---</div>;

        if (noCard) {
            return content;
        }

        return this.wrapContent(content);
    }
}

Html.propTypes = {
    context: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default Html;
