export class Task {
  id?: string;
  title: string;
  description: string;
  businessId: string;
  assignedToUserId: string;
  assignedByUserId: string;
  images: string[];
  status: 'pending' | 'in_progress' | 'completed';
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    title: string,
    description: string,
    businessId: string,
    assignedToUserId: string,
    assignedByUserId: string,
    images: string[] = [],
    status: 'pending' | 'in_progress' | 'completed' = 'pending',
  ) {
    this.title = title;
    this.description = description;
    this.businessId = businessId;
    this.assignedToUserId = assignedToUserId;
    this.assignedByUserId = assignedByUserId;
    this.images = images;
    this.status = status;
  }
}
