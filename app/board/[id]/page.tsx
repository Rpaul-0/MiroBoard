"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { WhiteboardCanvas } from "@/components/whiteboard-canvas"
import { WhiteboardToolbar } from "@/components/whiteboard-toolbar"
import { PresenceIndicator } from "@/components/presence-indicator"
import { CollaborationChat } from "@/components/collaboration-chat"
import { TeamManagementDialog } from "@/components/team-management-dialog"
import { ShareBoardDialog } from "@/components/share-board-dialog"
import { SocketProvider } from "@/hooks/use-socket"

interface BoardPageProps {
  params: {
    id: string
  }
}

export default function BoardPage({ params }: BoardPageProps) {
  const [currentTool, setCurrentTool] = useState("pen")
  const [currentColor, setCurrentColor] = useState("#dc2626")
  const [currentWidth, setCurrentWidth] = useState(2)
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Mock user role - in real app, fetch from API based on current user and board
  const userRole = "owner" // or "editor" or "viewer"
  const isOwner = userRole === "owner"
  const canEdit = userRole === "owner" || userRole === "editor"

  return (
    <SocketProvider boardId={params.id}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card flex-shrink-0">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                  </Button>
                </Link>
                <div>
                  <h1 className="text-xl font-bold font-sans text-foreground">Board {params.id}</h1>
                  <p className="text-sm text-muted-foreground">Collaborative whiteboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <PresenceIndicator />
                <div className="flex items-center space-x-2">
                  <TeamManagementDialog boardId={params.id} isOwner={isOwner} />
                  <ShareBoardDialog boardId={params.id} isOwner={isOwner} />
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <WhiteboardToolbar
            onToolChange={setCurrentTool}
            onColorChange={setCurrentColor}
            onWidthChange={setCurrentWidth}
            disabled={!canEdit}
          />
          <div className="flex-1 relative">
            <WhiteboardCanvas
              currentTool={currentTool}
              currentColor={currentColor}
              currentWidth={currentWidth}
              readOnly={!canEdit}
            />
            {!canEdit && (
              <div className="absolute top-4 left-4 bg-amber-100 border border-amber-300 text-amber-800 px-3 py-2 rounded-lg text-sm font-medium">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                View Only Mode
              </div>
            )}
          </div>
        </div>

        <CollaborationChat isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
      </div>
    </SocketProvider>
  )
}
