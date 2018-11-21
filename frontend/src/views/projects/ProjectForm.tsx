import * as React from 'react';
import * as yup from 'yup';
import { Field, FormikProps } from 'formik';
import { SwitchField, TextField } from '../../form/fields/common';
import Grid from '@material-ui/core/Grid/Grid';
import { DimePaper, hasContent } from '../../layout/DimeLayout';
import { inject, observer } from 'mobx-react';
import { FormView, FormViewProps } from '../../form/FormView';
import compose from '../../utilities/compose';
import { Project } from '../../types';
import { EmployeeSelector } from '../../form/entitySelector/EmployeeSelector';
import { MainStore } from '../../stores/mainStore';
import { AddressSelector } from '../../form/entitySelector/AddressSelector';
import { RateGroupSelector } from '../../form/entitySelector/RateGroupSelector';
import CurrencyField from '../../form/fields/CurrencyField';
import { DatePicker } from '../../form/fields/DatePicker';
import MuiTextField from '@material-ui/core/TextField';
import MuiFormControl from '@material-ui/core/FormControl';
import InputAdornment from '@material-ui/core/InputAdornment/InputAdornment';
import { ProjectCategorySelector } from '../../form/entitySelector/ProjectCategorySelector';
import ProjectPositionSubformInline from './ProjectPositionSubformInline';
import { ProjectStore } from '../../stores/projectStore';
import Navigator from './ProjectNavigator';

interface InfoFieldProps {
  value: string;
  label: string;
  unit?: string;
  error?: boolean;
  fullWidth?: boolean;
}

const InfoField = ({ value, label, unit, error, fullWidth = true }: InfoFieldProps) => (
  <MuiFormControl margin={'normal'} error={error} fullWidth={fullWidth}>
    <MuiTextField
      disabled
      variant={'outlined'}
      value={value}
      label={label}
      InputProps={{
        endAdornment: unit ? <InputAdornment position={'end'}>{unit}</InputAdornment> : undefined,
      }}
      InputLabelProps={{
        shrink: true,
        error,
      }}
    />
  </MuiFormControl>
);

const schema = yup.object({
  name: yup.string().required(),
  accountant_id: yup.number().required(),
  address_id: yup.number().required(),
  description: yup.string().required(),
  chargeable: yup.boolean(),
  archived: yup.boolean(),
  deadline: yup.date().nullable(true),
  category_id: yup.number().required(),
  rate_group_id: yup.number().required(),
  fixed_price: yup.number().nullable(true),
  positions: yup.array(
    yup.object({
      description: yup.string(),
      price_per_rate: yup.number().required(),
      rate_unit_id: yup.number().required(),
    })
  ),
});

export interface Props extends FormViewProps<Project> {
  mainStore?: MainStore;
  projectStore?: ProjectStore;
  project: Project;
}

@compose(
  inject('mainStore', 'projectStore'),
  observer
)
export default class ProjectForm extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
    const { project, mainStore, projectStore } = this.props;

    return (
      <FormView
        paper={false}
        loading={!hasContent(project) || this.props.loading}
        title={this.props.title}
        validationSchema={schema}
        initialValues={project}
        onSubmit={this.props.onSubmit}
        submitted={this.props.submitted}
        render={(
          props: FormikProps<any> // tslint:disable-line
        ) => (
          <form onSubmit={props.handleSubmit}>
            <Grid container spacing={24}>
              <Grid item xs={12} lg={8}>
                {project.id && <Navigator project={project} projectStore={projectStore!} />}
                <DimePaper>
                  <Grid container spacing={24}>
                    <Grid item xs={12}>
                      <Field delayed fullWidth required component={TextField} name={'name'} label={'Name'} />
                    </Grid>
                    <Grid item xs={12} lg={8}>
                      <Field fullWidth required component={AddressSelector} name={'address_id'} label={'Kunde'} />
                    </Grid>
                    <Grid item xs={12} lg={4}>
                      {/*TODO preselect tarif based on selected customer?*/}
                      <Field fullWidth required component={RateGroupSelector} name={'rate_group_id'} label={'Tarif'} />
                    </Grid>

                    <Grid item xs={12} lg={8}>
                      <Field
                        fullWidth
                        required
                        component={EmployeeSelector}
                        name={'accountant_id'}
                        label={'Verantwortlicher Mitarbeiter'}
                      />
                    </Grid>
                    <Grid item xs={12} lg={4}>
                      <Field fullWidth required component={ProjectCategorySelector} name={'category_id'} label={'Tätigkeitsbereich'} />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        delayed
                        fullWidth
                        required
                        component={TextField}
                        multiline
                        rowsMax={14}
                        name={'description'}
                        label={'Beschreibung'}
                      />
                    </Grid>
                    <Grid item xs={12} lg={8}>
                      <Field fullWidth component={DatePicker} name={'deadline'} label={'Deadline'} />
                    </Grid>
                    <Grid item xs={12} lg={8}>
                      <Field delayed fullWidth component={CurrencyField} name={'fixed_price'} label={'Fixpreis'} />
                    </Grid>
                    <Grid item xs={12}>
                      <Field component={SwitchField} name={'chargeable'} label={'Verrechenbar'} />
                    </Grid>
                    <Grid item xs={12}>
                      <Field component={SwitchField} name={'archived'} label={'Archiviert'} />
                    </Grid>
                    {project.id && (
                      <>
                        {/*TODO this design is not so great. Maybe just use a table like Breakdown and be a bit more consistent?*/}
                        <Grid item xs={12} lg={6}>
                          <InfoField
                            fullWidth
                            label={'Verbleibendes Budget'}
                            value={`${mainStore!.formatCurrency(project.current_price, false)} / ${mainStore!.formatCurrency(
                              project.budget_price,
                              false
                            )}`}
                            error={project.current_price > project.budget_price}
                            unit={'CHF'}
                          />
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <InfoField
                            fullWidth
                            label={'Verbleibende Zeit'}
                            value={`${mainStore!.formatDuration(project.current_time, 'h', false)} / ${mainStore!.formatDuration(
                              project.budget_time,
                              'h',
                              false
                            )}`}
                            error={project.current_time > project.budget_time}
                            unit={'h'}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </DimePaper>
              </Grid>

              <Grid item xs={12}>
                <DimePaper>
                  <ProjectPositionSubformInline formikProps={props} name={'positions'} />
                </DimePaper>
              </Grid>
            </Grid>
          </form>
        )}
      />
    );
  }
}
