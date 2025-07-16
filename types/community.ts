export type CommunityType = "public" | "restricted" | "private";
export type MemberRole = "owner" | "moderator" | "member";
export type MemberStatus = "active" | "pending" | "banned";

export interface CommunityMember {
  user: { _ref: string };
  role: MemberRole;
  status: MemberStatus;
  joinedAt?: string;
}

export interface CommunityRule {
  _key?: string;
  rule: string;
}

export interface ApprovalQueueEntry {
  user: { _ref: string };
  requestedAt: string;
}

export interface Community {
  _id: string;
  name: string;
  slug: string;
  type: CommunityType;
  members: CommunityMember[];
  rules: string[];
  approvalQueue: ApprovalQueueEntry[];
  bannedUsers: { _ref: string }[];
} 