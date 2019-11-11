import * as _ from 'lodash';
import { computed, observable } from 'mobx';
import { Invoice, PaginatedProjectListing, PaginationInfo, Project, ProjectListing } from '../types';
import {AbstractPaginatedStore} from './abstractPaginatedStore';
import { MainStore } from './mainStore';

export interface ProjectWithPotentialInvoices {
  id: number;
  name: string;
  last_effort_date: string;
  last_invoice_date: string | null;
  days_since_last_invoice: number | null;
}

export class ProjectStore extends AbstractPaginatedStore<Project, ProjectListing> {
  protected get entityName(): { singular: string; plural: string } {
    return {
      singular: 'Das Projekt',
      plural: 'Die Projekte',
    };
  }

  @computed
  get entity(): Project | undefined {
    return this.project;
  }

  set entity(project: Project | undefined) {
    this.project = project;
  }

  @computed
  get entities(): ProjectListing[] {
    return this.projects;
  }

  @observable
  projects: ProjectListing[] = [];
  @observable
  project?: Project = undefined;
  @observable
  projectsWithPotentialInvoices: ProjectWithPotentialInvoices[];

  constructor(mainStore: MainStore) {
    super(mainStore);
  }

  filter = (p: ProjectListing) => {
    return [String(p.id), p.name, p.description || ''].some(s => s.toLowerCase().includes(this.searchQuery));
  }

  async createInvoice(id: number): Promise<Invoice> {
    try {
      this.displayInProgress();
      const res = await this.mainStore.api.post<Invoice>(`/projects/${id}/create_invoice`);
      this.mainStore.displaySuccess('Die Rechnung wurde erstellt');
      return res.data;
    } catch (e) {
      this.mainStore.displayError('Beim erstellen der Rechnung ist ein Fehler aufgetreten');
      throw e;
    }
  }

  async fetchProjectsWithOpenInvoices(): Promise<void> {
    try {
      const res = await this.mainStore.api.get<ProjectWithPotentialInvoices[]>('/projects/potential_invoices');
      this.projectsWithPotentialInvoices = res.data;
    } catch (e) {
      this.mainStore.displayError('Die Projekte konnten nicht geladen werden.');
      throw e;
    }
  }

  protected async doArchive(id: number, archived: boolean) {
    await this.mainStore.api.put('/projects/' + id + '/archive', { archived });
    this.doFetchAll();
  }

  protected async doDelete(id: number) {
    await this.mainStore.api.delete('/projects/' + id);
    await this.doFetchAll();
  }

  protected async doDuplicate(id: number) {
    return this.mainStore.api.post<Project>('/projects/' + id + '/duplicate');
  }

  protected async doFetchAll(): Promise<void> {
    const res = await this.mainStore.api.get<ProjectListing[]>('/projects');
    this.projects = res.data;
  }

  protected async doFetchAllPaginated(): Promise<void> {
    const paginationQuery = '?page=' + this.requestedPage + '&pageSize=' + this.requestedPageSize;
    const res = await this.mainStore.api.get<PaginatedProjectListing>('/projects' + paginationQuery);
    const page = res.data;
    this.projects = page.data;
    this.pageInfo = _.omit(page, 'data');
  }

  protected async doFetchOne(id: number) {
    const res = await this.mainStore.api.get<Project>('/projects/' + id);
    this.project = res.data;
  }

  protected async doPost(entity: Project): Promise<void> {
    const res = await this.mainStore.api.post<Project>('/projects', entity);
    this.project = res.data;
  }

  protected async doPut(entity: Project): Promise<void> {
    const res = await this.mainStore.api.put<Project>('/projects/' + entity.id, entity);
    this.project = res.data;
  }
}
