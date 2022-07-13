export type CommonTypes =
  | string
  | number
  | { [x: string]: CommonTypes }
  | CommonTypes[]
  | boolean
  | null;
export type Side = 'top' | 'bottom' | 'left' | 'right' | 'front' | 'back';

// TODO: Create block info type
export type BlockInfo = Record<string, CommonTypes>;
