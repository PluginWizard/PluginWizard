// Import all toolbox category JSON files
import logicCategory from './toolbox/logic.json'
import mathCategory from './toolbox/math.json'
import textCategory from './toolbox/text.json'
import variablesCategory from './toolbox/variables.json'
import functionsCategory from './toolbox/functions.json'
import separator from './toolbox/separator.json'
import eventsCategory from './toolbox/events.json'
import messagesCategory from './toolbox/messages.json'
import playerCategory from './toolbox/player.json'
import itemsCategory from './toolbox/items.json'
import worldCategory from './toolbox/world.json'
import entitiesCategory from './toolbox/entities.json'
import configCategory from './toolbox/config.json'
import listCategory from './toolbox/lists.json'

// Define the order of categories in the toolbox
const categoryOrder = [
  logicCategory,
  mathCategory,
  textCategory,
  listCategory,
  variablesCategory,
  functionsCategory,

  separator,
  
  eventsCategory,
  messagesCategory,
  playerCategory,
  itemsCategory,
  worldCategory,
  entitiesCategory,
  configCategory
]

export const toolbox = {
  "kind": "categoryToolbox",
  "contents": categoryOrder
}