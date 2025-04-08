import mongoose from 'mongoose';
import { getdata } from './api.js';

const { Schema, model } = mongoose;
const uri = 'mongodb://127.0.0.1:27017/Ejercicio_8';

// Trayendo la data del API
let query;
try {
  query = await getdata();
  console.log('Datos obtenidos:', query);
} catch (error) {
  console.error('Error al obtener datos:', error);
  process.exit(1);
}

// Validar que los datos existen y tienen la estructura correcta
if (!query.students || !query.instructor || !query.advisor) {
  console.error('Error: Datos faltantes en query. Verifica la API.');
  process.exit(1);
}

const options = {
  autoIndex: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};

mongoose.connect(uri, options)
  .then(() => console.log('Se ha conectado exitosamente'))
  .catch(err => {
    console.error('No se ha podido conectar:', err);
    process.exit(1);
  });

const studentSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  ID: { type: String },
  name: { type: String },
  dept_name: { type: String },
  credits: { type: mongoose.Types.Decimal128 },
  picture: Buffer,
  grades: [{}],
  advisor: { type: Schema.Types.ObjectId, ref: 'advisor' }
});

const instructorSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  ID: { type: String },
  name: { type: String },
  dept_name: { type: String },
  salary: { type: mongoose.Types.Decimal128 },
  activo: Boolean,
  phone_extensions: [{}],
  advisor: { type: Schema.Types.ObjectId, ref: 'advisor' }
});

const advisorSchema = new mongoose.Schema({
  s_ID: { type: Schema.Types.ObjectId, ref: 'student' },
  i_ID: { type: Schema.Types.ObjectId, ref: 'instructor' }
});

const Student = model('student', studentSchema);
const Instructor = model('instructor', instructorSchema);
const Advisor = model('advisor', advisorSchema);

async function seedDatabase() {
  try {
    for (let skey in query.students) {
      for (let ikey in query.instructor) {
        for (let akey in query.advisor) {
          const studentData = query.students[skey];
          const instructorData = query.instructor[ikey];
          const advisorData = query.advisor[akey];

          if (!studentData || !instructorData || !advisorData) continue;

          if (advisorData.s_ID === studentData.ID && advisorData.i_ID === instructorData.ID) {
            const studentDoc = new Student({
              _id: new mongoose.Types.ObjectId(),
              ID: studentData.ID,
              name: studentData.name,
              dept_name: studentData.dept_name,
              credits: studentData.credits,
            });

            const instructorDoc = new Instructor({
              _id: new mongoose.Types.ObjectId(),
              ID: instructorData.ID,
              name: instructorData.name,
              dept_name: instructorData.dept_name,
              salary: { $numberDecimal: instructorData.salary },
              activo: instructorData.activo,
            });

            const advisorDoc = new Advisor({
              s_ID: studentDoc._id,
              i_ID: instructorDoc._id,
            });

            await studentDoc.save();
            await instructorDoc.save();
            await advisorDoc.save();

            studentDoc.advisor = advisorDoc._id;
            instructorDoc.advisor = advisorDoc._id;
            await studentDoc.save();
            await instructorDoc.save();
          }
        }
      }
    }
    console.log('Base de datos poblada exitosamente.');
  } catch (e) {
    console.error('Error al poblar la base de datos:', e.message);
    process.exit(1);
  }
}

await seedDatabase();

/*const advisor_p = await Advisor.findOne().populate('s_ID').populate('i_ID');
console.log(advisor_p.s_ID.name);
console.log(advisor_p.i_ID.name);
*/
