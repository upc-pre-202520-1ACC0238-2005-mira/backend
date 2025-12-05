export class AppUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role: 'user' | 'admin';
  readonly image?: string;
  readonly createdBy?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(
    id: string,
    name: string,
    email: string,
    password: string,
    role: 'user' | 'admin' = 'user',
    image?: string,
    createdBy?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.image = image;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    name: string,
    email: string,
    password: string,
    role: 'user' | 'admin' = 'user',
    image?: string,
  ): AppUser {
    const id = '';
    return new AppUser(id, name, email, password, role, image);
  }
}
