//tslint:disable:no-console
import { action, observable } from 'mobx';
import { AbstractStore } from './abstractStore';
import { ProjectEffort } from '../types';

export interface CustomerImportSettings {
  customer_tags: number[];
  hidden: boolean;
  rate_group_id: number;
}

export interface NonPersistedImportCustomer {
  city: string | null;
  comment: string | null;
  name: string | null;
  country: string | null;
  department: string | null;
  duplicate: boolean;
  email: string | null;
  fax: string | null;
  first_name: string | null;
  invalid: boolean;
  main_number: string | null;
  mobile_number: string | null;
  last_name: string | null;
  postcode: number | null;
  type: string;
  salutation: string | null;
  street: string;
  supplement: string | null;
}

export class CustomerImportStore extends AbstractStore<NonPersistedImportCustomer> {
  @observable
  public customersToImport?: NonPersistedImportCustomer[] = [];

  @observable
  public importSettings?: CustomerImportSettings = {
    customer_tags: [],
    hidden: false,
    rate_group_id: 1,
  };

  @observable
  public importIsLoading?: boolean = false;

  @action
  public async verifyImportFile(file: File, name: string) {
    try {
      this.importIsLoading = true;
      this.displayInProgress();
      const fileAsBlob = new Blob([file], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const formData = new FormData();
      formData.append('importFile', fileAsBlob, name);

      const res = await this.mainStore!.api.post<NonPersistedImportCustomer[]>('customers/import/verify', formData);
      this.customersToImport = res.data;
      this.mainStore.displaySuccess('Kundenimport wurde erfolgreich überprüft.');
      this.importIsLoading = false;
    } catch (e) {
      this.importIsLoading = false;
      this.mainStore.displayError('Kundenimport konnte nicht überprüft werden.');
      console.log(e);
      throw e;
    }
  }

  @action
  public async doImport(importSettings: CustomerImportSettings | undefined) {
    try {
      this.displayInProgress();
      this.importIsLoading = true;
      await this.mainStore.api.post('/customers/import', { customers_to_import: this.customersToImport, ...importSettings });
      this.customersToImport = [];
      this.importIsLoading = false;
      this.mainStore.displaySuccess('Der Import wurde erfolgreich durchgeführt!');
    } catch (e) {
      this.importIsLoading = false;
      this.mainStore.displayError('Der Import konnte nicht abgeschlossen werden.');
      console.error(e);
      throw e;
    }
  }
}
