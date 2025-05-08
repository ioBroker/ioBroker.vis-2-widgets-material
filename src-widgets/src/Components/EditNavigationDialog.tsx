import React, { Component } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material';
import { Check, Close, Delete, DragHandle } from '@mui/icons-material';

import type { Project, RxWidgetInfoAttributesFieldWithType } from '@iobroker/types-vis-2';

import Generic from '../Generic';
import { Icon } from '@iobroker/adapter-react-v5';

export type NavigateRxData = {
    noCard: boolean;
    widgetTitle: string;
    title: string;
    icon: string;
    iconSmall: string;
    showCurrentView: boolean | 'true';
    pinCodeReturnButton: 'submit' | 'backspace';
    count: number;
    [key: `view${number}`]: string;
    [key: `link${number}`]: string;
    [key: `linkSelf${number}`]: boolean | 'true';
    [key: `linkHidden${number}`]: boolean | 'true';
    [key: `icon${number}`]: string;
    [key: `iconSmall${number}`]: string;
    [key: `iconEnabled${number}`]: string;
    [key: `iconEnabledSmall${number}`]: string;
    [key: `color${number}`]: string;
    [key: `colorEnabled${number}`]: string;
    [key: `title${number}`]: string;
    [key: `titleEnabled${number}`]: string;
    [key: `pinCode${number}`]: string;
    [key: `oid-pinCode${number}`]: string;
    [key: `disabled${number}`]: boolean | 'true';
    [key: `hide${number}`]: boolean | 'true';
};

interface EditNavigationDialogProps {
    data: NavigateRxData;
    setData: (data: NavigateRxData) => void;
    Editor: React.FC<{ field: RxWidgetInfoAttributesFieldWithType; index?: number; disabled?: boolean }>;
    selectedWidgets: string[];
    views: Project;
}

type EditLine = {
    view: string;
    link: string;
    linkSelf: boolean | 'true';
    linkHidden: boolean | 'true';
    icon: string;
    iconSmall: string;
    iconEnabled: string;
    iconEnabledSmall: string;
    color: string;
    colorEnabled: string;
    title: string;
    titleEnabled: string;
    pinCode: string;
    oidPinCode: string;
    disabled: boolean | 'true';
    hide: boolean | 'true';
};

interface EditNavigationDialogState {
    editLines: EditLine[];
    count: number;
    open?: boolean;
    originalData: string;
    showEditDialog: number | null;
}

export default class EditNavigationDialog extends Component<EditNavigationDialogProps, EditNavigationDialogState> {
    constructor(props: EditNavigationDialogProps) {
        super(props);
        this.state = {
            count: props.data.count,
            editLines: [],
            originalData: JSON.stringify(props.data),
            ...EditNavigationDialog.widgetData2State(props.data),
            open: false,
            showEditDialog: null,
        };
    }

    static getDerivedStateFromProps(
        props: EditNavigationDialogProps,
        state: EditNavigationDialogState,
    ): Partial<EditNavigationDialogState> | null {
        if (JSON.stringify(props.data) !== state.originalData) {
            return {
                originalData: JSON.stringify(props.data),
                ...EditNavigationDialog.widgetData2State(props.data),
            };
        }
        return null;
    }

    static widgetData2State(data: NavigateRxData): Partial<EditNavigationDialogState> {
        const editLines: EditLine[] = [];
        for (let i = 1; i <= data.count; i++) {
            editLines.push({
                view: data[`view${i}`],
                link: data[`link${i}`],
                linkSelf: data[`linkSelf${i}`],
                linkHidden: data[`linkHidden${i}`],
                icon: data[`icon${i}`],
                iconSmall: data[`iconSmall${i}`],
                iconEnabled: data[`iconEnabled${i}`],
                iconEnabledSmall: data[`iconEnabledSmall${i}`],
                color: data[`color${i}`],
                colorEnabled: data[`colorEnabled${i}`],
                title: data[`title${i}`],
                titleEnabled: data[`titleEnabled${i}`],
                pinCode: data[`pinCode${i}`],
                oidPinCode: data[`oid-pinCode${i}`],
                disabled: data[`disabled${i}`],
                hide: data[`hide${i}`],
            });
        }
        return { editLines, count: data.count };
    }

    static state2WidgetData(state: EditNavigationDialogState, data: NavigateRxData): NavigateRxData {
        const newData = { ...data };
        for (let i = 1; i <= state.count; i++) {
            const line = state.editLines[i - 1];
            newData[`view${i}`] = line.view;
            newData[`link${i}`] = line.link;
            newData[`linkSelf${i}`] = line.linkSelf;
            newData[`linkHidden${i}`] = line.linkHidden;
            newData[`icon${i}`] = line.icon;
            newData[`iconSmall${i}`] = line.iconSmall;
            newData[`iconEnabled${i}`] = line.iconEnabled;
            newData[`iconEnabledSmall${i}`] = line.iconEnabledSmall;
            newData[`color${i}`] = line.color;
            newData[`colorEnabled${i}`] = line.colorEnabled;
            newData[`title${i}`] = line.title;
            newData[`titleEnabled${i}`] = line.titleEnabled;
            newData[`pinCode${i}`] = line.pinCode;
            newData[`oid-pinCode${i}`] = line.oidPinCode;
            newData[`disabled${i}`] = line.disabled;
            newData[`hide${i}`] = line.hide;
        }
        return newData;
    }

    isSelected(): boolean {
        return false;
    }

