/// <reference path="sheet.d.ts" />

// Documentation: https://wiki.roll20.net/Sheet_Worker_Scripts

on(
  'change:repeating_cards:name_front change:repeating_cards:name_back',
  (event) => {
    const attributeName = event.sourceAttribute || ''
    const fieldToSearch = attributeName.endsWith('name_front')
      ? 'name_front'
      : 'name_back'
    const newValue = (event.newValue || '').toUpperCase()

    if (newValue.length > 2) {
      const matchingCard = CONSTELLATION_CARDS.find(
        (card) => card[fieldToSearch].toUpperCase() == newValue
      )

      if (matchingCard) {
        console.dir(matchingCard)
        getAttrs(
          [
            'repeating_cards_name_front',
            'repeating_cards_name_back',
            'repeating_cards_desc_front',
            'repeating_cards_desc_back',
          ],
          (attrs) => {
            console.dir(attrs)
            attrs['repeating_cards_name_front'] ||= matchingCard['name_front']
            attrs['repeating_cards_name_back'] ||= matchingCard['name_back']
            attrs['repeating_cards_desc_front'] ||= matchingCard['desc_front']
            attrs['repeating_cards_desc_back'] ||= matchingCard['desc_back']
            setAttrs(attrs)
          }
        )
      }
    }
  }
)
