export class BaseEntity {}

export class Product extends BaseEntity {
  id!: number;
  name!: string;
  description!: string;
  price!: number;
  views!: number;
  likes!: number;
  numberAvailable!: number;
  createdAt!: Date;
  updatedAt!: Date;
};