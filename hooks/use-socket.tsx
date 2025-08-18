"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Socket } from "socket.io-client"

interface User {
  id: string
  name: string
  color: string
  cursor?: { x: number; y: number }
}

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  users: User[]
  currentUser: User | null
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  users: [],
  currentUser: null,
})

export function useSocket() {
  return useContext(SocketContext)
}

interface SocketProviderProps {
  children: React.ReactNode
  boardId: string
}

export function SocketProvider({ children, boardId }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    // In a real app, this would connect to your Socket.IO server
    // For demo purposes, we'll simulate the connection
    const mockSocket = {
      emit: (event: string, data: any) => {
        console.log(`[Socket] Emitting ${event}:`, data)
      },
      on: (event: string, callback: Function) => {
        console.log(`[Socket] Listening for ${event}`)
      },
      off: (event: string, callback?: Function) => {
        console.log(`[Socket] Removing listener for ${event}`)
      },
      disconnect: () => {
        console.log("[Socket] Disconnecting")
        setIsConnected(false)
      },
    } as any

    setSocket(mockSocket)
    setIsConnected(true)

    // Simulate current user
    const user: User = {
      id: "user-" + Math.random().toString(36).substr(2, 9),
      name: "You",
      color: "#dc2626",
    }
    setCurrentUser(user)

    // Simulate other users joining
    setTimeout(() => {
      setUsers([
        {
          id: "user-1",
          name: "Alice",
          color: "#10b981",
          cursor: { x: 200, y: 150 },
        },
        {
          id: "user-2",
          name: "Bob",
          color: "#3b82f6",
          cursor: { x: 400, y: 300 },
        },
      ])
    }, 2000)

    return () => {
      mockSocket.disconnect()
    }
  }, [boardId])

  return <SocketContext.Provider value={{ socket, isConnected, users, currentUser }}>{children}</SocketContext.Provider>
}
