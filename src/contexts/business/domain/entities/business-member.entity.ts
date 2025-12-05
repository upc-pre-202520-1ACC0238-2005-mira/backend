export class BusinessMember {
  id?: string;
  businessId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(businessId: string, userId: string) {
    this.businessId = businessId;
    this.userId = userId;
  }
}
