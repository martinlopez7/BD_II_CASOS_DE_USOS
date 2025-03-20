import mongoose from 'mongoose';
import { getdata } from './api.js';

const { Schema, model } = mongoose;
const uri = 'mongodb://127.0.0.1:27017/uni_2025_ejercicio_3';

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

// Definición de esquemas
const sumSchema = new Schema({
  sum: { type: Number }
});

const courseSchema = new Schema({
  course_id: { type: String },
  title: { type: String },
  dept_name: { type: String },
  credits: { type: Number }
});

const takesSchema = new Schema({
  ID: { type: Number },
  course_id: { type: String, index: true },
  sec_id: { type: Number },
  semester: { type: String },
  year: { type: Date, default: Date.now },
  grade: { type: String }
});

takesSchema.index({ course_id: 1, year: -1 });

// Creación de modelos
const Sum = model('sum', sumSchema);
const Course = model('course', courseSchema);
const Takes = model('takes', takesSchema);
const CoursesByDept = model('CoursesByDept', new Schema({ _id: String, totalCursos: Number }));
const CoursesByYear = model('CoursesByYear', new Schema({ _id: mongoose.Types.Decimal128, totalCursos: Number }));

// Función principal
async function main() {
  try {
    const data = await getdata();
    console.log('Datos obtenidos:', data);

    await Sum.insertMany(data.sum);
    await Course.insertMany(data.course);
    await Takes.insertMany(data.takes);
    console.log('Datos insertados correctamente');

    // Agregaciones
    const coursesByDept = await Course.aggregate([
      { $match: { credits: 4 } },
      { $group: { _id: "$dept_name", totalCursos: { $sum: 1 } } },
      { $sort: { totalCursos: -1 } }
    ]);

    console.log('Cursos de 4 créditos por departamento:', coursesByDept);
    await Promise.all(coursesByDept.map(async (doc) => {
      await CoursesByDept.updateOne({ _id: doc._id }, { $set: { totalCursos: doc.totalCursos } }, { upsert: true });
    }));
    console.log('Cursos de 4 créditos por departamento insertados en Compass');

    const coursesByYear = await Takes.aggregate([
      { $group: { _id: { $year: "$year" }, totalCursos: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('Número de cursos tomados por año:', coursesByYear);
    await Promise.all(coursesByYear.map(async (doc) => {
      await CoursesByYear.updateOne({ _id: doc._id }, { $set: { totalCursos: doc.totalCursos } }, { upsert: true });
    }));
    console.log('Cursos por año insertados en Compass');

    process.exit(0);
  } catch (error) {
    console.error('Error en main:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
main();
