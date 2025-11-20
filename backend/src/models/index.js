import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
import Sequelize from 'sequelize';
import databaseConfig from '../config/database.js';

const requireModule = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);

const db = {};

const sequelize =  new Sequelize(databaseConfig)

const modelFiles = fs
  .readdirSync(__dirname)
  .filter(file =>
    file.indexOf('.') !== 0 &&
    file !== basename &&
    (file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.mjs')) &&
    !file.endsWith('.test.js')
  );

for (const file of modelFiles) {
  const fullPath = path.join(__dirname, file);
  let modelFactory;

  if (file.endsWith('.cjs')) {
    modelFactory = requireModule(fullPath);
  } else {
    const modulePath = pathToFileURL(fullPath).href;
    const importedModule = await import(modulePath);
    modelFactory = importedModule.default || importedModule;
  }

  const model = modelFactory(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach(modelName => {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

export { sequelize, Sequelize };
export default {
  ...db,
  sequelize,
  Sequelize
};
