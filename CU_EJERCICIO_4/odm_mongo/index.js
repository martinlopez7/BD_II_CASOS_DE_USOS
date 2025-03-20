import mongoose from 'mongoose';
import { getdata } from './api.js';

const { Schema, model } = mongoose;
const uri = 'mongodb://127.0.0.1:27017/CU_EJERCICIO_4';

// Opciones de conexión
const options = {
  autoIndex: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};

mongoose.connect(uri, options).then(
  () => console.log('Se ha conectado exitosamente'),
  err => console.log('No se ha podido conectar', err)
);

// Definición de esquemas
const objectSchema = new Schema({
  object_mongodb: {
    building: { type: String },
    capacity: { type: Number },
    room_number: { type: Number }
  }
});

const jsonSchema = new Schema({
  json: [{
    object_mongodb: {
      building: { type: String },
      capacity: { type: Number },
      room_number: { type: Number }
    }
  }]
});

// Creación de modelos
const ObjectMdb = model('object', objectSchema);
const Json = model('json', jsonSchema);

// Función principal
async function main() {
  try {
    const data = await getdata();

    data.json = data.json.map(item => {
      try {
        return {
          object_mongodb: JSON.parse(item.object_mongodb)
        };
      } catch (error) {
        console.error('Error parseando JSON:', error, 'Datos:', item);
        return null;
      }
    }).filter(item => item !== null);

    console.log('Datos obtenidos:', data.json);

    // Inserción en la base de datos
    await ObjectMdb.insertMany(data.json);
    await Json.create({ json: data.json });

    console.log('Datos insertados correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error en main:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
main();
