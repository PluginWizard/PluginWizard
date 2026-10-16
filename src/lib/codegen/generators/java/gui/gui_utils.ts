import * as Blockly from 'blockly';
import { JavaGenerator, indent } from '../../java.js';

/**
 * Names of the lambda parameters of a GUI click action.
 * They are picked through the name database so nested click actions (or one sitting
 * inside an event lambda) never shadow an outer variable, which Java does not allow.
 */
export interface ClickParams {
  player: string;
  gui: string;
  slot: string;
  event: string;
}

const CLICK_ACTION_BLOCKS = new Set(['gui_set_item_click', 'gui_on_click', 'gui_on_other_click']);
const clickParams = new Map<string, ClickParams>();

/**
 * Builds the `(player, gui, slot, event) -> { ... }` lambda of a click action block from its DO input.
 */
export function clickLambda(block: Blockly.Block): string {
  const nameDB = JavaGenerator.nameDB_!;
  const params: ClickParams = {
    player: nameDB.getDistinctName('clicker', Blockly.Names.NameType.VARIABLE),
    gui: nameDB.getDistinctName('clickedGui', Blockly.Names.NameType.VARIABLE),
    slot: nameDB.getDistinctName('clickedSlot', Blockly.Names.NameType.VARIABLE),
    event: nameDB.getDistinctName('clickEvent', Blockly.Names.NameType.VARIABLE),
  };
  // Registered before generating the body so `gui_click_get` blocks inside can look them up.
  clickParams.set(block.id, params);

  const body = JavaGenerator.statementToCode(block, 'DO');
  return `(${params.player}, ${params.gui}, ${params.slot}, ${params.event}) -> {\n${indent(body)}}`;
}

/**
 * Finds the parameters of the click action whose DO input contains this block,
 * or null when the block is not placed inside one.
 */
export function findClickParams(block: Blockly.Block): ClickParams | null {
  let child: Blockly.Block = block;
  let parent = child.getParent();

  while (parent) {
    const connection = (child.outputConnection ?? child.previousConnection)?.targetConnection;
    const isNextStatement = connection === parent.nextConnection;
    const inputName = parent.inputList.find(input => input.connection === connection)?.name;

    if (!isNextStatement && inputName === 'DO' && CLICK_ACTION_BLOCKS.has(parent.type)) {
      return clickParams.get(parent.id) ?? null;
    }

    child = parent;
    parent = child.getParent();
  }
  return null;
}
