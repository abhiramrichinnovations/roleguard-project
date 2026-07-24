export type WorkspaceRole = 'owner' | 'admin' | 'member';
export type InviteStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface WorkspaceWithRole extends Workspace {
  role: WorkspaceRole;
  member_count: number;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: Date;
  email: string;
  username: string;
}

export interface WorkspaceInvite {
  id: string;
  workspace_id: string;
  email: string;
  role: 'admin' | 'member';
  invited_by: string;
  token: string;
  status: InviteStatus;
  expires_at: Date;
  created_at: Date;
}