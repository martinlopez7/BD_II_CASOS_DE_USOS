import mongoose from 'mongoose';
import { getdata } from './api.js';

const { Schema, model } = mongoose;
const uri = 'mongodb://127.0.0.1:27017/CU_EJERCICIO_5';

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

const studentSchema = new Schema({
    ID: { type: String, required: true },
    name: { type: String, required: true },
    dept_name: { type: String, required: true },
    tot_cred: { type: Number, required: true }
});

const takeSchema = new Schema({
    ID: { type: String, required: true },
    course_id: { type: String, required: true },
    sec_id: { type: String, required: true },
    semester: { type: String, required: true },
    year: { type: Number, required: true },
    grade: { type: String }
});

const Student = model('Student', studentSchema);
const Take = model('Take', takeSchema);

async function main() {
    try {
        const response = await getdata();
        const jsonData = JSON.parse(response.json[0].student);
        const takesData = JSON.parse(response.json[0].takes);

        const students = jsonData.student.fields.reduce((acc, field) => {
            field.values.forEach((value, index) => {
                if (!acc[index]) acc[index] = {};
                acc[index][field.field] = value;
            });
            return acc;
        }, []);

        const takes = takesData.takes.fields.reduce((acc, field) => {
            field.values.forEach((value, index) => {
                if (!acc[index]) acc[index] = {};
                acc[index][field.field] = value;
            });
            return acc;
        }, []);
        
        console.log('Datos que se insertarán en Student:', students);
        await Student.insertMany(students);
        console.log('Datos que se insertarán en Take:', takes);
        await Take.insertMany(takes);
        
        console.log('Datos insertados correctamente');
        process.exit(0);
    } catch (error) {
        console.error('Error al procesar los datos:', error);
    }
}

main();
