import Colouors from './Colouors';

/** @description Colours for the lovers of british spelling. */
export default class Colours extends Colouors {
  readonly id = 'colours';

  /** @description Written as 7 in paint files and term.blit, has a default terminal colour of #4C4C4C. */
  readonly grey = 0x80;
  /** @description Written as 8 in paint files and term.blit, has a default terminal colour of #999999. */
  readonly lightGrey = 0x100;
}
