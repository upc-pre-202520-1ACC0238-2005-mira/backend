export class Business {
  id?: string;
  name: string;
  type: string;
  phone: string;
  address: string;
  description?: string;
  logo?: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    name: string,
    type: string,
    phone: string,
    address: string,
    userId: string,
    description?: string,
    logo?: string,
  ) {
    this.name = name;
    this.type = type;
    this.phone = phone;
    this.address = address;
    this.userId = userId;
    this.description = description;
    this.logo = logo;
  }
}
