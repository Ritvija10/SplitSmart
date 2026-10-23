export interface Member {
  _id: string;
  name: string;
  email: string;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  createdBy: Member | string;
  members: Member[];
  createdAt: string;
  updatedAt: string;
}