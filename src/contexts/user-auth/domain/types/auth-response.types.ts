export interface AuthResponse {
  readonly access_token: string;
  readonly user: UserResponse;
}

export interface UserResponse {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'user' | 'admin';
  readonly image?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
