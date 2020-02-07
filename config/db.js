const mongoose = require('mongoose') //require mongoose
const config = require('config') //import config folder
const db = config.get('mongoURI') //find mongoURI from JSON

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true
    })
    console.log('MongoDB Connected...')
  } catch (err) {
    console.error(err.message)
    process.exit(1) //exit process with failure
  }
}

module.exports = connectDB
