import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface BoardCardProps {
  id: string
  title: string
  description: string
  lastModified: string
  collaborators: string[]
  thumbnail: string
}

export function BoardCard({ id, title, description, lastModified, collaborators, thumbnail }: BoardCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
      <Link href={`/board/${id}`}>
        <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
          <img
            src={thumbnail || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-sans line-clamp-1">{title}</CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {collaborators.slice(0, 3).map((collaborator, index) => (
                <Avatar key={index} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">{collaborator}</AvatarFallback>
                </Avatar>
              ))}
              {collaborators.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">+{collaborators.length - 3}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{lastModified}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
