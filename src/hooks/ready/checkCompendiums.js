import logger from '../../logger.js';

let sanitize = (text) => {
  if (text && typeof text === "string") {
    return text.replace(/\s/g, '-').toLowerCase();
  }
  return text;
};

let createIfNotExists = async (settingName, compendiumType, compendiumLabel) => {
  const compendiumName = game.settings.get("ddb-importer", settingName);
  const compendium = await game.packs.find((pack) => pack.collection === compendiumName);
  const sanitizedLabel = sanitize(compendiumLabel);
  if (compendium) {
    logger.info(`Compendium '${compendiumName}' found, will not create compendium.`);
    return false;
  } else {
    logger.info(`Compendium '${compendiumName}' was not found, creating it now.`);
    // create a compendium for the user
    await Compendium.create({
      entity: compendiumType,
      label: `DDB ${compendiumLabel}`,
      name: `ddb-${game.world.name}-${sanitizedLabel}`,
      package: "world"
    });
    await game.settings.set("ddb-importer", settingName, `world.ddb-${game.world.name}-${sanitizedLabel}`);
    return true;
  }
};


export default async function () {
  const autoCreate = game.settings.get("ddb-importer", "auto-create-compendium");

  if (autoCreate) {
    let results = await Promise.allSettled([
      createIfNotExists("entity-spell-compendium", "Item", "Spells"),
      createIfNotExists("entity-item-compendium", "Item", "Items"),
      createIfNotExists("entity-feature-compendium", "Item", "Features"),
      createIfNotExists("entity-monster-compendium", "Actor", "Monsters"),
      // createIfNotExists("entity-monster-feature-compendium", "Item", "Monster Features")
    ]);

    if (results.some((result) => result.value)) location.reload();
  }

}
