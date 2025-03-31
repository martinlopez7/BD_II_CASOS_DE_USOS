import mongoose from 'mongoose';
import { getdata } from './api.js';

const { Schema, model } = mongoose;
const uri = 'mongodb://127.0.0.1:27017/Temario_3';

// Opciones de conexión
const options = {
  autoIndex: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};

mongoose.connect(uri, options).then(
  () => console.log('Se ha conectado exitosamente'),
  err => console.log('No se ha podido conectar', err)
);


let registro = {
  alumno: [{
     s_id: 1,
     name: 'Martín',
     last_name: 'López de Novales Gurruchaga',
     dni: '72306262N'
  }]
};

// Definición de esquemas

const alumnoSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String },
  last_name: { type: String },
  dni: { type: String }
});

const naturalJoinSchema = new Schema({
  course_id: { type: String },
  title: { type: String },
  dept_name: { type: String },
  credits: { type: Number },
  ID:{type: Number},
  sec_id:{type: Number},
  semester:{ type: String },
  year:{type: Number}

});

const naturalJoin2Schema = new Schema({
  course_id: { type: String, index: true },
  title: { type: String },
  dept_name: { type: String },
  credits: { type: Number },
  ID:{type: Number},
  sec_id:{type: Number},
  semester:{ type: String },
  year:{type: Date, default: Date.now}

});

const objectsBasicsSchema = new Schema({
  ID: { type: String },
  name: { type: String },
  dept_name: { type: String },
  salary: { type: mongoose.Types.Decimal128 }
});


//Mi tabla JSON no es compatible con el enunciado, luego me adapto a la tabla que tengo.
const jsonSchema = new mongoose.Schema({
  ID: { type: String },
  name: { type: String },
  takes: [{
    year: { type: Number },
    semester: { type: String },
    course_id: { type: String }
  }],
  dept_name: { type: String }
});

//Indice
naturalJoin2Schema.index({ course_id: 1, credits: -1 });

// Creación de modelos
let alumno = new mongoose.model('alumno', alumnoSchema);
const CreditsForCourses = model('CreditsForCourses', new Schema({ _id: mongoose.Types.Decimal128, creditTotal: Number }));
let ObjectsAgregations = new mongoose.model('objectAgregations', naturalJoinSchema);
let ObjectsBasics = new mongoose.model('objectBasics', objectsBasicsSchema);
let ObjectsIndexs = new mongoose.model('objectIndexs', naturalJoin2Schema);
let ObjectsComplexes = model('objectComplexes', jsonSchema);

// Función principal
async function main() {
  try {
    const data = await getdata();
    console.log('Datos obtenidos:', data);

    let inserted_a = await alumno.insertMany(registro.alumno);
    let inserted_b = await ObjectsAgregations.insertMany(data.reunionnatural);
    let inserted_d = await ObjectsBasics.insertMany(data.instructors);
    let inserted_e = await ObjectsIndexs.insertMany(data.reunionnatural);

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

    await ObjectsComplexes.create({ json: data.json.json_register });
    

    //Agregacion
    const creditsForCourses = await CreditsForCourses.aggregate([
      { $group: { _id: { $year: "$year" }, creditTotal: { $sum: "$credits" } } },
      { $sort: { _id: -1 } }
    ]);

    console.log('Número de creditos por año:', creditsForCourses);
    await Promise.all(creditsForCourses.map(async (doc) => {
      await CreditsForCourses.updateOne({ _id: 
        doc._id }, { $set: { creditTotal: doc.creditTotal } }, { upsert: true });
    }));
    console.log('Creditos por año insertados en Compass');

    console.log('Datos insertados correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error en main:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
main();
