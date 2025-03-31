import mongoose from 'mongoose';
import { getdata } from './api.js';
const { Schema, model } = mongoose;
let manyTakes = [];
let newId;
let uri = 'mongodb://127.0.0.1:27017/Ejercicio_7';
//trayendo la data del api
const query = await getdata().then(data => {
   //console.log(data);
   return data;
}).catch(error => {
   console.log('no va');
   process.exit(0);
});

const options = {
   autoIndex: false, // Don't build indexes
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

const studentSchema = new mongoose.Schema({
   _id: Schema.Types.ObjectId,
   ID: { type: String, unique: true },
   name: { type: String },
   dept_name: { type: String, text: true },
   credits: { type: mongoose.Types.Decimal128 },
   mytakes: [{ type: Schema.Types.ObjectId, ref: 'Takes' }]
});


const takesSchema = new mongoose.Schema({
   ID: { type: String, ref: 'Student' },
   course_id: { type: String },
   sec_id: { type: String },
   semester: { type: String },
   year: { type: mongoose.Types.Decimal128 },
   student: { type: Schema.Types.ObjectId, ref: 'Student' }
});

let Student = new mongoose.model('Student', studentSchema);
let Takes = new mongoose.model('Takes', takesSchema);

Object.keys(query.student).forEach(skey => {
   console.log(skey);
   let mystudent = new Student({
      _id: new mongoose.Types.ObjectId(),
      ID: query.student[skey].ID,
      name: query.student[skey].name,
      dept_name: query.student[skey].dept_name,
      credits: query.student[skey].credits
   });

   mystudent.save().then(() => {
      Object.keys(query.takes).forEach(tkey => {
         if (query.student[skey].ID == query.takes[tkey].ID) {
            let take = new Takes({
               ID: query.takes[tkey].ID,
               course_id: query.takes[tkey].course_id,
               sec_id: query.takes[tkey].sec_id,
               semester: query.takes[tkey].semester,
               year: query.takes[tkey].year,
               grade: query.takes[tkey].grade,
               student: mystudent._id
            });
            mystudent.mytakes.push(take._id);
            take.save().then(() => {

            }).catch((err) => {
               console.log(err);
            }).catch((err) => {
               console.log(err);
            });
            console.log(mystudent.mytakes);
         }
      });
      mystudent.save();
   });
});

/*
const takes = await Takes.findOne({ID:'00128'}).populate('student');
console.log("Es populate?", takes.populated('student'));
console.log("acceder al campo a traves de la relacion", takes.student.name);
*/
