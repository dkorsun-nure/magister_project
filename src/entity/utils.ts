import {
  CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, BaseEntity,
} from 'typeorm';

export interface IDefaultData {
  id: number,
  createdAt: Date,
  updatedAt: Date,
}

export abstract class DefaultEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;
}
