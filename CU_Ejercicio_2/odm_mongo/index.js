import mongoose from 'mongoose';
import { getdata } from './api.js';
const { Schema, model } = mongoose;
let uri = 'mongodb://127.0.0.1:27017/sakila';
//trayendo la data del api
const query = await getdata().then(data => {
  console.log(data);
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
/* const special_featuresSchema = new mongoose.Schema({
   Trailers:{type:String},
   Commentaries:{type:String},
   Delete_Scenes:{type:String},
   Behind_the_Scenes:{type:String}
 });*/

const actorSchema = new mongoose.Schema({
  actor_id: { type: Number },
  first_name: { type: String },
  last_name: { type: String },
  last_update: { type: Date, default: Date.now}
});
const filmSchema = new mongoose.Schema({  
  film_id: { type: Number },
  title: { type: String },
  description: { type: String },
  realase_year: { type: Date, default: Date.now },
  language_id: { type: Number },
  original_language_id: { type: Number, default: null },
  rental_duration: { type: Number },
  rental_rate: { type: mongoose.Types.Decimal128 },
  length: { type: Number },
  replacement_cost: { type: mongoose.Types.Decimal128 },
  rating: { type: String, enum:['G', 'PG', 'PG-13', 'R', 'NC-17'], default: 'G'},
  special_features: { type: [{type: String}], default: []},
  last_update: { type: Date, default: Date.now }
});

let Actor = new mongoose.model('Actor', actorSchema);
let Film = new mongoose.model('Film', filmSchema);
console.log(query.Actor);
console.log(query.Film);

try {
  let inserted_a = await Actor.insertMany(query.actor);
  let inserted_b = await Film.insertMany(query.film);
  process.exit(0);
} catch (e) {
  console.log('Some error');
  console.log(e);
  process.exit(0);
}



