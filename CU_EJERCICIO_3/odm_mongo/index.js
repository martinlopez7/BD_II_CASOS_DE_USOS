import mongoose from 'mongoose';
import { getdata } from './api.js';
const { Schema, model } = mongoose;
let uri = 'mongodb://127.0.0.1:27017/uni_2025_ejercicio_3';
//trayendo la data del api
const query = await getdata().then(data => {
   console.log(data);
   return data;
}).catch(error => {
   console.log('no va');
   process.exit(0);
});

const options = {
   autoIndex: true, // Don't build indexes
   maxPoolSize: 10, // Maintain up to 10 socket connections
   serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
   socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
   family: 4 // Use IPv4, skip trying IPv6
};
mongoose.connect(uri, options).then(
   () => {
      console.log('se ha conectado exitosamente')
   },
   err => { console.log('no se ha podido conectar') }
);
const sumSchema = new mongoose.Schema({
   sum: { type: Number }
});
const courseSchema = new mongoose.Schema({
   course_id: { type: String },
   title: { type: String },
   dept_name: { type: String },
   credits: { type: Number }
});
const takesSchema = new mongoose.Schema({
   ID: { type: Number },
   course_id: { type: String, index:true },
   sec_id: { type: Number },
   semester: { type: String },
   year: { type: Date, default: Date.now },
   grade: { type: String }
});

//Indice
takesSchema.index({ course_id: 1, year: -1 });

//Modelos
let sum = new mongoose.model('sum', sumSchema);
let course = new mongoose.model('course', courseSchema);
let takes = new mongoose.model('takes', takesSchema);

//Agregaciones
let CoursesByDept = mongoose.model('CoursesByDept', new mongoose.Schema({_id: String, totalCursos: Number}));
let CoursesByYear = mongoose.model('CoursesByYear', new mongoose.Schema({_id: mongoose.Types.Decimal128, totalCursos: Number}));

async function main(){
   const query = await getdata().then (data=> {
      return data;
   }).catch (error=>{
      console.log('No va');
      process.exit(0);
   });
}

try {

   await sum.insertMany(query.sum);
   await course.insertMany(query.course);
   await takes.insertMany(query.takes);

   console.log('Datos insertados correctamente');

   const coursesByDept = await course.aggregate([
      { $match:{credits:4}},
      {$group: {_id: "$dept_name", totalCursos: {$sum: 1}}},
      {$sort: {totalCursos:-1}}]);

   console.log('Cursos de 4 creditos por departamento:', coursesByDept);

   await Promise.all(coursesByDept.map(async(doc)=> {
      await CoursesByDept.updateOne({_id: doc._id}, {$set:{totalCursos: doc.totalCursos}}, {upsert:true});
   }));

   console.log('Cursos de 4 creditos por departamento insertados en Compass');

   const coursesByYear = await takes.aggregate([
      {$group: {_id: "$year", totalCursos: {$sum: 1}}},
      {$sort: {_id:1}}]);

   console.log('Numero de cursos tomados por año', coursesByYear);

   await Promise.all(coursesByYear.map(async(doc)=> {
      await CoursesByYear.updateOne({_id: doc._id}, {$set:{totalCursos: doc.totalCursos}}, {upsert:true});
   }));

   console.log('Cursos por año insertados en Compass');
   process.exit(0);
} catch (e) {
   console.log('Some error');
   console.log(e);
   process.exit(0);
}