    renderButton(line: EditLine): React.JSX.Element {
        const view = this.props.views[line.view];

        let color: string | undefined = this.isSelected()
            ? line.colorEnabled || line.color || view?.settings?.navigationSelectedColor
            : undefined;
        color ||= line.color || view?.settings?.navigationColor || view?.settings?.navigationBarColor;

        let title = this.isSelected() ? line.titleEnabled : '';
        title ||= line.title || view?.settings?.navigationTitle || view?.settings?.navigationBarText || '';
        title ||= line.view || '';
        let iconStr: string | undefined = '';
        let icon: React.JSX.Element | null = null;
        if (this.isSelected()) {
            iconStr = line.iconEnabled || line.iconEnabledSmall;
        }
        iconStr ||= line.icon || line.iconSmall;
        iconStr ||= line.view
            ? view?.settings?.navigationIcon ||
              view?.settings?.navigationImage ||
              view?.settings?.navigationBarIcon ||
              view?.settings?.navigationBarImage
            : '';

        if (iconStr) {
            icon = (
                <Icon
                    src={iconStr}
                    style={{
                        width: 24,
                        height: 24,
                    }}
                />
            );
        }

        return (
            <Button
                variant="contained"
                style={{ color: color, whiteSpace: 'nowrap' }}
                startIcon={icon}
            >
                {title}
            </Button>
        );
    }

    renderLine(index: number): React.JSX.Element {
        return (
            <Draggable
                key={index}
                draggableId={index.toString()}
                index={index}
            >
                {(dragProvided, dragSnapshot) => (
                    <TableRow
                        key={index}
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        style={{
                            ...dragProvided.draggableProps.style,
                            backgroundColor: dragSnapshot.isDragging ? '#334455' : undefined,
                        }}
                    >
                        <TableCell>
                            <div
                                {...dragProvided.dragHandleProps}
                                style={{ display: 'inline-block', width: 24, marginRight: 8 }}
                            >
                                <DragHandle />
                            </div>
                        </TableCell>
                        <TableCell>
                            <TextField
                                variant="standard"
                                value={this.state.editLines[index].title}
                                onChange={e => {
                                    const editLines = [...this.state.editLines];
                                    editLines[index].title = e.target.value;
                                    this.setState({ editLines });
                                }}
                            />
                        </TableCell>
                        <TableCell>
                            <TextField
                                variant="standard"
                                value={this.state.editLines[index].titleEnabled}
                                onChange={e => {
                                    const editLines = [...this.state.editLines];
                                    editLines[index].titleEnabled = e.target.value;
                                    this.setState({ editLines });
                                }}
                            />
                        </TableCell>
                        <TableCell>
                            <TextField
                                variant="standard"
                                value={this.state.editLines[index].pinCode}
                                onChange={e => {
                                    const editLines = [...this.state.editLines];
                                    editLines[index].pinCode = e.target.value;
                                    this.setState({ editLines });
                                }}
                            />
                        </TableCell>
                        <TableCell>{this.renderButton(this.state.editLines[index])}</TableCell>
                        <TableCell>
                            <IconButton
                                onClick={() =>
                                    this.setState({ editLines: this.state.editLines.filter((_, i) => i !== index) })
                                }
                            >
                                <Delete />
                            </IconButton>
                        </TableCell>
                    </TableRow>
                )}
            </Draggable>
        );
    }

    renderDialog(): React.JSX.Element | null {
        if (!this.state.open) {
            return null;
        }
        return (
            <Dialog
                maxWidth="xl"
                fullWidth
                open={!0}
                onClose={() => {
                    this.setState({ open: false });
                }}
            >
                <DialogTitle>{Generic.t('Re-order')}</DialogTitle>
                <DialogContent>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>{Generic.t('title')}</TableCell>
                                    <TableCell>{Generic.t('titleEnabled')}</TableCell>
                                    <TableCell>{Generic.t('pincode')}</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <DragDropContext
                                onDragEnd={data => {
                                    const editLines = [...this.state.editLines];
                                    const [removed] = editLines.splice(data.source.index, 1);
                                    editLines.splice(data.destination!.index, 0, removed);
                                    this.setState({ editLines });
                                }}
                            >
                                <Droppable
                                    droppableId="items"
                                    type="ROW"
                                >
                                    {(dropProvided, dropSnapshot) => (
                                        <TableBody
                                            ref={dropProvided.innerRef}
                                            {...dropProvided.droppableProps}
                                            style={{
                                                backgroundColor: dropSnapshot.isDraggingOver ? '#112233' : undefined,
                                            }}
                                        >
                                            {this.state.editLines.map((line, i) => this.renderLine(i))}
                                            {dropProvided.placeholder}
                                        </TableBody>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        disabled={
                            this.state.originalData ===
                            JSON.stringify(EditNavigationDialog.state2WidgetData(this.state, this.props.data))
                        }
                        onClick={() => {
                            this.setState({ open: false });
                            this.props.setData(EditNavigationDialog.state2WidgetData(this.state, this.props.data));
                        }}
                        color="primary"
                        startIcon={<Check />}
                    >
                        {Generic.t('Apply')}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => this.setState({ open: false })}
                        color="grey"
                        startIcon={<Close />}
                    >
                        {Generic.t('Close')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    render(): React.JSX.Element {
        return (
            <div>
                <Button
                    disabled={this.props.selectedWidgets.length > 1}
                    variant="contained"
                    onClick={() => this.setState({ open: true })}
                >
                    {Generic.t('Re-order')}
                </Button>
                {this.renderDialog()}
            </div>
        );
    }
}
