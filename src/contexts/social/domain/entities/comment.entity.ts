export class Comment {
  id?: string;
  postId: string; // ID del post al que pertenece
  userId: string; // ID del usuario que comentó
  userName: string; // Nombre del usuario
  content: string; // Contenido del comentario
  parentCommentId?: string; // ID del comentario padre (para respuestas en hilo)
  repliesCount: number; // Contador de respuestas
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    postId: string,
    userId: string,
    userName: string,
    content: string,
    parentCommentId?: string,
  ) {
    this.postId = postId;
    this.userId = userId;
    this.userName = userName;
    this.content = content;
    this.parentCommentId = parentCommentId;
    this.repliesCount = 0;
  }
}

