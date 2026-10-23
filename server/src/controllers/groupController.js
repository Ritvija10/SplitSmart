import * as groupService from "../services/groupService.js";

export const createGroup = async (req, res) => {
  const { name, description } = req.body;
  const group = await groupService.createGroup({
    name: name.trim(),
    description,
    userId: req.user._id,
  });
  res.status(201).json({ group });
};

export const listGroups = async (req, res) => {
  const groups = await groupService.listGroups(req.user._id);
  res.json({ groups });
};

export const getGroup = async (req, res) => {
  const group = await groupService.getGroupForMember(
    req.params.groupId,
    req.user._id
  );
  res.json({ group });
};

export const addMember = async (req, res) => {
  const group = await groupService.addMember({
    groupId: req.params.groupId,
    email: req.body.email,
    userId: req.user._id,
  });
  res.status(201).json({ group });
};

export const removeMember = async (req, res) => {
  const group = await groupService.removeMember({
    groupId: req.params.groupId,
    memberId: req.params.memberId,
    userId: req.user._id,
  });
  res.json({ group });
};