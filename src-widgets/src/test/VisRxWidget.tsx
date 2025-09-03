import React, { Component } from 'react';

import { Card, CardContent } from '@mui/material';

import { I18n } from '@iobroker/adapter-react-v5';

import type {
    AnyWidgetId,
    WidgetStyle,
    RxRenderWidgetProps,
    VisRxWidgetStateValues,
    VisLinkContextBinding,
    VisLinkContextItem,
    VisLinkContextSignalItem,
    RxWidgetInfoAttributesField,
    StateID,
    RxWidgetInfo,
    RxWidgetInfoAttributesFieldWithType,
    VisViewProps,
    VisBaseWidgetProps,
} from '@iobroker/types-vis-2';
import VisRxWidget from '@iobroker/types-vis-2/visRxWidget';

const POSSIBLE_MUI_STYLES = [
    'background-color',
    'border',
    'background',
    'background-image',
    'background-position',
    'background-repeat',
    'background-size',
    'background-clip',
    'background-origin',
    'color',
    'box-sizing',
    'border-width',
    'border-style',
    'border-color',
    'border-radius',
    'box-shadow',
    'text-align',
    'text-shadow',
    'font-family',
    'font-size',
    'font-weight',
    'line-height',
    'font-style',
    'font-variant',
    'letter-spacing',
    'word-spacing',
];

interface VisRxWidgetState<T> {
    values: VisRxWidgetStateValues;
    data: T;
    style: WidgetStyle;
    rxData: T;
    rxStyle: WidgetStyle;
}

export class visRxWidget<T> extends Component<VisBaseWidgetProps, VisRxWidgetState<T>> {
    static POSSIBLE_MUI_STYLES = POSSIBLE_MUI_STYLES;

    private wrappedContent: boolean | undefined;

    private refService: React.RefObject<HTMLDivElement> = React.createRef();

    private linkContext: {
        IDs: string[];
        bindings: Record<StateID, VisLinkContextBinding[]>;
        visibility: Record<string, VisLinkContextItem[]>;
        lastChanges: Record<string, VisLinkContextItem[]>;
        signals: Record<string, VisLinkContextSignalItem[]>;
        widgetAttrInfo: Record<string, RxWidgetInfoAttributesField>;
    };

    constructor(props: VisBaseWidgetProps) {
        super(props);
        this.onStateChanged = this.onStateChanged.bind(this);
        const widget = this.props.context.views[this.props.view].widgets[this.props.id];

        this.state = {
            values: {},
            data: JSON.parse(JSON.stringify(widget.data || {})),
            style: JSON.parse(JSON.stringify(widget.style || {})),
            rxData: JSON.parse(JSON.stringify(widget.data || {})),
            rxStyle: JSON.parse(JSON.stringify(widget.style || {})),
        };

        this.linkContext = {
            IDs: [],
            bindings: {},
            visibility: {},
            lastChanges: {},
            signals: {},
            widgetAttrInfo: {},
        };
    }

    getWidgetInfo(): Readonly<RxWidgetInfo> {
        throw new Error('not implemented');
    }

    static getI18nPrefix(): string {
        return '';
    }

    static getText(text: ioBroker.StringOrTranslated): string {
        if (!text) {
            return '';
        }
        if (typeof text === 'object') {
            return text[I18n.getLanguage()] || text.en;
        }
        return text;
    }

    static t(key: ioBroker.StringOrTranslated, ...args: any[]): string {
        return I18n.t(
            `${this.getI18nPrefix()}${typeof key === 'string' ? key : key[I18n.getLanguage()] || key.en}`,
            ...args,
        );
    }

    static getLanguage(): ioBroker.Languages {
        return I18n.getLanguage();
    }

    renderWidgetBody(_props: RxRenderWidgetProps): React.JSX.Element | null {
        return null;
    }

    onStateUpdated(_id: string, _state: ioBroker.State | null): void {}

    formatValue(value: number | string | null, round?: number): string {
        if (typeof value === 'number') {
            if (round === 0) {
                value = Math.round(value);
            } else {
                value = Math.round(value * 100) / 100;
            }
            if (this.props.context.systemConfig?.common) {
                if (this.props.context.systemConfig.common.isFloatComma) {
                    value = value.toString().replace('.', ',');
                }
            }
        }

        return value === undefined || value === null ? '' : value.toString();
    }

