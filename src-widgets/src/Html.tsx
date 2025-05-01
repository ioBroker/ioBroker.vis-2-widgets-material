import React, { type CSSProperties } from 'react';

import Generic from './Generic';
import type {
    VisRxWidgetState,
    RxRenderWidgetProps,
    RxWidgetInfo,
    VisRxWidgetProps,
    VisWidgetCommand,
    WidgetData,
    SingleWidgetId,
} from '@iobroker/types-vis-2';

interface HtmlRxData {
    noCard: boolean;
    widgetTitle: string;
    html: string;
    iframe: string;
    iframe_oid: string;
    image: string;
    image_oid: string;
    objectFit: CSSProperties['objectFit'];
    refreshInterval: string;
    refreshOnWakeUp: boolean;
    refreshOnViewChange: boolean;
    scrollX: boolean;
    scrollY: boolean;
    seamless: boolean;
    noSandbox: boolean;
    allowUserInteractions: boolean;
    refreshWithNoQuery: boolean;
    widget: SingleWidgetId;
    doNotWantIncludeWidgets: boolean;
}

interface HtmlState extends VisRxWidgetState {
    q: number;
}

export default class Html extends Generic<HtmlRxData, HtmlState> {
    widgetRef: React.RefObject<HTMLDivElement> = React.createRef();
    doNotWantIncludeWidgets: boolean | undefined;
    wakeUpInstalled: boolean | undefined;
    viewChangeInstalled: boolean | undefined;
    lastRefreshInterval: number | undefined;
    refreshInterval: ReturnType<typeof setInterval> | undefined;
    lastWidget: string | undefined;

    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = { ...this.state, q: Date.now() };
    }

    static getWidgetInfo(): RxWidgetInfo {
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
                            hidden: (data: WidgetData) =>
                                !!data.iframe || !!data.image || !!data.image_oid || !!data.iframe_oid || !!data.widget,
                        },
                        {
                            name: 'iframe',
                            type: 'url',
                            label: 'iframe_url',
                            hidden: (data: WidgetData) =>
                                !!data.html || !!data.image || !!data.image_oid || !!data.iframe_oid || !!data.widget,
                        },
                        {
                            name: 'iframe_oid',
                            type: 'id',
                            label: 'iframe_oid',
                            hidden: (data: WidgetData) =>
                                !!data.html || !!data.image || !!data.image_oid || !!data.iframe || !!data.widget,
                        },
                        {
                            name: 'image',
                            type: 'url',
                            label: 'image_url',
                            hidden: (data: WidgetData) =>
                                !!data.iframe || !!data.html || !!data.image_oid || !!data.iframe_oid || !!data.widget,
                        },
                        {
                            name: 'image_oid',
                            type: 'id',
                            label: 'image_oid',
                            hidden: (data: WidgetData) =>
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
                            hidden: (data: WidgetData) => !data.image && !data.image_oid,
                        },
                        {
                            name: 'refreshInterval',
                            type: 'slider',
                            min: 0,
                            max: 180000,
                            step: 100,
                            label: 'refresh_interval',
                            hidden: (data: WidgetData) => !!data.html || !!data.widget,
                        },
                        {
                            name: 'refreshOnWakeUp',
                            type: 'checkbox',
                            label: 'refresh_on_wake_up',
                            hidden: (data: WidgetData) => !!data.html || !!data.widget,
                        },
                        {
                            name: 'refreshOnViewChange',
                            type: 'checkbox',
                            label: 'refresh_on_view_change',
                            hidden: (data: WidgetData) => !!data.html || !!data.widget,
                        },
                        {
                            name: 'scrollX',
                            type: 'checkbox',
                            label: 'scroll_x',
                            hidden: (data: WidgetData) => !data.iframe && !data.iframe_oid,
                        },
                        {
                            name: 'scrollY',
                            type: 'checkbox',
                            label: 'scroll_y',
                            hidden: (data: WidgetData) => !data.iframe && !data.iframe_oid,
                        },
                        {
                            name: 'seamless',
                            type: 'checkbox',
                            label: 'seamless',
                            default: true,
                            hidden: (data: WidgetData) => !data.iframe && !data.iframe_oid,
                        },
                        {
                            name: 'noSandbox',
                            type: 'checkbox',
                            label: 'no_sandbox',
                            default: true,
                            hidden: (data: WidgetData) => !data.iframe && !data.iframe_oid,
                        },
                        {
                            name: 'allowUserInteractions',
                            type: 'checkbox',
                            label: 'allow_user_interactions',
                            default: true,
                            hidden: (data: WidgetData) => !data.image && !data.image_oid,
                        },
                        {
                            name: 'refreshWithNoQuery',
                            type: 'checkbox',
                            label: 'refresh_with_no_query',
                            default: true,
                            hidden: (data: WidgetData) =>
                                !data.image && !data.image_oid && !data.iframe && !data.iframe_oid,
                        },
                        {
                            name: 'widget',
                            type: 'widget',
                            label: 'widget_id',
                            hidden: (data: WidgetData) =>
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

    getWidgetInfo(): RxWidgetInfo {
        return Html.getWidgetInfo();
    }

    componentDidMount(): void {
        super.componentDidMount();
        this.reinitInterval();
        this.doNotWantIncludeWidgets = !!this.state.rxData.doNotWantIncludeWidgets;

        // inform view about, that this widget can include other widgets
        this.props.askView?.('update', {
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
    onCommand(command: VisWidgetCommand, options: any) {
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

    reinitInterval(): void {
        const refreshInterval = parseInt(this.state.rxData.refreshInterval, 10);
        if (refreshInterval !== this.lastRefreshInterval || this.state.rxData.widget !== this.lastWidget) {
            this.refreshInterval && clearInterval(this.refreshInterval);
            this.refreshInterval = undefined;
            this.lastWidget = this.state.rxData.widget;

            this.lastRefreshInterval = refreshInterval;
            if (refreshInterval && !this.lastWidget) {
                this.refreshInterval = setInterval(() => this.refresh(), refreshInterval);
            }
        }
    }

    componentWillUnmount(): void {
        super.componentWillUnmount();
        this.refreshInterval && clearInterval(this.refreshInterval);
        this.refreshInterval = undefined;
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

    refresh(): void {
        this.setState({ q: Date.now() });
    }

    getUrl(): string {
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

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element[] | React.JSX.Element | null {
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

        const style: CSSProperties = {
            width: '100%',
            height: !noCard && this.state.rxData.widgetTitle ? 'calc(100% - 36px)' : '100%',
            border: '0',
        };

        Object.keys(this.state.rxStyle!).forEach(key => {
            if (key !== 'position' && key !== 'top' && key !== 'left' && key !== 'width' && key !== 'height') {
                if (
                    (this.state.rxStyle as Record<string, any>)[key] !== undefined &&
                    (this.state.rxStyle as Record<string, any>)[key] !== null
                ) {
                    if (key.includes('-')) {
                        const val = (this.state.rxStyle as Record<string, any>)[key];
                        key = key.replace(/-./g, x => x[1].toUpperCase());
                        (style as Record<string, any>)[key] = val;
                    } else {
                        (style as Record<string, any>)[key] = (this.state.rxStyle as Record<string, any>)[key];
                    }
                }
            }
        });

        let content;

        if (this.state.rxData.html) {
            content = (
                <div
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
