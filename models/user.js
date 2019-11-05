const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now()
  },
  verification: new Schema({
    isVerified: {
      type: Boolean,
      default: false
    },
    token: String,
    created_at: {
      type: String,
      default: Date.now()
    }
  })
});

module.exports = mongoose.model("user", userSchema);
