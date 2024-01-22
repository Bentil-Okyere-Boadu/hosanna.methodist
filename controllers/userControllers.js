const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

//controller to register/signup users
const registerUser = asyncHandler(async (req, res) => {
  const user = req.body;
  const { email, password, dateOfBirth } = req.body;

  //throws error if user already exists in the db with the same email
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json("User already exists");
  }

  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = password
    ? await bcrypt.hash(password, salt)
    : undefined;

  const newUser = await User.create({
    ...user,
    dateOfBirth: new Date(dateOfBirth),
    password: hashedPassword,
  });

  //if newUser data is ok, create user
  if (newUser) {
    res.status(201).json({
      user: newUser._doc,
      token: generateToken(newUser._id),
    });
  } else {
    res.status(400);
    throw new Error(" Failed to create user");
  }
});

//controller for authenticating users/ logins
const authUser = asyncHandler(async (req, res) => {
  //get email and password from request body
  const { email, password } = req.body;

  //search for user email in db
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json(`No user with email ${email} exists`);
  }

  const existingPassword = await bcrypt.compare(password, user.password);

  //if there is an email and the password matches, return user info
  if (user && existingPassword) {
    res.json({
      _id: user._id,
      user: user._doc,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Password");
  }
});

/// api/user?search=koo
const allUsers = asyncHandler(async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            //uses regex for comparison of the search term
            { firstName: { $regex: req.query.search, $options: "i" } },
            { lastName: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    //finds the user from the provided search term with the _id value of the User in the db
    const users = await User.find(keyword);
    res.send(users);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
/// api/user/:id
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    //finds the user by id
    const user = await User.findById({ _id: id });

    if (!user) {
      res.status(404).json({ error: "User does not exist" });
      return;
    }

    res.send(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// api/user/:id
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const newUserDetails = req.body;

  try {
    const user = await User.findById({ _id: id });
    if (!user) {
      return res.status(404).json("User does not exist.");
    }

    if (user) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: id },
        newUserDetails,
        { new: true }
      );
      res.status(200).json(updatedUser);
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = password
    ? await bcrypt.hash(password, salt)
    : undefined;

  try {
    const user = await User.findById({ _id: id });
    if (!user) {
      return res.status(404).json("User does not exist.");
    }

    if (user) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: id },
        { password: hashedPassword }
      );
      res.status(200).json(updatedUser);
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// api/user/:id
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById({ _id: id });
    // If user not found, return a 404 response
    if (!user) {
      return res.status(404).json("User does not exist.");
    } else {
      await User.findByIdAndDelete({ _id: id });

      // Return the deleted user in the response
      res.json({ message: "User deleted successfully", user });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = {
  registerUser,
  authUser,
  updateUser,
  deleteUser,
  getUserById,
  updatePassword,
  allUsers,
};
