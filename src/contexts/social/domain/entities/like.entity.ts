export class Like {
  id?: string;
  postId: string; // ID del post al que se dio like
  userId: string; // ID del usuario que dio like
  createdAt?: Date;

  constructor(postId: string, userId: string) {
    this.postId = postId;
    this.userId = userId;
  }
}

