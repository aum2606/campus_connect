const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, match: /^\S+@\S+\.\S+$/ },
    course: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1, validate: Number.isInteger },
  },
  {
    versionKey: false,
    toJSON: {
      transform: (document, returned) => {
        returned.id = returned._id.toString();
        delete returned._id;
        return returned;
      },
    },
  },
);

module.exports = mongoose.model('Student', studentSchema);
