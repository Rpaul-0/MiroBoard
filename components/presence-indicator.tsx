"use client"

import { useSocket } from "@/hooks/use-socket"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function PresenceIndicator() {
  const { users, currentUser, isConnected } = useSocket()

  const allUsers = currentUser ? [currentUser, ...users] : users

  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-2">
        {allUsers.slice(0, 5).map((user) => (
          <Avatar key={user.id} className="h-8 w-8 border-2 border-background" style={{ borderColor: user.color }}>
            <AvatarFallback className="text-xs font-medium text-white" style={{ backgroundColor: user.color }}>
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        {allUsers.length > 5 && (
          <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
            <span className="text-xs text-muted-foreground">+{allUsers.length - 5}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-xs text-muted-foreground">{allUsers.length} online</span>
      </div>
    </div>
  )
}
