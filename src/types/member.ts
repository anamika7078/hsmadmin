export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  flatNumber: string;
  wing: string;
  role: "MEMBER" | "COMMITTEE_MEMBER" | "CHAIRPERSON" | "SECRETARY";
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface MemberRequest extends Member {
  status: "PENDING";
}
