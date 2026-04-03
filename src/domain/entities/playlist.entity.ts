export class PlaylistEntity {
  readonly id: string
  readonly userId: string | null
  name: string
  description: string | null
  icon: string | null
  color: string | null
  orderNum: number | null
  readonly createdAt: string
  updatedAt: string | null

  constructor(data: {
    id: string
    userId: string | null
    name: string
    description: string | null
    icon: string | null
    color: string | null
    orderNum: number | null
    createdAt: string
    updatedAt: string | null
  }) {
    this.id = data.id
    this.userId = data.userId
    this.name = data.name
    this.description = data.description
    this.icon = data.icon
    this.color = data.color
    this.orderNum = data.orderNum
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

 static create(data: {
  name: string
  description?: string
  icon?: string
  color?: string
}): {
  userId: string | null
  name: string
  description: string | null
  icon: string | null
  color: string | null
  orderNum: number | null
} {
  if (!data.name || data.name.length < 2) {
    throw new Error('Playlist name must be at least 2 characters')
  }
  return {
    userId: null,
    name: data.name,
    description: data.description || null,
    icon: data.icon || null,
    color: data.color || null,
    orderNum: null,
  }
}

}
