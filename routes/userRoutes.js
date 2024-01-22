const express = require("express");
const router = express.Router();
const {
  registerUser,
  authUser,
  allUsers,
  updateUser,
  deleteUser,
  getUserById,
  updatePassword,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

router.route("/").post(registerUser).get(protect, allUsers);
router.route("/password/:id").put(protect, updatePassword);
router
  .route("/:id")
  .put(protect, updateUser)
  .delete(protect, deleteUser)
  .get(protect, getUserById);
router.post("/login", authUser);

module.exports = router;
