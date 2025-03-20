import mongoose from 'mongoose';
import { getdata } from './api.js';

const { Schema, model } = mongoose;
const uri = 'mongodb://127.0.0.1:27017/CU_EJERCICIO_5';

// Opciones de conexión
const options = {
  autoIndex: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};

// Función para conectar a la base de datos
async function connectToDatabase() {
  try {
    await mongoose.connect(uri, options);
    console.log('Se ha conectado exitosamente a MongoDB');
    return true;
  } catch (err) {
    console.error('No se ha podido conectar a MongoDB:', err);
    return false;
  }
}

// Esquema para estudiantes (datos individuales)
const studentSchema = new Schema({
  dept_name: { type: String },
  ID: { type: String },
  name: { type: String },
  tot_cred: { type: Number }
});

// Esquema para takes (datos individuales)
const takesSchema = new Schema({
  course_id: { type: String },
  grade: { type: String },
  ID: { type: String },
  sec_id: { type: String },
  semester: { type: String },
  year: { type: Number }
});

// Creación de modelos
const Student = model('Student', studentSchema);
const Takes = model('Takes', takesSchema);

// Función para procesar y almacenar estudiantes
async function processStudents(studentData) {
  try {
    const parsedStudentData = JSON.parse(studentData);
    const fields = parsedStudentData.student.fields;
    const studentRecords = [];
    
    // Encontrar los índices de los campos
    const fieldIndices = {};
    fields.forEach((field, index) => {
      fieldIndices[field.field] = index;
    });
    
    // Crear registros de estudiantes
    const recordCount = fields[0].values.length;
    for (let i = 0; i < recordCount; i++) {
      const student = {
        dept_name: fields[fieldIndices.dept_name].values[i],
        ID: fields[fieldIndices.ID].values[i],
        name: fields[fieldIndices.name].values[i],
        tot_cred: fields[fieldIndices.tot_cred].values[i]
      };
      studentRecords.push(student);
    }
    
    // Guardar estudiantes individuales
    if (studentRecords.length > 0) {
      await Student.insertMany(studentRecords);
      console.log(`${studentRecords.length} estudiantes insertados correctamente`);
    } else {
      console.log('No se encontraron registros de estudiantes para insertar');
    }
    
    return studentRecords;
  } catch (error) {
    console.error('Error procesando estudiantes:', error);
    throw error;
  }
}

// Función para procesar y almacenar takes
async function processTakes(takesData) {
  try {
    const parsedTakesData = JSON.parse(takesData);
    const fields = parsedTakesData.takes.fields;
    const takesRecords = [];
    
    // Encontrar los índices de los campos
    const fieldIndices = {};
    fields.forEach((field, index) => {
      fieldIndices[field.field] = index;
    });
    
    // Crear registros de takes
    const recordCount = fields[0].values.length;
    for (let i = 0; i < recordCount; i++) {
      const take = {
        course_id: fields[fieldIndices.course_id].values[i],
        grade: fields[fieldIndices.grade].values[i],
        ID: fields[fieldIndices.ID].values[i],
        sec_id: fields[fieldIndices.sec_id].values[i],
        semester: fields[fieldIndices.semester].values[i],
        year: fields[fieldIndices.year].values[i]
      };
      takesRecords.push(take);
    }
    
    // Guardar takes individuales
    if (takesRecords.length > 0) {
      await Takes.insertMany(takesRecords);
      console.log(`${takesRecords.length} takes insertados correctamente`);
    } else {
      console.log('No se encontraron registros de takes para insertar');
    }
    
    return takesRecords;
  } catch (error) {
    console.error('Error procesando takes:', error);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    // Conectar a la base de datos primero
    const connected = await connectToDatabase();
    if (!connected) {
      console.error('No se pudo conectar a la base de datos. Terminando proceso.');
      process.exit(1);
    }
    
    // Obtener datos
    const data = await getdata();
    
    // Verificar si los datos tienen la estructura esperada
    if (!data || !data.json || !Array.isArray(data.json) || data.json.length === 0) {
      console.error('Los datos recibidos no tienen la estructura esperada:', data);
      process.exit(1);
    }
    
    console.log('Datos obtenidos correctamente');
    
    // Procesar cada registro del JSON
    for (const item of data.json) {
      if (!item.student || !item.takes) {
        console.error('Item inválido en JSON:', item);
        continue;
      }
      
      console.log(`Procesando registro con id: ${item.id}`);
      await processStudents(item.student);
      await processTakes(item.takes);
    }
    
    console.log('Todos los datos procesados e insertados correctamente');
    
    // Cerrar la conexión de mongoose antes de salir
    await mongoose.connection.close();
    console.log('Conexión a la base de datos cerrada correctamente');
    
    process.exit(0);
  } catch (error) {
    console.error('Error en main:', error);
    
    try {
      // Intentar cerrar la conexión antes de salir
      await mongoose.connection.close();
      console.log('Conexión a la base de datos cerrada después de error');
    } catch (closeError) {
      console.error('Error al cerrar la conexión:', closeError);
    }
    
    process.exit(1);
  }
}

// Ejecutar la función principal
main();