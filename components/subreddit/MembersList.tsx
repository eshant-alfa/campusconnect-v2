import React from "react";

interface Member {
  user: { _ref: string };
  role: "owner" | "moderator" | "member";
  status: "active" | "pending" | "banned";
  joinedAt?: string;
}

export function MembersList({ members }: { members: Member[] }) {
  return (
    <ul className="divide-y divide-gray-200">
      {members.map((m) => (
        <li key={m.user._ref} className="flex gap-2 items-center py-2">
          <span className="font-mono text-xs">{m.user._ref}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 ml-2">{m.role}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-800 ml-2">{m.status}</span>
        </li>
      ))}
    </ul>
  );
} 