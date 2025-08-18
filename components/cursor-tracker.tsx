"use client"

import { useSocket } from "@/hooks/use-socket"

interface CursorTrackerProps {
  onCursorMove?: (position: { x: number; y: number }) => void
}

export function CursorTracker({ onCursorMove }: CursorTrackerProps) {
  const { users } = useSocket()

  return (
    <div className="absolute inset-0 pointer-events-none">
      {users.map(
        (user) =>
          user.cursor && (
            <div
              key={user.id}
              className="absolute transition-all duration-100 ease-out"
              style={{
                left: user.cursor.x,
                top: user.cursor.y,
                transform: "translate(-2px, -2px)",
              }}
            >
              {/* Cursor */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="drop-shadow-md">
                <path
                  d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                  fill={user.color}
                  stroke="white"
                  strokeWidth="1"
                />
              </svg>

              {/* User name label */}
              <div
                className="absolute top-5 left-2 px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap"
                style={{ backgroundColor: user.color }}
              >
                {user.name}
              </div>
            </div>
          ),
      )}
    </div>
  )
}
