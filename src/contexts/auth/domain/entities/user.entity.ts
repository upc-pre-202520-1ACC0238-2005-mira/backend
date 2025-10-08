export class User {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(name: string, email: string, password: string, role: string = 'user') {
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
  }
}
