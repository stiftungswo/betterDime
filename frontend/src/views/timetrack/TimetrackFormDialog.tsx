import React from 'react';
import { Field, Formik, FormikBag, FormikProps, FormikValues } from 'formik';
import { EmployeeSelector } from '../../form/entitySelector/EmployeeSelector';
import { ProjectSelector } from '../../form/entitySelector/ProjectSelector';
import { DatePicker } from '../../form/fields/DatePicker';
import { EffortStore } from '../../stores/effortStore';
import * as yup from 'yup';
import { ProjectComment, ProjectEffort, ProjectEffortTemplate } from '../../types';
import compose from '../../utilities/compose';
import { inject, observer } from 'mobx-react';
import { MainStore } from '../../stores/mainStore';
import { ProjectPositionSelector } from '../../form/entitySelector/ProjectPositionSelector';
import { EffortValueField } from '../../form/fields/timetrack/EffortValueField';
import Dialog from '@material-ui/core/Dialog/Dialog';
import { DialogContent, DialogTitle, withMobileDialog } from '@material-ui/core';
import { InjectedProps } from '@material-ui/core/withMobileDialog';
import Button from '@material-ui/core/Button/Button';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import { TextField } from '../../form/fields/common';
import { ProjectCommentStore } from '../../stores/projectCommentStore';
import { TimetrackFilterStore } from '../../stores/timetrackFilterStore';

interface Props {
  onClose: () => void;
  effortStore?: EffortStore;
  mainStore?: MainStore;
  projectCommentStore?: ProjectCommentStore;
  timetrackFilterStore?: TimetrackFilterStore;
}

const schema = yup.object({
  comment: yup.string(),
  employee_id: yup.number().required(),
  position_id: yup.number().required(),
  date: yup.string().required(),
  value: yup.number().required(),
});

@compose(
  inject('effortStore', 'projectStore', 'mainStore', 'projectCommentStore', 'timetrackFilterStore'),
  observer,
  withMobileDialog()
)
export class TimetrackFormDialog extends React.Component<Props & InjectedProps> {
  public handleSubmit = async (entity: ProjectEffort | ProjectEffortTemplate, formikProps: FormikProps<ProjectEffort>) => {
    const filter = this.props.timetrackFilterStore!.filter;
    const effortStore = this.props.effortStore!;

    if (effortStore.entity && 'employee_id' in entity) {
      await effortStore.put(entity);
    } else if ('employee_ids' in entity) {
      await Promise.all(
        entity.employee_ids.map((e: number) => {
          const newEffort: ProjectEffort = { employee_id: e, ...entity } as ProjectEffort;
          return effortStore.post(newEffort);
        })
      );
    }

    if ('comment' in entity && entity.comment !== '') {
      const newProjectComment: ProjectComment = { ...entity } as ProjectComment;
      await this.props.projectCommentStore!.post(newProjectComment);
      await this.props.projectCommentStore!.fetchFiltered(filter);
    }

    await effortStore.fetchFiltered(filter);
    formikProps.setSubmitting(false);
  };

  public handleClose = (props: FormikProps<ProjectEffort>) => () => {
    if (props.dirty) {
      if (confirm('Änderungen verwerfen?')) {
        this.props.onClose();
      }
    } else {
      this.props.onClose();
    }
  };

  public render() {
    const { fullScreen } = this.props;

    return (
      <Formik
        initialValues={this.props.effortStore!.effort || this.props.effortStore!.effortTemplate!}
        onSubmit={this.handleSubmit}
        validationSchema={schema}
        render={(formikProps: FormikProps<ProjectEffort>) => (
          <Dialog open onClose={this.handleClose(formikProps)} fullScreen={fullScreen}>
            <DialogTitle>Leistung {formikProps.values.id ? 'bearbeiten' : 'erfassen'}</DialogTitle>

            <DialogContent>
              {!formikProps.values.id && <Field portal isMulti component={EmployeeSelector} name={'employee_ids'} label={'Mitarbeiter'} />}
              {formikProps.values.id && <Field portal component={EmployeeSelector} name={'employee_id'} label={'Mitarbeiter'} />}
              <Field portal component={ProjectSelector} name={'project_id'} label={'Projekt'} />
              <Field portal formProps={formikProps} component={ProjectPositionSelector} name={'position_id'} label={'Aktivität'} />
              <Field component={DatePicker} name={'date'} label={'Datum'} fullWidth />
              {formikProps.values.project_id && formikProps.values.position_id && (
                <>
                  <Field component={EffortValueField} name={'value'} label={'Wert'} fullWidth />
                  {!formikProps.values.id && (
                    <Field
                      delayed
                      fullWidth
                      multiline
                      component={TextField}
                      name={'comment'}
                      label={'Kommentar zu Projekt und Tag'}
                      margin={'none'}
                    />
                  )}
                </>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={this.handleClose(formikProps)}>Abbruch</Button>
              <Button
                onClick={async () => {
                  await this.handleSubmit(formikProps.values, formikProps);
                  this.props.effortStore!.editing = false;
                }}
                disabled={formikProps.isSubmitting}
              >
                Speichern
              </Button>
              {!formikProps.values.id && (
                <Button onClick={() => this.handleSubmit(formikProps.values, formikProps)} disabled={formikProps.isSubmitting}>
                  Speichern und weiter
                </Button>
              )}
            </DialogActions>
          </Dialog>
        )}
      />
    );
  }
}
