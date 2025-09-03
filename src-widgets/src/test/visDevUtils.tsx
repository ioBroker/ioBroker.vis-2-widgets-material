import React, { type RefObject } from 'react';
import moment from 'moment';
import type { LegacyConnection, ThemeName, ThemeType } from '@iobroker/adapter-react-v5';
import type {
    AnyWidgetId,
    Project,
    ViewCommand,
    ViewCommandOptions,
    VisBaseWidgetProps,
    VisChangeHandlerCallback,
    VisContext,
    VisLegacy,
    VisRxWidgetStateValues,
    VisTheme,
    WidgetData,
    WidgetStyle,
} from '@iobroker/types-vis-2';
import VisFormatUtils from './visFormatUtils';

const WIDGET_ID = 'w_0001';
const WIDGET_TPL = 'tplDemo';
const WIDGET_SET = 'demoSet';
const VIEW_NAME = 'viewDemo';

export function getContext(
    options: {
        socket: LegacyConnection;
        themeType?: ThemeType;
        themeName?: ThemeName;
        toggleTheme?: () => void;
        theme: VisTheme;
    },
    context: Partial<VisContext> | undefined,
    data?: WidgetData,
    style?: WidgetStyle,
): VisContext {
    const visFormatUtils = new VisFormatUtils({ vis: {} as unknown as VisLegacy });

    return {
        $$: null,
        VisView: null as unknown as VisContext['VisView'],
        activeView: VIEW_NAME,
        adapterName: 'vis-2',
        allWidgets: {},
        askAboutInclude: (
            _wid: AnyWidgetId,
            _toWid: AnyWidgetId,
            _cb: (_wid: AnyWidgetId, _toWid: AnyWidgetId) => void,
        ) => {
            // ignore
        },
        buildLegacyStructures: () => {
            // ignore
        },
        can: {
            Map: null,
            view: (_templateName: string, _data: unknown) => window.document.createElement('div'),
        },
        canStates: {
            attr: (
                _id: VisRxWidgetStateValues | string,
                _val?: string | number | boolean,
            ): string | number | boolean | undefined | null | void => {},
            removeAttr: (_id: string) => {},
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        changeProject: async (project: Project, ignoreHistory?: boolean) => {
            // ignore
        },
        changeView: () => {
            // ignore
        },
        dateFormat: 'DD.MM.YYYY',
        disableInteraction: false,
        editModeComponentStyle: {
            // ignore
        },
        formatUtils: {
            formatValue: VisFormatUtils.formatValue,
            extractBinding: visFormatUtils.extractBinding.bind(visFormatUtils),
            formatBinding: visFormatUtils.formatBinding.bind(visFormatUtils),
            formatDate: visFormatUtils.formatDate.bind(visFormatUtils),
        },
        instance: 0,
        jQuery: null,
        lang: 'de',
        linkContext: {
            unregisterChangeHandler: (_wid: AnyWidgetId, _cb: VisChangeHandlerCallback): void => {},
            registerChangeHandler: (_wid: AnyWidgetId, _cb: VisChangeHandlerCallback): void => {},
            subscribe: (_stateId: string | string[]): void => {},
            unsubscribe: (_stateId: string | string[]): void => {},
            getViewRef: (_view: string): RefObject<HTMLDivElement> | null => null,
            registerViewRef: (
                _view: string,
                _ref: RefObject<HTMLDivElement>,
                _onCommand: (command: ViewCommand, options?: ViewCommandOptions) => any,
            ): void => {},
            unregisterViewRef: (_view: string, _ref: RefObject<HTMLDivElement>): void => {},
            visibility: {},
            signals: {},
            lastChanges: {},
            /** list of widgets, that depends on this state */
            bindings: {},
            IDs: [],
        },
        lockDragging: false,
        moment,
        onCommand: (_view: string, _command: ViewCommand, _options?: ViewCommandOptions): any => {
            // ignore
        },
        onIgnoreMouseEvents: null,
        onWidgetsChanged: null,
        projectName: 'main',
        registerEditorCallback: null,
        runtime: true,
        setSelectedGroup: null,
        setSelectedWidgets: null,
        setTimeInterval: (_timeInterval: string): void => {
            // ignore
        },
        setTimeStart: (_timeStart: string): void => {
            // ignore
        },
        setValue: (id: string, value: string | boolean | number | null): void => {
            options.socket.setState(id, value, false).catch(e => console.error(`Cannot set state ${id}: ${e}`));
        },
        showWidgetNames: true,
        socket: options.socket,
        systemConfig: options.socket.systemConfig as ioBroker.SystemConfigObject,
        theme: options.theme,
        themeName: options.themeName || options.theme.name,
        themeType: options.themeType || options.theme.palette.mode,
        timeInterval: '',
        timeStart: '',
        toggleTheme: () => {
            // ignore
            if (options.toggleTheme) {
                options.toggleTheme();
            }
        },
        user: 'admin',
        userGroups: {},
        // @ts-expect-error demo view
        views: {
            [VIEW_NAME]: {
                activeWidgets: [WIDGET_ID],
                filterList: [],
                rerender: true,
                widgets: {
                    [WIDGET_ID]: {
                        widgetSet: WIDGET_SET,
                        tpl: WIDGET_TPL,
                        data: data || {},
                        style: style || {},
                    },
                },
            },
        },
        widgetHint: 'light',
        ...context,
    };
}

export function getProps(
    options: {
        socket: LegacyConnection;
        themeType?: ThemeType;
        themeName?: ThemeName;
        toggleTheme?: () => void;
        theme: VisTheme;
        refParent?: RefObject<HTMLDivElement>;
    },
    data?: WidgetData,
    style?: WidgetStyle,
    props?: Partial<VisBaseWidgetProps>,
): VisBaseWidgetProps {
    const context: VisContext | undefined = props?.context || undefined;
    delete props?.context;

    return {
        id: WIDGET_ID,
        editMode: false,
        runtime: true,
        view: VIEW_NAME,
        isRelative: false,
        selectedWidgets: [],
        relativeWidgetOrder: [],
        moveAllowed: true,
        selectedGroup: null,
        viewsActiveFilter: {},
        tpl: WIDGET_TPL,
        askView: () => {
            // ignore
        },
        onIgnoreMouseEvents: (_ignore: boolean) => {
            // ignore
        },
        onWidgetsChanged: (_changeData: any) => {
            // ignore
        },
        mouseDownOnView: () => {
            // ignore
        },
        refParent: options?.refParent || React.createRef(),
        context: getContext(options, context, data, style),
        customSettings: {},
        ...(props || undefined),
    };
}
