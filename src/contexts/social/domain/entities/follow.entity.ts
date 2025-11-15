export class Follow {
  id?: string;
  followerId: string; // Usuario que sigue
  followingId: string; // Usuario/cafetería seguido
  createdAt?: Date;
  updatedAt?: Date;

  constructor(followerId: string, followingId: string) {
    this.followerId = followerId;
    this.followingId = followingId;
  }
}

