import { BlockInfo, DetailedItemInfo, ItemInfo } from '../ComputerCraft';
import { Global } from './Base';
type TurtleOutput = [boolean, string | null];
type ToolSide = 'left' | 'right';

const toTurtleOutput = (out: [boolean, string | null]) => out;

export class Turtle extends Global {
  readonly id = 'turtle';

  async forward(): Promise<TurtleOutput> {
    return this.computer.run('turtle.forward').then(toTurtleOutput);
  }

  async back(): Promise<TurtleOutput> {
    return this.computer.run('turtle.back').then(toTurtleOutput);
  }

  async up(): Promise<TurtleOutput> {
    return this.computer.run('turtle.up').then(toTurtleOutput);
  }

  async down(): Promise<TurtleOutput> {
    return this.computer.run('turtle.down').then(toTurtleOutput);
  }

  async turnLeft(): Promise<TurtleOutput> {
    return this.computer.run('turtle.turnLeft').then(toTurtleOutput);
  }

  async turnRight(): Promise<TurtleOutput> {
    return this.computer.run('turtle.turnRight').then(toTurtleOutput);
  }

  async dig(side?: ToolSide): Promise<TurtleOutput> {
    return this.computer.run('turtle.dig', side).then(toTurtleOutput);
  }

  async digUp(side?: ToolSide): Promise<TurtleOutput> {
    return this.computer.run('turtle.digUp', side).then(toTurtleOutput);
  }

  async digDown(side?: ToolSide): Promise<TurtleOutput> {
    return this.computer.run('turtle.digDown', side).then(toTurtleOutput);
  }

  async place(text?: string): Promise<TurtleOutput> {
    return this.computer.run('turtle.place', text).then(toTurtleOutput);
  }

  async placeUp(text?: string): Promise<TurtleOutput> {
    return this.computer.run('turtle.placeUp', text).then(toTurtleOutput);
  }

  async placeDown(text?: string): Promise<TurtleOutput> {
    return this.computer.run('turtle.placeDown', text).then(toTurtleOutput);
  }

  async drop(count?: number): Promise<TurtleOutput> {
    return this.computer.run('turtle.drop', count).then(toTurtleOutput);
  }

  async dropUp(count?: number): Promise<TurtleOutput> {
    return this.computer.run('turtle.dropUp', count).then(toTurtleOutput);
  }

  async dropDown(count?: number): Promise<TurtleOutput> {
    return this.computer.run('turtle.dropDown', count).then(toTurtleOutput);
  }

  async select(slot: number): Promise<true> {
    return this.computer
      .run('turtle.select', slot)
      .then((out: [true]) => out[0]);
  }

  async getItemCount(slot?: number): Promise<number> {
    return this.computer
      .run('turtle.getItemCount', slot)
      .then((out: [number]) => out[0]);
  }

  async getItemSpace(slot?: number): Promise<number> {
    return this.computer
      .run('turtle.getItemSpace', slot)
      .then((out: [number]) => out[0]);
  }

  async detect(): Promise<boolean> {
    return this.computer.run('turtle.detect').then((out: [boolean]) => out[0]);
  }

  async detectUp(): Promise<boolean> {
    return this.computer
      .run('turtle.detectUp')
      .then((out: [boolean]) => out[0]);
  }

  async detectDown(): Promise<boolean> {
    return this.computer
      .run('turtle.detectDown')
      .then((out: [boolean]) => out[0]);
  }

  async compare(): Promise<boolean> {
    return this.computer.run('turtle.compare').then((out: [boolean]) => out[0]);
  }

  async compareUp(): Promise<boolean> {
    return this.computer
      .run('turtle.compareUp')
      .then((out: [boolean]) => out[0]);
  }

  async compareDown(): Promise<boolean> {
    return this.computer
      .run('turtle.compareDown')
      .then((out: [boolean]) => out[0]);
  }

  async attack(side?: ToolSide): Promise<TurtleOutput> {
    return this.computer.run('turtle.attack', side).then(toTurtleOutput);
  }

  async attackUp(side?: ToolSide): Promise<TurtleOutput> {
    return this.computer.run('turtle.attackUp', side).then(toTurtleOutput);
  }

  async attackDown(side?: ToolSide): Promise<TurtleOutput> {
    return this.computer.run('turtle.attackDown', side).then(toTurtleOutput);
  }

  async suck(count?: number): Promise<TurtleOutput> {
    return this.computer.run('turtle.suck', count).then(toTurtleOutput);
  }

  async suckUp(count?: number): Promise<TurtleOutput> {
    return this.computer.run('turtle.suckUp', count).then(toTurtleOutput);
  }

  async suckDown(count?: number): Promise<TurtleOutput> {
    return this.computer.run('turtle.suckDown', count).then(toTurtleOutput);
  }

  async getFuelLevel(): Promise<number | 'unlimited'> {
    return this.computer
      .run('turtle.getFuelLevel')
      .then((out: [number | 'unlimited']) => out[0]);
  }

  async refuel(count?: number): Promise<TurtleOutput> {
    return this.computer.run('turtle.refuel', count).then(toTurtleOutput);
  }

  async compareTo(slot: number): Promise<boolean> {
    return this.computer
      .run('turtle.compareTo', slot)
      .then((out: [boolean]) => out[0]);
  }

  async transferTo(slot: number, count?: number): Promise<boolean> {
    return this.computer
      .run('turtle.transferTo', slot, count)
      .then((out: [boolean]) => out[0]);
  }

  async getSelectedSlot(): Promise<number> {
    return this.computer
      .run('turtle.getSelectedSlot')
      .then((out: [number]) => out[0]);
  }

  async getFuelLimit(): Promise<number> {
    return this.computer
      .run('turtle.getFuelLimit')
      .then((out: [number]) => out[0]);
  }

  async equipLeft(): Promise<TurtleOutput> {
    return this.computer.run('turtle.equipLeft').then(toTurtleOutput);
  }

  async equipRight(): Promise<TurtleOutput> {
    return this.computer.run('turtle.equipRight').then(toTurtleOutput);
  }

  async inspect(): Promise<[true, BlockInfo] | [false, string]> {
    return this.computer
      .run('turtle.inspect')
      .then((out: [true, BlockInfo] | [false, string]) => out);
  }

  async inspectUp(): Promise<[true, BlockInfo] | [false, string]> {
    return this.computer
      .run('turtle.inspectUp')
      .then((out: [true, BlockInfo] | [false, string]) => out);
  }

  async inspectDown(): Promise<[true, BlockInfo] | [false, string]> {
    return this.computer
      .run('turtle.inspectDown')
      .then((out: [true, BlockInfo] | [false, string]) => out);
  }

  getItemDetail(slot?: number): Promise<ItemInfo>;
  getItemDetail(slot: number, detailed: true): Promise<DetailedItemInfo>;
  async getItemDetail(
    slot?: number,
    detailed?: boolean
  ): Promise<ItemInfo | DetailedItemInfo> {
    return this.computer
      .run('turtle.getItemDetail', slot, detailed)
      .then((out: [ItemInfo | DetailedItemInfo]) => out[0]);
  }

  async craft(limit = 64): Promise<TurtleOutput> {
    return this.computer.run('turtle.craft', limit).then(toTurtleOutput);
  }

  /**
   * @deprecated Historically this table behaved differently to the main turtle API, but this is no longer the base. You should not need to use it.
   * @description The builtin turtle API, without any generated helper functions.
   */
  native: null;
}
