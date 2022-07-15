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
export type Coordinate = { x: number; y: number; z: number };
