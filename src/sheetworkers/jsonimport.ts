function clearExistingRows(name: string) {
  getSectionIDs(`repeating_${name}`, function (idarray) {
    for (let id of idarray) {
      removeRepeatingRow(`repeating_${name}_${id}`)
    }
  })
}

function sanitizeCopyableText(text: string): string {
  const lines = (text || '').split('\n')
  // Remove the name (assumed to be the first line)
  lines.splice(0, 1)
  // Trim leading whitespace and rejoin
  return lines.map((line) => line.trim()).join('\n')
}

on('clicked:jsonimport', function () {
  getAttrs(['jsonimport'], (v) => {
    const character = JSON.parse(v['jsonimport'])

    clearExistingRows('bonds')
    clearExistingRows('inventory')
    clearExistingRows('powers')
    clearExistingRows('skills')

    const O: AttributeBundle = {}

    // Take us back to page 1 when import finishes
    O['sheetTab'] = 'page1'

    // Clear the import field
    O['jsonimport'] = ''

    // Profile
    // O['character_name'] = character.name
    O['homeland'] = character.homeland.name
    // O['pronouns'] = character.pronouns
    O['class'] = character.class.name
    O['calling'] = character.calling.name
    O['role'] = character.calling.role

    // Bonds
    O[`repeating_bonds_${generateRowID()}_bondname`] = '(write a new bond)'

    // Weapon
    O['weapon_name'] = character.weapon.weaponName
    O['weapon_desc'] = sanitizeCopyableText(character.weapon.copyableWeaponText)
    O['weapon_auto_attack'] = `${character.calling.benefits.baseDamage}`
    O['weapon_core_damage'] = `${
      character.calling.benefits.baseDamage + character.weapon.finalDamageBonus
    }`
    O['weapon_range'] = character.weapon.finalRange
    O['weapon_dice'] = character.weapon.finalWeaponDice

    // Armor
    O['armor_name'] = character.armor.outfitName
    O['armor_desc'] = sanitizeCopyableText(character.armor.copyableOutfitText)
    O['armor_dodge'] = `${
      character.calling.benefits.baseDodge +
      character.armor.finalDefenseBonus +
      character.armor.dodgeBonus
    }`
    O['armor_ward'] = `${
      character.calling.benefits.baseWard +
      character.armor.finalDefenseBonus +
      character.armor.wardBonus
    }`

    // Soak
    O['soak_physical'] = `${
      character.armor.finalSoakBonus + character.armor.physicalSoak
    }`
    O['soak_astral'] = `${
      character.armor.finalSoakBonus + character.armor.astralSoak
    }`
    O['soak_umbral'] = `${
      character.armor.finalSoakBonus + character.armor.umbralSoak
    }`
    O['soak_toxic'] = `${
      character.armor.finalSoakBonus + character.armor.toxicSoak
    }`

    // HP, AHP, Recovery, RB
    O['hp'] = character.calling.benefits.baseHp
    O['hp_max'] = character.calling.benefits.baseHp
    O['armor_hp'] = `${character.armor.finalArmorHP}`
    O['armor_hp_max'] = `${character.armor.finalArmorHP}`
    O['recovery'] = character.calling.benefits.recovery
    O['recovery_max'] = character.calling.benefits.recovery
    O['rb'] = `${Math.ceil(character.calling.benefits.baseHp / 4)}`

    // Skills
    for (let skill of character.skills) {
      const row = generateRowID()
      O[`repeating_skills_${row}_skillname`] = skill.skill
      O[`repeating_skills_${row}_skillrank`] = skill.effectiveRank
    }

    // Traits
    O['trait_background'] = character.traits.background
    O['trait_physical'] = character.traits.physical
    O['trait_mental'] = character.traits.mental
    O['trait_special'] = character.traits.special

    // Inventory
    O['ip'] = `${character.armor.finalInventoryPoints}`
    O['ip_max'] = `${character.armor.finalInventoryPoints}`

    // Aether Current
    O['aether_current'] = character.class.aetherCurrentRules.join('\n')
    O['unlock_ac5'] = character.features.fifthAetherCurrentDie ? 'on' : '0'

    // Powers
    for (let power of character.powers) {
      const description: string = power.description.join('')
      if (power.type == 'Invocation') {
        // Split description into Astral and Umbral invocations
        const splitPoint = description.indexOf('> Umbral Power')
        if (splitPoint > -1) {
          const regex = /^> (Astral|Umbral) Power - ([^\n]+)\n+/m
          for (let subpower of [
            description.substring(0, splitPoint - 1),
            description.substring(splitPoint),
          ]) {
            const matchData = subpower.match(regex)
            if (matchData) {
              const powername = matchData[2]
              const remaining = (matchData.input || '').replace(
                matchData[0],
                ''
              )
              const row = generateRowID()
              O[
                `repeating_powers_${row}_powername`
              ] = `${power.name} - ${powername}`
              O[
                `repeating_powers_${row}_powertype`
              ] = `${matchData[1]} ${power.type}`
              O[`repeating_powers_${row}_powerdesc`] = remaining
              O[`repeating_powers_${row}_readonly`] = 'on'
            }
          }
        } else {
          // We couldn't find the expected split point, add the power as-is
          const row = generateRowID()
          O[`repeating_powers_${row}_powername`] = power.name
          O[`repeating_powers_${row}_powertype`] = power.type
          O[`repeating_powers_${row}_powerdesc`] = description
          O[`repeating_powers_${row}_readonly`] = 'on'
        }
      } else {
        const row = generateRowID()
        O[`repeating_powers_${row}_powername`] = power.name
        O[`repeating_powers_${row}_powertype`] = power.type
        O[`repeating_powers_${row}_powerdesc`] = description
        O[`repeating_powers_${row}_readonly`] = 'on'
      }
    }

    setAttrs(O)
  })
})
