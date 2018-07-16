import * as _ from 'lodash';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import AutoRenew from 'material-ui/svg-icons/action/autorenew';
import * as React from 'react';
import { CSSProperties } from 'react';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ActionCreator } from 'typescript-fsa';
import { backlogActionCreators } from '../actions/backlog';
import { errorDialogActionCreators } from '../actions/errorDialog';
import { issueTableActionCreators } from '../actions/issueTable';
import { IBacklogPageState } from '../reducers/backlog';
import { IRootState } from '../reducers/reducer';
import { filterWorksByProjectNames } from '../services/util';
import { ErrorDialog, IErrorDialogProps } from './ErrorDialog';
import { IIssueTableProps, IssueTable } from './IssueTable';
import { IIssueTableConfigProps, IssueTableConfig } from './IssueTableConfig';
import { MilestoneTable } from './milestoneTable';

const style: CSSProperties = {
  bottom: 20,
  left: 'auto',
  margin: 0,
  position: 'fixed',
  right: 20,
  top: 'auto'
};

interface IRefreshProps {
  onClick: React.MouseEventHandler<JSX.Element | HTMLElement>;
  isFetching: boolean;
}

// tslint:disable-next-line
const Refresh = (props: IRefreshProps) => (
  <FloatingActionButton style={style} onClick={props.onClick} disabled={props.isFetching}>
    <AutoRenew />
  </FloatingActionButton>
);

interface IBacklogPageProps {
  selectedProjectName: string;
  isFetchingData: boolean;
  issueTable: IIssueTableProps;
  issueTableConfig: IIssueTableConfigProps;
  errorDialog: IErrorDialogProps;
  requestUpdate: ActionCreator<undefined>;
}

class BacklogPage extends React.Component<IBacklogPageProps, any> {
  constructor(props: IBacklogPageProps) {
    super(props);
    this.onClickRefreshButton = this.onClickRefreshButton.bind(this);
  }

  public onClickRefreshButton() {
    this.props.requestUpdate();
  }

  public render() {
    return (
      <div>
        <ErrorDialog {...this.props.errorDialog} />
        <IssueTableConfig {...this.props.issueTableConfig} />
        <Refresh onClick={this.onClickRefreshButton} isFetching={this.props.isFetchingData} />
        <IssueTable {...this.props.issueTable} />
        <MilestoneTable milestones={this.props.issueTable.milestones} />
      </div>
    );
  }
}

function mapStateToProps(state: IRootState): IBacklogPageState {
  return state.backlogPage;
}

function mapDispatchToProps(dispatch: Dispatch<any>) {
  return {
    backlogPage: bindActionCreators(backlogActionCreators as {}, dispatch),
    errorDialog: bindActionCreators(errorDialogActionCreators as {}, dispatch),
    issueTable: bindActionCreators(issueTableActionCreators as {}, dispatch)
  };
}

function mergeProps(stateProps: IBacklogPageState, dispatchProps: any, ownProps: any): IBacklogPageProps {
  const works =
    stateProps.global.selectedProjectName === 'All'
      ? stateProps.issueTable.works
      : filterWorksByProjectNames(stateProps.issueTable.works, [stateProps.global.selectedProjectName]);

  const global = stateProps.global;

  const errorDialog: IErrorDialogProps = {
    ...stateProps.errorDialog,
    onRequestClose: dispatchProps.errorDialog.requestClosing
  };

  const maxClassNumWork = _.maxBy(works, w => (w.Label ? w.Label.ParentNames.length : 0));
  const maxClassNum =
    maxClassNumWork && maxClassNumWork.Label
      ? maxClassNumWork.Label.ParentNames.length + 1 // 1 is work own label
      : 0;

  const issueTable: IIssueTableProps = {
    ...stateProps.issueTable,
    actions: dispatchProps.issueTable,
    maxClassNum,
    parallels: global.parallels,
    selectedProjectName: global.selectedProjectName,
    showManDayColumn: stateProps.issueTable.showManDayColumn,
    showSPColumn: stateProps.issueTable.showSPColumn,
    showTotalManDayColumn: stateProps.issueTable.showTotalManDayColumn,
    showTotalSPColumn: stateProps.issueTable.showTotalSPColumn,
    velocityPerManPerDay: global.velocityPerManPerDay,
    works
  };

  const issueTableConfigStyle: CSSProperties = {
    margin: 10
  };

  const projectNames = stateProps.issueTable.works
    .map(w => w.Issue.ProjectName)
    .filter((pn, i, self) => self.indexOf(pn) === i);
  const issueTableConfig: IIssueTableConfigProps = {
    onChangeParallels: dispatchProps.changeParallels,
    onChangeProjectSelectField: dispatchProps.backlogPage.changeProjectTextField,
    onDisableManDay: dispatchProps.disableManDay,
    onEnableManDay: dispatchProps.backlogPage.enableManDay,
    parallels: stateProps.global.parallels,
    projectNames,
    style: issueTableConfigStyle,
    velocityPerManPerDay: stateProps.global.velocityPerManPerDay,
    works
  };

  return {
    ...ownProps,
    errorDialog,
    isFetchingData: stateProps.global.isFetchingData,
    issueTable,
    issueTableConfig,
    requestUpdate: dispatchProps.issueTable.requestUpdate,
    selectedProjectName: stateProps.global.selectedProjectName
  };
}

// tslint:disable-next-line variable-name
export const ConnectedBacklogPage = connect(mapStateToProps, mapDispatchToProps, mergeProps)(BacklogPage as any);