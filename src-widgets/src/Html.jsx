import React from 'react';
import PropTypes from 'prop-types';

import Generic from './Generic';

class Html extends Generic {
    constructor(props) {
        super(props);

        this.state.q = Date.now();
    }

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
                            hidden: data => !!data.iframe || !!data.image || !!data.image_oid || !!data.iframe_oid,
                        },
                        {
                            name: 'iframe',
                            type: 'url',
                            label: 'iframe_url',
                            hidden: data => !!data.html || !!data.image || !!data.image_oid || !!data.iframe_oid,
                        },
                        {
                            name: 'iframe_oid',
                            type: 'id',
                            label: 'iframe_oid',
                            hidden: data => !!data.html || !!data.image || !!data.image_oid || !!data.iframe,
                        },
                        {
                            name: 'image',
                            type: 'url',
                            label: 'image_url',
                            hidden: data => !!data.iframe || !!data.html || !!data.image_oid || !!data.iframe_oid,
                        },
                        {
                            name: 'image_oid',
                            type: 'id',
                            label: 'image_oid',
                            hidden: data => !!data.iframe || !!data.html || !!data.image || !!data.iframe_oid,
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
                            hidden: data => !!data.html,
                        },
                        {
                            name: 'refreshOnWakeUp',
                            type: 'checkbox',
                            label: 'refresh_on_wake_up',
                            hidden: data => !!data.html,
                        },
                        {
                            name: 'refreshOnViewChange',
                            type: 'checkbox',
                            label: 'refresh_on_view_change',
                            hidden: data => !!data.html,
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

    componentDidMount() {
        super.componentDidMount();
        this.reinitInterval();

        if (this.state.rxData.refreshOnWakeUp) {
            this.wakeUpInstalled = true;
            window.vis.onWakeUp(() => this.refresh(), this.props.id);
        }
        if (this.state.rxData.refreshOnViewChange) {
            this.viewChangeInstalled = true;
            window.vis.navChangeCallbacks.push({
                cb: view => view === this.props.view && this.refresh(),
                id: this.props.id,
            });
        }
    }

    reinitInterval() {
        const refreshInterval = parseInt(this.state.rxData.refreshInterval, 10);
        if (refreshInterval !== this.lastRefreshInterval) {
            this.refreshInterval && clearInterval(this.refreshInterval);
            this.refreshInterval = null;

            this.lastRefreshInterval = refreshInterval;
            if (refreshInterval) {
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
        const style = {
            width: '100%',
            height: this.state.rxData.widgetTitle ? 'calc(100% - 72px)' : 'calc(100% - 36px)',
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

        if (this.state.rxData.html) {
            return this.wrapContent(<div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: this.state.rxData.html }}
                style={style}
            />);
        }
        const key = this.state.rxData.refreshWithNoQuery ? this.state.q : 'element';

        this.reinitInterval();

        if (this.state.rxData.iframe_oid || this.state.rxData.iframe) {
            style.overflowX = this.state.rxData.scrollX ? 'scroll' : 'hidden';
            style.overflowY = this.state.rxData.scrollY ? 'scroll' : 'hidden';

            return this.wrapContent(<iframe
                key={key}
                title={this.props.id}
                seamless={this.state.rxData.seamless}
                src={this.getUrl()}
                style={style}
                sandbox={this.state.rxData.noSandbox ? undefined : 'allow-scripts allow-same-origin allow-modals allow-forms allow-pointer-lock allow-popups'}
            ></iframe>);
        }

        if (this.state.rxData.image || this.state.rxData.image_oid) {
            if (this.state.rxData.allowUserInteractions) {
                style.touchCallout = 'none';
                style.touchSelect = 'none';
                style.touchAction = 'none';
                style.userSelect = 'none';
                style.pointerEvents = 'none';
            }

            style.objectFit = this.state.rxData.objectFit;

            return this.wrapContent(<img
                key={key}
                src={this.getUrl()}
                style={style}
                alt={this.props.id}
            />);
        }

        return this.wrapContent(<div
            style={style}
        >
            ---
        </div>);
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
