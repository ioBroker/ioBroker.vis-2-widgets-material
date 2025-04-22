import React from 'react';
import PropTypes from 'prop-types';

import { ToggleThemeMenu, I18n } from '@iobroker/adapter-react-v5';

import { Button } from '@mui/material';

import Generic from './Generic';
import type { VisRxWidgetState } from './visRxWidget';
import { RxWidgetInfo } from '@iobroker/types-vis-2';

interface ThemeSwitcherRxData {
    themeType: string;
    themeName: string;
    simple: boolean;
    variant: string;
}

interface ThemeSwitcherState extends VisRxWidgetState {}

class ThemeSwitcher extends Generic<ThemeSwitcherRxData, ThemeSwitcherState> {
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplMaterial2ThemeSwitcher',
            visSet: 'vis-2-widgets-material',
            visName: 'Theme switcher',
            visWidgetLabel: 'theme_switcher', // Label of widget
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            label: 'theme_type',
                            type: 'select',
                            options: [
                                { value: 'system', label: 'Browser' },
                                { value: 'static', label: 'Static' },
                                { value: 'variable', label: 'Variable' },
                            ],
                            default: 'system',
                            name: 'themeType',
                        },
                        {
                            name: 'themeName',
                            type: 'select',
                            noTranslation: true,
                            options: [
                                { value: 'dark', label: 'dark' },
                                { value: 'dark-blue', label: 'dark-blue' },
                                { value: 'light', label: 'light' },
                                { value: 'colored', label: 'colored' },
                            ],
                            default: 'light',
                            label: 'theme_name',
                            hidden: (data: WidgetData) => data.themeType === 'system',
                        },
                        {
                            name: 'simple',
                            type: 'checkbox',
                            default: true,
                            label: 'only_light_dark',
                            hidden: (data: WidgetData) => data.themeType !== 'variable',
                        },
                        {
                            name: 'variant',
                            type: 'select',
                            options: [
                                { value: 'contained', label: 'Contained' },
                                { value: 'standard', label: 'Standard' },
                                { value: 'outlined', label: 'Outlined' },
                            ],
                            default: 'outlined',
                            label: 'variant',
                            hidden: (data: WidgetData) => data.themeType !== 'variable',
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: 48,
                height: 48,
                position: 'absolute',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_theme_switcher.png',
        };
    }

    componentDidMount() {
        super.componentDidMount();
        let themeName;
        if (this.state.rxData.themeType === 'system') {
            // get browser theme
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                // dark mode
                themeName = 'dark';
            } else {
                themeName = 'light';
            }
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.onThemeChanged);
            this.setState({ themeName }, () => this.setViewTheme(themeName));
        } else if (this.state.rxData.themeType === 'static') {
            // set view theme
            themeName = this.state.rxData.themeName;
        } else if (this.state.rxData.themeType === 'variable') {
            // get the last theme from local storage
            themeName =
                window.localStorage.getItem('App.themeName') ||
                (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        }
        this.setState({ themeName }, () => this.setViewTheme(themeName));
    }

    setViewTheme(themeName) {
        this.props.context?.toggleTheme && this.props.context?.toggleTheme(themeName || this.state.rxData.themeName);
    }

    onThemeChanged = event => this.setState({ themeName: event.matches ? 'dark' : 'light' });

    componentWillUnmount(): void {
        if (this.state.rxData.themeType === 'system') {
            window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.onThemeChanged);
        }
    }

    getWidgetInfo(): RxWidgetInfo {
        return ThemeSwitcher.getWidgetInfo();
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element[] | React.JSX.Element | null {
        super.renderWidgetBody(props);
        if (this.state.rxData.themeType === 'system' || this.state.rxData.themeType === 'static') {
            if (this.props.editMode) {
                return (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        <ToggleThemeMenu
                            style={{
                                width: '100%',
                                textAlign: 'center',
                            }}
                            themeName={this.state.themeName}
                            toggleTheme={() => {}}
                            t={I18n.t}
                        />
                    </div>
                );
            }
            return null;
        }
        if (this.state.rxData.themeType === 'variable') {
            return (
                <Button
                    variant={this.state.rxData.variant}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    onClick={e => {
                        e.stopPropagation();
                        const themeName = this.state.themeName;

                        let newThemeName;
                        if (this.state.rxData.simple) {
                            newThemeName = themeName === 'dark' ? 'light' : 'dark';
                        } else {
                            // dark => blue => colored => light => dark
                            newThemeName =
                                themeName === 'dark'
                                    ? 'blue'
                                    : themeName === 'blue'
                                      ? 'colored'
                                      : themeName === 'colored'
                                        ? 'light'
                                        : 'dark';
                        }

                        window.localStorage.setItem('App.themeName', newThemeName);
                        this.setState({ themeName: newThemeName }, () => this.setViewTheme(newThemeName));
                    }}
                >
                    <ToggleThemeMenu
                        themeName={this.state.themeName}
                        toggleTheme={() => {}}
                        t={I18n.t}
                    />
                </Button>
            );
        }

        return null;
    }
}

ThemeSwitcher.propTypes = {
    context: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default ThemeSwitcher;
