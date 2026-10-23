import { apiRequest } from "./api";
import type { Group } from "../types/group";

export const listGroupsRequest = () =>
  apiRequest<{ groups: Group[] }>("/groups");

export const getGroupRequest = (groupId: string) =>
  apiRequest<{ group: Group }>(`/groups/${groupId}`);

export const createGroupRequest = (name: string, description: string) =>
  apiRequest<{ group: Group }>("/groups", {
    method: "POST",
    body: { name, description },
  });

export const addMemberRequest = (groupId: string, email: string) =>
  apiRequest<{ group: Group }>(`/groups/${groupId}/members`, {
    method: "POST",
    body: { email },
  });

export const removeMemberRequest = (groupId: string, memberId: string) =>
  apiRequest<{ group: Group | null }>(`/groups/${groupId}/members/${memberId}`, {
    method: "DELETE",
  });