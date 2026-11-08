import * as Blockly from 'blockly';
import { Order, imports } from '../../java.js';
import { enchantmentLevel } from './create_item.js';

/**
 * "create item" reads these blocks itself. On their own (e.g. stored in a
 * variable or list) they become Core's ItemEnchantment values.
 */
export default {
  block: 'item_enchantment',
  generator: function(block: Blockly.Block) {
    const enchantment = block.getFieldValue('ENCHANTMENT');

    imports.add('import org.bukkit.enchantments.Enchantment;');
    imports.add('import net.kalbskinder.helpers.items.ItemEnchantment;');

    return [`ItemEnchantment.of(Enchantment.${enchantment}, ${enchantmentLevel(block)})`, Order.ATOMIC];
  },
};
