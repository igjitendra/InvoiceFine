export interface ReadRepository<TEntity> {
  getById(id: string): Promise<TEntity | null>;
  list(): Promise<readonly TEntity[]>;
}

export interface CreateRepository<TCreateInput> {
  create(input: TCreateInput): Promise<string>;
}

export interface UpdateRepository<TUpdateInput> {
  update(id: string, input: TUpdateInput): Promise<void>;
}

export type Repository<TEntity, TCreateInput, TUpdateInput> =
  ReadRepository<TEntity> &
  CreateRepository<TCreateInput> &
  UpdateRepository<TUpdateInput>;
