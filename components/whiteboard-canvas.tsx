"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CursorTracker } from "@/components/cursor-tracker"
import { useSocket } from "@/hooks/use-socket"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"

interface Point {
  x: number
  y: number
}

interface DrawingPath {
  id: string
  type: "path"
  points: Point[]
  color: string
  width: number
  tool: string
}

interface Shape {
  id: string
  type: "rectangle" | "circle" | "line"
  startPoint: Point
  endPoint: Point
  color: string
  width: number
  fill?: string
}

interface StickyNote {
  id: string
  type: "sticky"
  position: Point
  width: number
  height: number
  text: string
  color: string
}

interface TextElement {
  id: string
  type: "text"
  position: Point
  text: string
  fontSize: number
  color: string
  fontFamily: string
}

type WhiteboardElement = DrawingPath | Shape | StickyNote | TextElement

interface CanvasState {
  scale: number
  offsetX: number
  offsetY: number
  isDrawing: boolean
  isPanning: boolean
  isCreatingShape: boolean
  lastPoint: Point | null
  currentPath: Point[]
  shapeStartPoint: Point | null
  selectedElement: string | null
}

interface WhiteboardCanvasProps {
  currentTool: string
  currentColor: string
  currentWidth: number
  onToolChange?: (tool: string) => void
  readOnly?: boolean
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gridSize = 20
  ctx.strokeStyle = "#ccc"
  ctx.lineWidth = 0.5

  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

function getMousePos(e: React.MouseEvent): Point {
  const canvas = e.currentTarget as HTMLCanvasElement
  const rect = canvas.getBoundingClientRect()
  return {
    x: (e.clientX - rect.left) / canvasState.scale - canvasState.offsetX / canvasState.scale,
    y: (e.clientY - rect.top) / canvasState.scale - canvasState.offsetY / canvasState.scale,
  }
}

let canvasState: CanvasState = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  isDrawing: false,
  isPanning: false,
  isCreatingShape: false,
  lastPoint: null,
  currentPath: [],
  shapeStartPoint: null,
  selectedElement: null,
}

function setCanvasState(newState: CanvasState) {
  canvasState = newState
}

