"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface WhiteboardToolbarProps {
  onToolChange?: (tool: string) => void
  onColorChange?: (color: string) => void
  onWidthChange?: (width: number) => void
  disabled?: boolean
}

export function WhiteboardToolbar({
  onToolChange,
  onColorChange,
  onWidthChange,
  disabled = false,
}: WhiteboardToolbarProps) {
  const [selectedTool, setSelectedTool] = useState("pen")
  const [selectedColor, setSelectedColor] = useState("#dc2626")
  const [brushSize, setBrushSize] = useState(2)

  const tools = [
    { id: "select", name: "Select", icon: "cursor" },
    { id: "pen", name: "Pen", icon: "pen" },
    { id: "eraser", name: "Eraser", icon: "eraser" },
    { id: "text", name: "Text", icon: "text" },
    { id: "sticky", name: "Sticky Note", icon: "sticky" },
    { id: "rectangle", name: "Rectangle", icon: "rectangle" },
    { id: "circle", name: "Circle", icon: "circle" },
    { id: "line", name: "Line", icon: "line" },
  ]

  const colors = [
    "#dc2626", // red
    "#f59e0b", // amber
    "#10b981", // emerald
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ef4444", // red
    "#f97316", // orange
    "#84cc16", // lime
    "#06b6d4", // cyan
    "#6366f1", // indigo
    "#ec4899", // pink
    "#000000", // black
    "#6b7280", // gray
    "#ffffff", // white
  ]

  const handleToolChange = (toolId: string) => {
    setSelectedTool(toolId)
    onToolChange?.(toolId)
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    onColorChange?.(color)
  }

  const handleWidthChange = (width: number) => {
    setBrushSize(width)
    onWidthChange?.(width)
  }

  const getToolIcon = (iconType: string) => {
    switch (iconType) {
      case "cursor":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            />
          </svg>
        )
      case "pen":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        )
      case "eraser":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        )
      case "text":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        )
      case "sticky":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
        )
      case "rectangle":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
          </svg>
        )
      case "circle":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
          </svg>
        )
      case "line":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 space-y-4">
      {/* Tools */}
      <Card className="w-14">
        <CardContent className="p-2 space-y-1">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? "default" : "ghost"}
              size="sm"
              className="w-full h-10 p-0"
              onClick={() => handleToolChange(tool.id)}
              title={tool.name}
              disabled={disabled}
            >
              {getToolIcon(tool.icon)}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Separator className="w-8" />

      {/* Colors */}
      <Card className="w-14">
        <CardContent className="p-2">
          <div className="grid grid-cols-2 gap-1">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-5 h-5 rounded border-2 ${
                  selectedColor === color ? "border-foreground" : "border-border"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
                title={color}
                disabled={disabled}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator className="w-8" />

      {/* Brush Size */}
      <Card className="w-14">
        <CardContent className="p-2 space-y-2">
          <div className="text-xs text-center text-muted-foreground">Size</div>
          <div className="space-y-1">
            {[1, 2, 4, 8].map((size) => (
              <Button
                key={size}
                variant={brushSize === size ? "default" : "ghost"}
                size="sm"
                className="w-full h-8 p-0"
                onClick={() => handleWidthChange(size)}
                disabled={disabled}
              >
                <div className="rounded-full bg-current" style={{ width: `${size + 2}px`, height: `${size + 2}px` }} />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
