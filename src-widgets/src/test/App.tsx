import React from 'react';

import { type GenericAppProps, I18n, type LegacyConnection } from '@iobroker/adapter-react-v5';
import type { VisBaseWidgetProps, VisTheme } from '@iobroker/types-vis-2';

import { getProps } from './visDevUtils';

import translations from '../translations';

import WidgetDemoApp from './WidgetDemoApp';
import Widget from '../Actual';

export default class App extends WidgetDemoApp {
    private readonly refParent: React.RefObject<HTMLDivElement>;

    private readonly widgetProps: VisBaseWidgetProps;

    constructor(props: GenericAppProps) {
        super(props);

        // init translations
        I18n.extendTranslations(translations);

        this.refParent = React.createRef();

        this.widgetProps = getProps(
            {
                socket: this.socket as unknown as LegacyConnection,
                theme: this.state.theme as unknown as VisTheme,
                refParent: this.refParent as any,
            },
            {
                type: 'all',
            },
            {
                width: 600,
                height: 200,
            },
        );
    }

    renderWidget(): React.JSX.Element {
        return (
            <div
                ref={this.refParent}
                style={{
                    width: 600,
                    height: 200,
                }}
            >
                <Widget {...this.widgetProps} />
            </div>
        );
    }
}
