import { Router } from "express";
import {
  createGroup,
  listGroups,
  getGroup,
  addMember,
  removeMember,
} from "../controllers/groupController.js";
import {
  validateCreateGroup,
  validateAddMember,
} from "../validators/groupValidator.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

import expenseRoutes from "./expenseRoutes.js";


router.use(protect); // every group route requires login

router.use(protect);
router.use("/:groupId/expenses", expenseRoutes);

router.route("/").get(listGroups).post(validateCreateGroup, createGroup);
router.get("/:groupId", getGroup);
router.post("/:groupId/members", validateAddMember, addMember);
router.delete("/:groupId/members/:memberId", removeMember);

export default router;