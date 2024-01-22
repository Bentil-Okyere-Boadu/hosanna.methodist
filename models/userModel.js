const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    phoneNumber: { type: String },
    whatsappNumber: { type: String },
    residence: { type: String },
    hometown: { type: String },
    occupation: { type: String },
    organization: { type: String },
    picture: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async (enteredPassword) => {
  return await bcrypt.compare(enteredPassword, this.password);
};

//encrypt password before storing password to database
userSchema.pre("save", async (next) => {
  if (!this.isModified) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);
module.exports = User;
