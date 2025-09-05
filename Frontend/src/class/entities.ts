import { FlagBoolean } from "@app/types/enums";

export class BaseEntity<TKey extends string | number> {
  id!: TKey;
}

export class Product extends BaseEntity<number> {
  name!: string;
  description!: string;
  price!: number;
  createdAt!: Date;
  updatedAt!: Date;
  flagDel!: FlagBoolean;
};