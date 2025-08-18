"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Share2, Copy, Check, Globe, Lock } from "lucide-react"

interface ShareBoardDialogProps {
  boardId: string
  isOwner: boolean
}

export function ShareBoardDialog({ boardId, isOwner }: ShareBoardDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/board/${boardId}`
  const publicUrl = `${shareUrl}?public=true`

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  const handleTogglePublic = () => {
    setIsPublic(!isPublic)
    // In real app, make API call to update board visibility
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans">Share Board</DialogTitle>
          <DialogDescription>Share this board with others or make it publicly accessible.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Public Access Toggle */}
          {isOwner && (
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center space-x-3">
                {isPublic ? <Globe className="w-5 h-5 text-green-500" /> : <Lock className="w-5 h-5 text-gray-500" />}
                <div>
                  <Label htmlFor="public-access" className="font-medium">
                    Public Access
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isPublic ? "Anyone with the link can view" : "Only team members can access"}
                  </p>
                </div>
              </div>
              <Switch id="public-access" checked={isPublic} onCheckedChange={handleTogglePublic} />
            </div>
          )}

          {/* Share Links */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Team Link</Label>
              <p className="text-xs text-muted-foreground mb-2">Share with team members who have access</p>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="text-xs" />
                <Button variant="outline" size="sm" onClick={() => handleCopyLink(shareUrl)} className="flex-shrink-0">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {isPublic && (
              <div>
                <Label className="text-sm font-medium">Public Link</Label>
                <p className="text-xs text-muted-foreground mb-2">Anyone with this link can view the board</p>
                <div className="flex gap-2">
                  <Input value={publicUrl} readOnly className="text-xs" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(publicUrl)}
                    className="flex-shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Access Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              {isPublic
                ? "Public boards can be viewed by anyone with the link, but only team members can edit."
                : "Only invited team members can access this board. Use the Team button to manage access."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
