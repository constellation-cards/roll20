import fs from 'fs'
import path from 'path'

const decks = require('./data/decks.json')
const stacks = require('./data/stacks.json')
const cards = require('./data/cards.json')
const faces = require('./data/faces.json')

import { append, assoc, isEmpty, isNil, join, map, reduce } from 'ramda'

const STACK_TO_EMOJI: Record<string, string[]> = {
  'Core Rules': ['📗'],
  'Core Rules (Agenda)': ['📘'],
  'Core Rules (Crisis)': ['📕'],
  'Character (Focus)': ['🛠️'],
  'Character (Role)': ['🧭'],
  'Character (Upbringing)': ['🧑'],
  Condition: ['💀'],
  Encounter: ['👹'],
  'Success Oracle': ['❓'],
  'Emotion Oracle': ['❤️'],
  'City (Dynamic)': ['🚌'],
  'City (Neighborhood)': ['🏙️'],
}

function convertArrayToMap(records: any[]): Record<string, any> {
  return reduce(
    (map, record) => assoc(record['id'], record, map),
    {} as Record<string, any>,
    records
  )
}

function describeCard(face: any): string {
  let text: string[] = []
  if (!isNil(face.description) && !isEmpty(face.description)) {
    text = append(face.description, text)
  }
  if (!isNil(face.prompts) && !isEmpty(face.prompts)) {
    const prompts = map((prompt) => `- ${prompt}\n`, face.prompts)
    text = append(join('', prompts), text)
  }
  if (!isNil(face.rule) && !isEmpty(face.rule)) {
    text = append(face.rule, text)
  }
  return join('\n', text)
}

const decksMap = convertArrayToMap(decks)
const stacksMap = convertArrayToMap(stacks)
const facesMap = convertArrayToMap(faces)

function toHtmlEntities(s: string): string {
  return s.replace(/\p{Emoji}/gmu, (s) => '&#' + s.codePointAt(0) + ';')
}

// Convert a single card record (from cards.json)
// into something our character sheet can use.
function convertOneCard(card: any): any {
  const deck = decksMap[card.deckId]
  const stack = stacksMap[card.stackId]
  const front = facesMap[card.frontId]
  const back = facesMap[card.backId]

  return {
    deck: deck.name,
    stack: stack.name,
    name: front.name == back.name ? front.name : `${front.name}/${back.name}`,
    name_front: front.name,
    name_back: back.name,
    desc_front: describeCard(front),
    desc_back: describeCard(back),
    emoji: join('', map(toHtmlEntities, STACK_TO_EMOJI[stack.name])),
  }
}

const convertedCards = map(convertOneCard, cards)

fs.writeFileSync(
  path.join(__dirname, 'src', 'constellation-cards.json'),
  JSON.stringify(convertedCards, null, 2)
)
