import * as Blockly from 'blockly';
import { Order } from '../../java.js';
import { findClickParams } from './gui_utils.js';

export default {
  block: 'gui_click_get',
  generator: function(block: Blockly.Block) {
    const params = findClickParams(block);
    if (!params) {
      // Not inside a click action, there is nothing to read from.
      return ['null', Order.ATOMIC];
    }

    switch (block.getFieldValue('VALUE')) {
      case 'GUI': return [params.gui, Order.ATOMIC];
      case 'SLOT': return [params.slot, Order.ATOMIC];
      case 'ITEM': return [`${params.event}.getCurrentItem()`, Order.ATOMIC];
      case 'LEFT': return [`${params.event}.isLeftClick()`, Order.ATOMIC];
      case 'RIGHT': return [`${params.event}.isRightClick()`, Order.ATOMIC];
      case 'SHIFT': return [`${params.event}.isShiftClick()`, Order.ATOMIC];
      default: return [params.player, Order.ATOMIC];
    }
  },
};
