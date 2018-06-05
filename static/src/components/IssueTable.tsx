import * as React from 'react';

import { Table, TableBody } from 'material-ui/Table';
import { IIssueTableActionCreators } from '../actions/issueTable';
import { Work } from '../models/work';
import { IssueTableHeadersRow } from './IssueTableHeadersRow';
import TableHeader from 'material-ui/Table/TableHeader';
import { IssueTableRow } from './IssueTableRow';
import { Milestone } from '../models/milestone';
import { eachSum, filterWorksByProjectNames } from '../services/util';

export interface IIssueTableProps {
  works: Work[];
  milestones: Milestone[];
  showManDayColumn: boolean;
  showTotalManDayColumn: boolean;
  showSPColumn: boolean;
  showTotalSPColumn: boolean;
  velocityPerManPerDay: number;
  parallels: number;
  selectedProjectName: string;
  actions: IIssueTableActionCreators;
}

export class IssueTable extends React.Component<IIssueTableProps, any> {
  componentDidMount() {
    this.props.actions.requestUpdate();
  }

  render() {
    console.log(this.props.works);
    const totalSPs = eachSum(this.props.works.map(w => w.StoryPoint));
    return (
      <Table fixedHeader={false} style={{ tableLayout: 'auto' }}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <IssueTableHeadersRow
            showManDayColumn={this.props.showManDayColumn}
            showTotalManDayColumn={this.props.showTotalManDayColumn}
            showSPColumn={this.props.showSPColumn}
            showTotalSPColumn={this.props.showTotalSPColumn}
          />
        </TableHeader>

        <TableBody displayRowCheckbox={false}>
          {this.props.works.map((w, i) => (
            <IssueTableRow
              work={w}
              key={w.Issue.ProjectName + w.Issue.IID}
              totalSP={totalSPs[i]}
              showManDayColumn={this.props.showManDayColumn}
              showTotalManDayColumn={this.props.showTotalManDayColumn}
              showSPColumn={this.props.showSPColumn}
              showTotalSPColumn={this.props.showTotalSPColumn}
              velocityPerManPerDay={this.props.velocityPerManPerDay}
              parallels={this.props.parallels}
            />
          ))}
        </TableBody>
      </Table>
    );
  }
}
