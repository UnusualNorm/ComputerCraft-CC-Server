export type CommonType =
  | string
  | number
  | { [x: string]: CommonType }
  | CommonType[]
  | boolean
  | null;
export type Side = 'top' | 'bottom' | 'left' | 'right' | 'front' | 'back';

// TODO: Create block info type
export type BlockInfo = Record<string, CommonType>;
export type ItemInfo = {
  name: string;
  count: number;
  nbt: string | null;
};
// TODO: Fill this type out in more detail
export type DetailedItemInfo = ItemInfo & {
  displayName: string;
  itemGroups: string[];
  damage: number;
  maxDamage: number;
  durability: number;
};

export type Coordinate = { x: number; y: number; z: number };
