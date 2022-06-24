import React from 'react';

class visRxWidget extends React.Component {
    constructor(props) {
        super(props);
        this.onStateChanged = this.onStateChanged.bind(this);
        this.state = { ...props, values: {} };
        this.linkContext = {
            IDs: [],
        };
    }

    renderWidgetBody() {

    }

    getIdSubscribeState = (id, cb) => {
        this.props.socket.getState(id).then(result => cb(id, result));
        this.props.socket.subscribeState(id, (resultId, result) => cb(id, result));
    };

    onStateChanged(id, state) {
        if (!state) {
            return;
        }
        const values = JSON.parse(JSON.stringify(this.state.values));
        Object.keys(state).forEach(key => {
            values[`${id}.${key}`] = state[key];
        });
        this.setState({ values });
    }

    componentDidMount() {
        this.getWidgetInfo().visAttrs.forEach(group => {
            group.fields.forEach(field => {
                if (field.type === 'id') {
                    Object.keys(this.state.data).forEach(dataKey => {
                        if (dataKey.match(new RegExp(`^${field.name}[0-9]*$`))) {
                            this.linkContext.IDs.push(this.state.data[dataKey]);
                        }
                    });
                }
            });
        });
        this.linkContext.IDs.forEach(oid => this.getIdSubscribeState(oid, this.onStateChanged));
    }

    componentWillUnmount() {
        this.linkContext.IDs.forEach(oid => this.props.socket.unsubscribeState(oid, this.onStateChanged));
    }

    render() {
        return <div style={{ width: this.state.style?.width, height: this.state.style?.height }}>
            {this.renderWidgetBody()}
        </div>;
    }
}

export default visRxWidget;
