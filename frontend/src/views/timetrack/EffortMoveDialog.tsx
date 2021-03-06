import {FormikProps} from 'formik';
import {inject, observer} from 'mobx-react';
import * as React from 'react';
import { ProjectCommentStore } from 'src/stores/projectCommentStore';
import * as yup from 'yup';
import {ProjectPositionSelect} from '../../form/entitySelect/ProjectPositionSelect';
import {ProjectSelect} from '../../form/entitySelect/ProjectSelect';
import {DimeField} from '../../form/fields/formik';
import {FormDialog} from '../../form/FormDialog';
import {EffortStore} from '../../stores/effortStore';
import {ProjectStore} from '../../stores/projectStore';
import {TimetrackFilterStore} from '../../stores/timetrackFilterStore';
import {localizeSchema, nullableNumber, selector} from '../../utilities/validation';

const schema = localizeSchema(() =>
  yup.object({
    project_id: selector(),
    project_position: nullableNumber(),
  }),
);

const template = {
  project_id: '',
  project_position: '',
};

type Values = typeof template;

interface Props {
  effortIds: number[];
  commentIds: number[];
  projectStore?: ProjectStore;
  effortStore?: EffortStore;
  projectCommentStore?: ProjectCommentStore;
  timetrackFilterStore?: TimetrackFilterStore;
  onClose: () => void;
}

@inject('effortStore', 'projectStore', 'timetrackFilterStore', 'projectCommentStore')
@observer
export default class EffortMoveDialog extends React.Component<Props> {
  handleSubmit = async (formValues: Values) => {

    const values = schema.cast(formValues);
    if (this.props.effortIds.length > 0) {
      if (values.project_id) {
        await this.props.effortStore!.move(this.props.effortIds, values.project_id, values.project_position);
        await this.props.effortStore!.fetchWithProjectEffortFilter(this.props.timetrackFilterStore!.filter);
      }
    }
    if (this.props.commentIds.length > 0) {
      if (values.project_id) {
        await this.props.projectCommentStore!.move(this.props.commentIds, values.project_id);
        await this.props.projectCommentStore!.fetchWithProjectEffortFilter(this.props.timetrackFilterStore!.filter);
      }
    }
    this.props.onClose();
  }

  printEffort = (n: number) => {
    if (n === 1) {
      return ' Aufwand';
    } else {
      return ' Aufwände';
    }
  }

  printComment = (n: number) => {
    if (n === 1) {
      return ' Kommentar';
    } else {
      return ' Kommentare';
    }
  }

  render() {
    const {lastMoveProject, lastMovePosition} = this.props.effortStore!;
    const nEfforts = this.props.effortIds.length;
    const nComments = this.props.commentIds.length;
    const moveEfforts = nEfforts > 0;
    const moveComments = nComments > 0;
    const moveBoth = moveEfforts && moveComments;

    return (
      <FormDialog
        open
        onClose={this.props.onClose}
        title={`${moveEfforts ? nEfforts + this.printEffort(nEfforts) : ''} ${moveBoth ? ' und ' : ''} ${moveComments ? nComments + this.printComment(nComments) : ''} verschieben`}
        initialValues={{
          project_id: lastMoveProject || '',
          project_position: lastMovePosition || '',
        }}
        validationSchema={schema}
        onSubmit={this.handleSubmit}
        render={(formikProps: FormikProps<Values>) => (
          <>
            <DimeField component={ProjectSelect} name={'project_id'} label={'Projekt'} />
            <DimeField
              disabled={!moveEfforts}
              component={ProjectPositionSelect}
              isClearable
              projectId={formikProps.values.project_id}
              name="project_position"
              label={'Service'}
              placeholder={moveEfforts ? 'Beibehalten' : 'Nur für Aufwände'}
            />
          </>
        )}
      />
    );
  }
}
