export interface CreateAppUserData {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role: 'user' | 'admin';
  readonly image?: string;
}