    wrapContent(
        content: React.ReactNode,
        addToHeader?: React.ReactNode | null,
        cardContentStyle?: React.CSSProperties,
        headerStyle?: React.CSSProperties,
        onCardClick?: (e: React.MouseEvent<HTMLDivElement>) => void,
        components?: {
            Card?: React.FC<{
                className?: string;
                style?: React.CSSProperties;
                onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
                children?: React.ReactNode;
            }>;
            CardContent?: React.FC<{
                className?: string;
                style?: React.CSSProperties;
                children?: React.ReactNode;
            }>;
        },
    ): React.JSX.Element {
        const MyCard: React.FC<{
            className?: string;
            style?: React.CSSProperties;
            onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
            children: React.ReactNode;
        }> = components?.Card || Card;
        const MyCardContent = components?.CardContent || CardContent;

        const style = {
            width: 'calc(100% - 8px)',
            height: 'calc(100% - 8px)',
            margin: 4,
            ...this.props.customSettings?.viewStyle?.visCard,
        };
        // apply style from the element
        Object.keys(this.state.rxStyle).forEach(attr => {
            const value = (this.state.rxStyle as Record<string, string>)[attr];
            if (value !== null && value !== undefined && POSSIBLE_MUI_STYLES.includes(attr)) {
                attr = attr.replace(/(-\w)/g, text => text[1].toUpperCase());
                style[attr] = value;
            }
        });

        this.wrappedContent = true;

        // support for extended option widgetTitle
        // @ts-expect-error We know that widgetTitle could be a string
        const widgetTitle: string | undefined = this.state.rxData.widgetTitle;

        return (
            <MyCard
                className="vis_rx_widget_card"
                style={style}
                onClick={onCardClick}
            >
                <MyCardContent
                    className="vis_rx_widget_card_content"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: 'calc(100% - 32px)',
                        paddingBottom: 16,
                        position: 'relative',
                        ...cardContentStyle,
                    }}
                >
                    {widgetTitle ? (
                        <div
                            className="vis_rx_widget_card_name"
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                alignItems: 'center',
                            }}
                        >
                            <div
                                className="vis_rx_widget_card_name_div"
                                style={{
                                    fontSize: 24,
                                    paddingTop: 0,
                                    paddingBottom: 4,
                                    ...headerStyle,
                                }}
                            >
                                {widgetTitle}
                            </div>
                            {addToHeader || null}
                        </div>
                    ) : (
                        addToHeader || null
                    )}
                    {content}
                </MyCardContent>
            </MyCard>
        );
    }

    // used for simulation of VisRxWidget
    private getIdSubscribeState = async (
        id: string,
        cb: (id: string, result: ioBroker.State | null) => void,
    ): Promise<void> => {
        const result = await this.props.context.socket.getState(id);
        void this.props.context.socket.subscribeState(id, () => cb(id, result));
    };

    onStateChanged(id: string, state: ioBroker.State | null | undefined): void {
        if (!state) {
            return;
        }
        const values: VisRxWidgetStateValues = JSON.parse(JSON.stringify(this.state.values));
        if (state.val !== undefined) {
            values[`${id}.val`] = state.val;
        }
        if (state.ts !== undefined) {
            values[`${id}.ts`] = state.ts;
        }
        if (state.from !== undefined) {
            values[`${id}.from`] = state.from;
        }
        if (state.lc !== undefined) {
            values[`${id}.lc`] = state.lc;
        }
        if (state.ts !== undefined) {
            values[`${id}.ts`] = state.ts;
        }
        // if (state.user !== undefined) {
        //     values[`${id}.user`] = state.user;
        // }
        // if (state.ack !== undefined) {
        //     values[`${id}.ack`] = state.ack;
        // }
        // if (state.q !== undefined) {
        //     values[`${id}.q`] = state.q;
        // }

        this.onStateUpdated(id, state);

        this.setState({ values });
    }

    componentDidMount(): void {
        this.getWidgetInfo()?.visAttrs?.forEach(group =>
            group?.fields?.forEach(field => {
                if ((field as RxWidgetInfoAttributesFieldWithType)?.type === 'id') {
                    Object.keys(this.state.data as Record<string, string>).forEach(dataKey => {
                        // do not use here \d instead of [0-9] as it will be wrong compiled
                        if (dataKey.match(new RegExp(`^${field.name}[0-9]*$`))) {
                            const oid = (this.state.data as Record<string, string>)[dataKey];
                            if (!this.linkContext.IDs.includes(oid)) {
                                this.linkContext.IDs.push(oid);
                            }
                        }
                    });
                }
            }),
        );

        for (let i = 0; i < this.linkContext.IDs.length; i++) {
            this.getIdSubscribeState(this.linkContext.IDs[i], this.onStateChanged);
        }
    }

    componentWillUnmount(): void {
        this.linkContext.IDs.forEach(oid => this.props.context.socket.unsubscribeState(oid, this.onStateChanged));
    }

    getWidgetView(_view: string, _props?: Partial<VisViewProps>): React.JSX.Element {
        return <div style={{ width: '100%', height: '100%' }}>DEMO VIEW</div>;
    }

    getWidgetInWidget(
        _view: string,
        _wid: AnyWidgetId,
        _props?: {
            index?: number;
            refParent?: React.RefObject<HTMLDivElement>;
            isRelative?: boolean;
        },
    ): React.JSX.Element | null {
        return null;
    }

    render(): React.JSX.Element {
        return (
            <div
                ref={this.refService}
                style={{
                    width: this.state.style?.width as string,
                    height: this.state.style?.height as string,
                }}
            >
                {this.renderWidgetBody({
                    className: '',
                    overlayClassNames: [],
                    style: {},
                    id: 'defaultID',
                    refService: this.refService,
                    widget: {
                        tpl: 'tplDemo',
                        data: {},
                        style: {},
                        widgetSet: 'demoSet',
                    },
                })}
            </div>
        );
    }
}

export default visRxWidget;
