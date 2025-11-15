export class Post {
  id?: string;
  userId: string; // ID del usuario que creó el post
  userName: string; // Nombre del usuario
  userEmail: string; // Email del usuario
  content: string; // Contenido del post
  imageUrl?: string; // URL de imagen (opcional)
  extractionId?: string; // ID de la extracción relacionada (opcional)
  likesCount: number; // Contador de likes
  commentsCount: number; // Contador de comentarios
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    userId: string,
    userName: string,
    userEmail: string,
    content: string,
    imageUrl?: string,
    extractionId?: string,
  ) {
    this.userId = userId;
    this.userName = userName;
    this.userEmail = userEmail;
    this.content = content;
    this.imageUrl = imageUrl;
    this.extractionId = extractionId;
    this.likesCount = 0;
    this.commentsCount = 0;
  }
}
