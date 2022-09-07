import React from 'react';
import { withStyles } from '@mui/styles';

import { Button } from '@mui/material';
import Generic from './Generic';

const styles = theme => ({

});

class Security extends Generic {
    constructor(props) {
        super(props);
    }

    static getWidgetInfo() {
        return {
            id: 'tplMaterial2Security',
            visSet: 'vis-2-widgets-material',
            visName: 'Security',
            visWidgetLabel: 'vis_2_widgets_material_security',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'name',
                            label: 'vis_2_widgets_material_name',
                        },
                        {
                            name: 'buttonsCount',
                            label: 'vis_2_widgets_material_buttons_count',
                            type: 'number',
                            default: 2,
                        },
                    ],
                }, {
                    name: 'buttons',
                    indexFrom: 1,
                    indexTo: 'buttonsCount',
                    fields: [
                        {
                            name: 'oid',
                            type: 'id',
                            label: 'vis_2_widgets_material_oid',
                            onChange: async (field, data, changeData, socket) => {
                                const object = await socket.getObject(data[field.name]);
                                if (object && object.common) {
                                    data[`color${field.index}`] = object.common.color !== undefined ? object.common.color : null;
                                    data[`name${field.index}`] = object.common.name && typeof object.common.name === 'object' ? object.common.name[I18n.getLanguage()] : object.common.name;
                                    changeData(data);
                                }
                            },
                        },
                        {
                            name: 'name',
                            label: 'vis_2_widgets_material_name',
                        },
                        {
                            name: 'color',
                            type: 'color',
                            label: 'vis_2_widgets_material_color',
                        },
                        {
                            name: 'icon',
                            type: 'image',
                            label: 'vis_2_widgets_material_icon',
                        },
                    ],
                }],
            visDefaultStyle: {
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_security.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return Security.getWidgetInfo();
    }

    async propertiesUpdate() {

    }

    async componentDidMount() {
        super.componentDidMount();
        await this.propertiesUpdate();
    }

    async onPropertiesUpdated() {
        super.onPropertiesUpdated();
        await this.propertiesUpdate();
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const buttons = [];

        for (let i = 1; i <= this.state.rxData.buttonsCount; i++) {
            buttons.push({
                oid: this.state.rxData[`oid${i}`],
                name: this.state.rxData[`name${i}`],
                color: this.state.rxData[`color${i}`],
                icon: this.state.rxData[`icon${i}`],
            });
        }

        const content = <div style={{
            display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'center', flex: 1,
        }}
        >
            {buttons.map((button, index) =>
                <Button variant="contained" key={index}>{button.name}</Button>)}
        </div>;

        return this.wrapContent(content, null, {
            boxSizing: 'border-box',
            paddingBottom: 10,
        });
    }
}

export default withStyles(styles)(Security);
