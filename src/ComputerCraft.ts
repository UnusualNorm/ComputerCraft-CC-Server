export type CommonType =
  | string
  | number
  | { [x: string]: CommonType }
  | CommonType[]
  | boolean
  | null;
export type Side = 'top' | 'bottom' | 'left' | 'right' | 'front' | 'back';

// TODO: Determine all available states and tags...
export type BlockInfo = {
  state: Record<string, boolean>;
  name: string;
  tags: Record<string, boolean>;
};

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