export function WhiteboardCanvas({
  currentTool = "pen",
  currentColor = "#dc2626",
  currentWidth = 2,
  onToolChange,
  readOnly = false,
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [elements, setElements] = useState<WhiteboardElement[]>([])
  const [editingText, setEditingText] = useState<{ id: string; position: Point } | null>(null)
  const [tempText, setTempText] = useState("")

  const { socket, currentUser } = useSocket()

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeCanvas = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      redrawCanvas()
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.save()

    ctx.translate(canvasState.offsetX, canvasState.offsetY)
    ctx.scale(canvasState.scale, canvasState.scale)

    drawGrid(ctx, canvas.width, canvas.height)

    elements.forEach((element) => {
      drawElement(ctx, element, element.id === canvasState.selectedElement)
    })

    if (canvasState.currentPath.length > 1 && currentTool === "pen") {
      ctx.beginPath()
      ctx.strokeStyle = currentColor
      ctx.lineWidth = currentWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      ctx.moveTo(canvasState.currentPath[0].x, canvasState.currentPath[0].y)
      for (let i = 1; i < canvasState.currentPath.length; i++) {
        ctx.lineTo(canvasState.currentPath[i].x, canvasState.currentPath[i].y)
      }
      ctx.stroke()
    }

    if (canvasState.isCreatingShape && canvasState.shapeStartPoint && canvasState.lastPoint) {
      drawShapePreview(ctx, currentTool, canvasState.shapeStartPoint, canvasState.lastPoint, currentColor, currentWidth)
    }

    ctx.restore()
  }, [elements, currentColor, currentWidth, currentTool])

  const drawElement = (ctx: CanvasRenderingContext2D, element: WhiteboardElement, isSelected: boolean) => {
    switch (element.type) {
      case "path":
        if (element.points.length < 2) return
        ctx.beginPath()
        ctx.strokeStyle = element.color
        ctx.lineWidth = element.width
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.moveTo(element.points[0].x, element.points[0].y)
        for (let i = 1; i < element.points.length; i++) {
          ctx.lineTo(element.points[i].x, element.points[i].y)
        }
        ctx.stroke()
        break

      case "rectangle":
        ctx.strokeStyle = element.color
        ctx.lineWidth = element.width
        const width = element.endPoint.x - element.startPoint.x
        const height = element.endPoint.y - element.startPoint.y
        if (element.fill) {
          ctx.fillStyle = element.fill
          ctx.fillRect(element.startPoint.x, element.startPoint.y, width, height)
        }
        ctx.strokeRect(element.startPoint.x, element.startPoint.y, width, height)
        break

      case "circle":
        ctx.strokeStyle = element.color
        ctx.lineWidth = element.width
        const radius = Math.sqrt(
          Math.pow(element.endPoint.x - element.startPoint.x, 2) +
            Math.pow(element.endPoint.y - element.startPoint.y, 2),
        )
        ctx.beginPath()
        ctx.arc(element.startPoint.x, element.startPoint.y, radius, 0, 2 * Math.PI)
        if (element.fill) {
          ctx.fillStyle = element.fill
          ctx.fill()
        }
        ctx.stroke()
        break

      case "line":
        ctx.strokeStyle = element.color
        ctx.lineWidth = element.width
        ctx.beginPath()
        ctx.moveTo(element.startPoint.x, element.startPoint.y)
        ctx.lineTo(element.endPoint.x, element.endPoint.y)
        ctx.stroke()
        break

      case "sticky":
        ctx.fillStyle = element.color
        ctx.fillRect(element.position.x, element.position.y, element.width, element.height)
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 1
        ctx.strokeRect(element.position.x, element.position.y, element.width, element.height)

        ctx.fillStyle = "#000000"
        ctx.font = "14px sans-serif"
        const lines = element.text.split("\n")
        lines.forEach((line, index) => {
          ctx.fillText(line, element.position.x + 8, element.position.y + 20 + index * 18)
        })
        break

      case "text":
        ctx.fillStyle = element.color
        ctx.font = `${element.fontSize}px ${element.fontFamily}`
        ctx.fillText(element.text, element.position.x, element.position.y)
        break
    }

    if (isSelected) {
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])

      const bounds = getElementBounds(element)
      ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10)
      ctx.setLineDash([])
    }
  }

  const drawShapePreview = (
    ctx: CanvasRenderingContext2D,
    tool: string,
    start: Point,
    end: Point,
    color: string,
    width: number,
  ) => {
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.setLineDash([5, 5])

    switch (tool) {
      case "rectangle":
        const w = end.x - start.x
        const h = end.y - start.y
        ctx.strokeRect(start.x, start.y, w, h)
        break
      case "circle":
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
        ctx.beginPath()
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI)
        ctx.stroke()
        break
      case "line":
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.stroke()
        break
    }
    ctx.setLineDash([])
  }

  const getElementBounds = (element: WhiteboardElement) => {
    switch (element.type) {
      case "path":
        const xs = element.points.map((p) => p.x)
        const ys = element.points.map((p) => p.y)
        return {
          x: Math.min(...xs),
          y: Math.min(...ys),
          width: Math.max(...xs) - Math.min(...xs),
          height: Math.max(...ys) - Math.min(...ys),
        }
      case "rectangle":
        return {
          x: Math.min(element.startPoint.x, element.endPoint.x),
          y: Math.min(element.startPoint.y, element.endPoint.y),
          width: Math.abs(element.endPoint.x - element.startPoint.x),
          height: Math.abs(element.endPoint.y - element.startPoint.y),
        }
      case "circle":
        const radius = Math.sqrt(
          Math.pow(element.endPoint.x - element.startPoint.x, 2) +
            Math.pow(element.endPoint.y - element.startPoint.y, 2),
        )
        return {
          x: element.startPoint.x - radius,
          y: element.startPoint.y - radius,
          width: radius * 2,
          height: radius * 2,
        }
      case "line":
        return {
          x: Math.min(element.startPoint.x, element.endPoint.x),
          y: Math.min(element.startPoint.y, element.endPoint.y),
          width: Math.abs(element.endPoint.x - element.startPoint.x),
          height: Math.abs(element.endPoint.y - element.startPoint.y),
        }
      case "sticky":
        return {
          x: element.position.x,
          y: element.position.y,
          width: element.width,
          height: element.height,
        }
      case "text":
        return {
          x: element.position.x,
          y: element.position.y - element.fontSize,
          width: element.text.length * element.fontSize * 0.6,
          height: element.fontSize,
        }
      default:
        return { x: 0, y: 0, width: 0, height: 0 }
    }
  }

  const findElementAt = (pos: Point): WhiteboardElement | null => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i]
      const bounds = getElementBounds(element)

      if (
        pos.x >= bounds.x &&
        pos.x <= bounds.x + bounds.width &&
        pos.y >= bounds.y &&
        pos.y <= bounds.y + bounds.height
      ) {
        return element
      }
    }
    return null
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return

    const pos = getMousePos(e)

    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      setCanvasState({
        ...canvasState,
        isPanning: true,
        lastPoint: { x: e.clientX, y: e.clientY },
      })
    } else if (e.button === 0) {
      switch (currentTool) {
        case "select":
          const clickedElement = findElementAt(pos)
          setCanvasState({
            ...canvasState,
            selectedElement: clickedElement?.id || null,
          })
          break

        case "pen":
          setCanvasState({
            ...canvasState,
            isDrawing: true,
            currentPath: [pos],
          })
          break

        case "eraser":
          const elementToErase = findElementAt(pos)
          if (elementToErase) {
            setElements((prev) => prev.filter((el) => el.id !== elementToErase.id))
          }
          break

        case "rectangle":
        case "circle":
        case "line":
          setCanvasState({
            ...canvasState,
            isCreatingShape: true,
            shapeStartPoint: pos,
            lastPoint: pos,
          })
          break

        case "text":
          setEditingText({ id: Date.now().toString(), position: pos })
          setTempText("")
          break

        case "sticky":
          const newSticky: StickyNote = {
            id: Date.now().toString(),
            type: "sticky",
            position: pos,
            width: 150,
            height: 100,
            text: "New note",
            color: "#fef3c7",
          }
          setElements((prev) => [...prev, newSticky])
          break
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getMousePos(e)

    // Emit cursor position to other users
    if (socket && currentUser) {
      socket.emit("cursor-move", {
        userId: currentUser.id,
        position: pos,
        boardId: "current-board-id",
      })
    }

    if (readOnly) return

    if (canvasState.isPanning && canvasState.lastPoint) {
      const deltaX = e.clientX - canvasState.lastPoint.x
      const deltaY = e.clientY - canvasState.lastPoint.y

      setCanvasState({
        ...canvasState,
        offsetX: canvasState.offsetX + deltaX,
        offsetY: canvasState.offsetY + deltaY,
        lastPoint: { x: e.clientX, y: e.clientY },
      })
    } else if (canvasState.isDrawing && currentTool === "pen") {
      const newPath = [...canvasState.currentPath, pos]
      setCanvasState({
        ...canvasState,
        currentPath: newPath,
      })

      if (socket) {
        socket.emit("drawing-update", {
          type: "path-update",
          path: newPath,
          color: currentColor,
          width: currentWidth,
          userId: currentUser?.id,
        })
      }
    } else if (canvasState.isCreatingShape) {
      setCanvasState({
        ...canvasState,
        lastPoint: pos,
      })
    }
  }

  const handleMouseUp = () => {
    if (readOnly) return

    if (canvasState.isDrawing && canvasState.currentPath.length > 1) {
      const newPath: DrawingPath = {
        id: Date.now().toString(),
        type: "path",
        points: canvasState.currentPath,
        color: currentColor,
        width: currentWidth,
        tool: currentTool,
      }
      setElements((prev) => [...prev, newPath])

      if (socket) {
        socket.emit("element-add", {
          element: newPath,
          userId: currentUser?.id,
        })
      }
    }

    if (canvasState.isCreatingShape && canvasState.shapeStartPoint && canvasState.lastPoint) {
      const newShape: Shape = {
        id: Date.now().toString(),
        type: currentTool as "rectangle" | "circle" | "line",
        startPoint: canvasState.shapeStartPoint,
        endPoint: canvasState.lastPoint,
        color: currentColor,
        width: currentWidth,
      }
      setElements((prev) => [...prev, newShape])

      if (socket) {
        socket.emit("element-add", {
          element: newShape,
          userId: currentUser?.id,
        })
      }
    }

    setCanvasState({
      ...canvasState,
      isDrawing: false,
      isPanning: false,
      isCreatingShape: false,
      lastPoint: null,
      currentPath: [],
      shapeStartPoint: null,
    })
  }

  const handleTextSubmit = () => {
    if (editingText && tempText.trim()) {
      const newText: TextElement = {
        id: editingText.id,
        type: "text",
        position: editingText.position,
        text: tempText,
        fontSize: 16,
        color: currentColor,
        fontFamily: "sans-serif",
      }
      setElements((prev) => [...prev, newText])
    }
    setEditingText(null)
    setTempText("")
  }

  const deleteSelected = () => {
    if (canvasState.selectedElement) {
      setElements((prev) => prev.filter((el) => el.id !== canvasState.selectedElement))
      setCanvasState((prev) => ({ ...prev, selectedElement: null }))
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelected()
      }
      if (e.key === "Escape") {
        setCanvasState((prev) => ({ ...prev, selectedElement: null }))
        setEditingText(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [canvasState.selectedElement])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(5, canvasState.scale * delta))

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setCanvasState({
      ...canvasState,
      scale: newScale,
      offsetX: mouseX - (mouseX - canvasState.offsetX) * (newScale / canvasState.scale),
      offsetY: mouseY - (mouseY - canvasState.offsetY) * (newScale / canvasState.scale),
    })
  }

  useEffect(() => {
    if (!socket) return

    const handleElementAdd = (data: { element: WhiteboardElement; userId: string }) => {
      if (data.userId !== currentUser?.id) {
        setElements((prev) => [...prev, data.element])
      }
    }

    const handleElementUpdate = (data: { elementId: string; element: WhiteboardElement; userId: string }) => {
      if (data.userId !== currentUser?.id) {
        setElements((prev) => prev.map((el) => (el.id === data.elementId ? data.element : el)))
      }
    }

    const handleElementDelete = (data: { elementId: string; userId: string }) => {
      if (data.userId !== currentUser?.id) {
        setElements((prev) => prev.filter((el) => el.id !== data.elementId))
      }
    }

    socket.on("element-add", handleElementAdd)
    socket.on("element-update", handleElementUpdate)
    socket.on("element-delete", handleElementDelete)

    return () => {
      socket.off("element-add", handleElementAdd)
      socket.off("element-update", handleElementUpdate)
      socket.off("element-delete", handleElementDelete)
    }
  }, [socket, currentUser])

  useEffect(() => {
    redrawCanvas()
  }, [redrawCanvas])

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-white">
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${readOnly ? "cursor-default" : "cursor-crosshair"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />

      <CursorTracker />

      {editingText && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
            <h3 className="font-medium mb-2">Add Text</h3>
            <Textarea
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              placeholder="Enter your text..."
              className="w-64 mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <Button onClick={handleTextSubmit} disabled={!tempText.trim()}>
                Add Text
              </Button>
              <Button variant="outline" onClick={() => setEditingText(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
          <div className="text-xs text-muted-foreground mb-2">Zoom: {Math.round(canvasState.scale * 100)}%</div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setCanvasState({
                  ...canvasState,
                  scale: Math.min(5, canvasState.scale * 1.2),
                })
              }
            >
              +
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setCanvasState({
                  ...canvasState,
                  scale: Math.max(0.1, canvasState.scale * 0.8),
                })
              }
            >
              -
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setCanvasState({
                  ...canvasState,
                  scale: 1,
                  offsetX: 0,
                  offsetY: 0,
                })
              }
            >
              Reset
            </Button>
          </div>
        </div>

        {canvasState.selectedElement && !readOnly && (
          <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
            <Button size="sm" variant="destructive" onClick={deleteSelected}>
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      <div className="absolute top-4 left-4 bg-card border border-border rounded-lg p-3 shadow-lg max-w-sm">
        <h3 className="font-medium text-sm mb-2">Canvas Controls</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Left click and drag to draw/create shapes</li>
          <li>• Ctrl + drag or middle mouse to pan</li>
          <li>• Mouse wheel to zoom</li>
          <li>• Delete/Backspace to remove selected</li>
          <li>• Escape to deselect</li>
          <li>• See other users' cursors in real-time</li>
        </ul>
      </div>
    </div>
  )
}
