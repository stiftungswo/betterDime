import * as React from 'react';
import { Fragment } from 'react';
import { Employee } from '../../types';
import * as yup from 'yup';
import { Field, FormikProps } from 'formik';
import { EmailField, NumberField, PasswordField, SwitchField, TextField } from '../../form/fields/common';
import Grid from '@material-ui/core/Grid/Grid';
import { hasContent } from '../../layout/DimeLayout';
import { FormView, FormViewProps } from '../../form/FormView';
import { FormHeader } from '../../layout/FormHeader';

export interface Props extends FormViewProps<Employee> {
  employee: Employee | undefined;
}

const employeeSchema = yup.object({
  archived: yup.boolean(),
  can_login: yup.boolean().required(),
  email: yup.string().required(),
  holidays_per_year: yup.number().required(),
  is_admin: yup.boolean().required(),
  first_name: yup.string().required(),
  last_name: yup.string().required(),
  password: yup.string(),
  password_repeat: yup.string().oneOf([yup.ref('password'), null], 'Passwort muss mit neuem Passwort übereinstimmen.'),
});

export default class EmployeeForm extends React.Component<Props> {
  public render() {
    const { employee } = this.props;

    return (
      <FormView
        title={this.props.title}
        validationSchema={employeeSchema}
        loading={!hasContent(employee) || this.props.loading}
        initialValues={{ ...employee, password: '', password_repeat: '' }}
        onSubmit={this.props.onSubmit}
        submitted={this.props.submitted}
        render={(
          props: FormikProps<any> // tslint:disable-line
        ) => (
          <Fragment>
            <FormHeader> Allgemeine Informationen </FormHeader>
            <form onSubmit={props.handleSubmit}>
              <Grid container={true} spacing={16}>
                <Grid item={true} xs={12} sm={6}>
                  <Field component={TextField} name={'first_name'} label={'Vorname'} fullWidth={true} />
                </Grid>
                <Grid item={true} xs={12} sm={6}>
                  <Field component={TextField} name={'last_name'} label={'Nachname'} fullWidth={true} />
                </Grid>
              </Grid>

              <Grid container={true}>
                <Grid item={true} xs={12}>
                  <Field component={EmailField} name={'email'} label={'E-Mail'} fullWidth={true} />
                </Grid>
              </Grid>

              <Grid container={true} spacing={16}>
                <Grid item={true} xs={12} sm={6}>
                  <Field component={PasswordField} name={'password'} label={'Neues Passwort'} fullWidth={true} />
                </Grid>
                <Grid item={true} xs={12} sm={6}>
                  <Field component={PasswordField} name={'password_repeat'} label={'Neues Passwort wiederholen'} fullWidth={true} />
                </Grid>
              </Grid>

              <br />

              <FormHeader> Benutzereinstellungen </FormHeader>

              <Grid container={true} spacing={16}>
                <Grid item={true} xs={12} sm={6}>
                  <Field component={NumberField} name={'holidays_per_year'} label={'Ferientage pro Jahr'} fullWidth={true} />
                </Grid>
              </Grid>

              <Grid container={true} spacing={8}>
                <Grid item={true} xs={12}>
                  <Field component={SwitchField} name={'can_login'} label={'Login aktiviert?'} fullWidth={true} />
                </Grid>
                <Grid item={true} xs={12}>
                  <Field component={SwitchField} name={'archived'} label={'Benutzer archiviert?'} fullWidth={true} />
                </Grid>
                <Grid item={true} xs={12}>
                  <Field component={SwitchField} name={'is_admin'} label={'Benutzer hat Administratorrecht?'} fullWidth={true} />
                </Grid>
              </Grid>
            </form>
          </Fragment>
        )}
      />
    );
  }
}