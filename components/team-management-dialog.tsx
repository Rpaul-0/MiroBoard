"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, Mail, Trash2, Crown, Edit, Eye } from "lucide-react"

interface TeamMember {
  id: string
  email: string
  full_name?: string
  role: "owner" | "editor" | "viewer"
  avatar_url?: string
}

interface TeamManagementDialogProps {
  boardId: string
  isOwner: boolean
}

export function TeamManagementDialog({ boardId, isOwner }: TeamManagementDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor")
  const [isInviting, setIsInviting] = useState(false)

  // Mock team members data - in real app, fetch from API
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      email: "john@example.com",
      full_name: "John Doe",
      role: "owner",
      avatar_url: "/diverse-user-avatars.png",
    },
    {
      id: "2",
      email: "sarah@example.com",
      full_name: "Sarah Wilson",
      role: "editor",
      avatar_url: "/diverse-user-avatars.png",
    },
    {
      id: "3",
      email: "mike@example.com",
      full_name: "Mike Chen",
      role: "viewer",
      avatar_url: "/diverse-user-avatars.png",
    },
  ])

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return

    setIsInviting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newMember: TeamMember = {
      id: Date.now().toString(),
      email: inviteEmail,
      role: inviteRole,
    }

    setTeamMembers((prev) => [...prev, newMember])
    setInviteEmail("")
    setIsInviting(false)
  }

  const handleRoleChange = (memberId: string, newRole: "editor" | "viewer") => {
    setTeamMembers((prev) => prev.map((member) => (member.id === memberId ? { ...member, role: newRole } : member)))
  }

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers((prev) => prev.filter((member) => member.id !== memberId))
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-amber-500" />
      case "editor":
        return <Edit className="w-4 h-4 text-blue-500" />
      case "viewer":
        return <Eye className="w-4 h-4 text-gray-500" />
      default:
        return null
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default"
      case "editor":
        return "secondary"
      case "viewer":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="w-4 h-4 mr-2" />
          Team ({teamMembers.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-sans">Team Management</DialogTitle>
          <DialogDescription>Manage who has access to this board and their permissions.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Section */}
          {isOwner && (
            <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
              <h3 className="font-medium font-sans">Invite Team Members</h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="invite-email" className="sr-only">
                    Email address
                  </Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <Select value={inviteRole} onValueChange={(value: "editor" | "viewer") => setInviteRole(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleInvite} disabled={isInviting || !inviteEmail.trim()}>
                  {isInviting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Inviting...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Invite
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Team Members List */}
          <div className="space-y-3">
            <h3 className="font-medium font-sans">Team Members</h3>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg bg-card"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white text-sm font-medium">
                      {member.full_name
                        ? member.full_name.charAt(0).toUpperCase()
                        : member.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{member.full_name || member.email}</p>
                      {member.full_name && <p className="text-xs text-muted-foreground">{member.email}</p>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {member.role === "owner" ? (
                      <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        Owner
                      </Badge>
                    ) : isOwner ? (
                      <Select
                        value={member.role}
                        onValueChange={(value: "editor" | "viewer") => handleRoleChange(member.id, value)}
                      >
                        <SelectTrigger className="w-28 h-8">
                          <div className="flex items-center gap-1">
                            {getRoleIcon(member.role)}
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="editor">
                            <div className="flex items-center gap-2">
                              <Edit className="w-4 h-4 text-blue-500" />
                              Editor
                            </div>
                          </SelectItem>
                          <SelectItem value="viewer">
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-gray-500" />
                              Viewer
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                    )}

                    {isOwner && member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permission Explanation */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Permission Levels</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Crown className="w-3 h-3 text-amber-500" />
                <span>
                  <strong>Owner:</strong> Full access including team management
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Edit className="w-3 h-3 text-blue-500" />
                <span>
                  <strong>Editor:</strong> Can create, edit, and delete content
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-3 h-3 text-gray-500" />
                <span>
                  <strong>Viewer:</strong> Can only view and comment
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
