import mongoose from "mongoose";
import Group from "../models/Group.js";
import User from "../models/user.js";
import AppError from "../utils/AppError.js";

const assertValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid group id", 400);
  }
};

// Loads a group and confirms the user belongs to it.
// Returns 404 for non-members too, so group ids can't be probed.
export const getGroupForMember = async (groupId, userId) => {
  assertValidId(groupId);

  const group = await Group.findOne({ _id: groupId, members: userId })
    .populate("members", "name email")
    .populate("createdBy", "name email");

  if (!group) throw new AppError("Group not found", 404);
  return group;
};

export const createGroup = async ({ name, description, userId }) => {
  const group = await Group.create({
    name,
    description,
    createdBy: userId,
    members: [userId],
  });
  return getGroupForMember(group._id, userId);
};

export const listGroups = async (userId) => {
  return Group.find({ members: userId })
    .populate("members", "name email")
    .sort({ updatedAt: -1 });
};

export const addMember = async ({ groupId, email, userId }) => {
  const group = await getGroupForMember(groupId, userId);

  const newMember = await User.findOne({ email: email.toLowerCase().trim() });
  if (!newMember) {
    throw new AppError("No user found with that email", 404);
  }

  const alreadyIn = group.members.some(
    (m) => m._id.toString() === newMember._id.toString()
  );
  if (alreadyIn) {
    throw new AppError("User is already in this group", 409);
  }

  await Group.updateOne(
    { _id: groupId },
    { $addToSet: { members: newMember._id } }
  );
  return getGroupForMember(groupId, userId);
};

export const removeMember = async ({ groupId, memberId, userId }) => {
  const group = await getGroupForMember(groupId, userId);

  if (!mongoose.isValidObjectId(memberId)) {
    throw new AppError("Invalid member id", 400);
  }

  const isCreator = group.createdBy._id.toString() === userId.toString();
  const isSelf = memberId === userId.toString();

  // Creator can remove anyone; members can only remove themselves
  if (!isCreator && !isSelf) {
    throw new AppError("Only the group creator can remove other members", 403);
  }
  if (memberId === group.createdBy._id.toString()) {
    throw new AppError("The group creator cannot be removed", 400);
  }

  const isMember = group.members.some((m) => m._id.toString() === memberId);
  if (!isMember) throw new AppError("That user is not in this group", 404);

  await Group.updateOne({ _id: groupId }, { $pull: { members: memberId } });

  // If a member removed themselves they can no longer view the group
  if (isSelf) return null;
  return getGroupForMember(groupId, userId);
};