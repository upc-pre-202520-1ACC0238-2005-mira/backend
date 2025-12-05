import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  forwardRef,
} from '@nestjs/common';
import type { IChatMessageRepository } from '../domain/repositories/chat-message.repository.interface';
import type { IBusinessChatMessageRepository } from '../domain/repositories/business-chat-message.repository.interface';
import type { IBusinessMemberRepository } from '../../business/domain/repositories/business-member.repository.interface';
import type { IBusinessRepository } from '../../business/domain/repositories/business.repository.interface';
import type { IAppUserRepository } from '../../user-auth/domain/repositories/app-user.repository.interface';
import { NotificationService } from '../../notifications/application/notification.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { CreateBusinessChatMessageDto } from './dto/create-business-chat-message.dto';
import { ReactMessageDto } from './dto/react-message.dto';
import { ChatMessage } from '../domain/entities/chat-message.entity';
import { BusinessChatMessage } from '../domain/entities/business-chat-message.entity';

export interface ChatMessageResponse {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  senderName?: string;
  receiverName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessChatMessageResponse {
  id: string;
  businessId: string;
  senderId: string;
  message: string;
  senderName?: string;
  senderImage?: string;
  likes: number;
  dislikes: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ChatService {
  constructor(
    @Inject('IChatMessageRepository')
    private readonly chatMessageRepository: IChatMessageRepository,
    @Inject('IBusinessChatMessageRepository')
    private readonly businessChatMessageRepository: IBusinessChatMessageRepository,
    @Inject('IBusinessMemberRepository')
    private readonly businessMemberRepository: IBusinessMemberRepository,
    @Inject('IBusinessRepository')
    private readonly businessRepository: IBusinessRepository,
    @Inject('IAppUserRepository')
    private readonly appUserRepository: IAppUserRepository,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  async getConversation(
    currentUserId: string,
    otherUserId: string,
  ): Promise<ChatMessageResponse[]> {
    // Verificar que ambos usuarios existen
    const currentUser = await this.appUserRepository.findById(currentUserId);
    const otherUser = await this.appUserRepository.findById(otherUserId);

    if (!currentUser || !otherUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Obtener mensajes de la conversación
    const messages = await this.chatMessageRepository.findByConversation(
      currentUserId,
      otherUserId,
    );

    // Enriquecer con nombres de usuarios
    return messages.map((msg) => ({
      id: msg.id!,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      message: msg.message,
      senderName: msg.senderId === currentUserId ? currentUser.name : otherUser.name,
      receiverName: msg.receiverId === currentUserId ? currentUser.name : otherUser.name,
      createdAt: msg.createdAt!,
      updatedAt: msg.updatedAt!,
    }));
  }

  async sendMessage(
    senderId: string,
    receiverId: string,
    createChatMessageDto: CreateChatMessageDto,
  ): Promise<ChatMessageResponse> {
    // Verificar que ambos usuarios existen
    const sender = await this.appUserRepository.findById(senderId);
    const receiver = await this.appUserRepository.findById(receiverId);

    if (!sender || !receiver) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Crear el mensaje
    const message = await this.chatMessageRepository.create({
      senderId,
      receiverId,
      message: createChatMessageDto.message.trim(),
    });

    // Crear notificación para el receptor
    await this.notificationService.createDirectMessageNotification(
      receiverId,
      senderId,
      sender.name,
      createChatMessageDto.message.trim(),
    );

    return {
      id: message.id!,
      senderId: message.senderId,
      receiverId: message.receiverId,
      message: message.message,
      senderName: sender.name,
      receiverName: receiver.name,
      createdAt: message.createdAt!,
      updatedAt: message.updatedAt!,
    };
  }

  async getBusinessChatMessages(
    businessId: string,
    userId: string,
  ): Promise<BusinessChatMessageResponse[]> {
    // Verificar que el negocio existe
    const business = await this.businessRepository.findById(businessId);
    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // Verificar que el usuario es miembro del negocio
    const members = await this.businessMemberRepository.findByBusinessId(
      businessId,
    );
    const isMember =
      business.userId === userId ||
      members.some((member) => member.userId === userId);

    if (!isMember) {
      throw new ForbiddenException(
        'No eres miembro de este negocio',
      );
    }

    // Obtener mensajes del chat grupal
    const messages = await this.businessChatMessageRepository.findByBusinessId(
      businessId,
    );

    // Enriquecer con nombres de usuarios
    const enrichedMessages: BusinessChatMessageResponse[] = [];
    for (const msg of messages) {
      const sender = await this.appUserRepository.findById(msg.senderId);
      enrichedMessages.push({
        id: msg.id!,
        businessId: msg.businessId,
        senderId: msg.senderId,
        message: msg.message,
        senderName: sender?.name,
        senderImage: sender?.image,
        likes: msg.likes,
        dislikes: msg.dislikes,
        createdAt: msg.createdAt!,
        updatedAt: msg.updatedAt!,
      });
    }

    return enrichedMessages;
  }

  async sendBusinessChatMessage(
    businessId: string,
    senderId: string,
    createBusinessChatMessageDto: CreateBusinessChatMessageDto,
  ): Promise<BusinessChatMessageResponse> {
    // Verificar que el negocio existe
    const business = await this.businessRepository.findById(businessId);
    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // Verificar que el usuario es miembro del negocio
    const members = await this.businessMemberRepository.findByBusinessId(
      businessId,
    );
    const isMember =
      business.userId === senderId ||
      members.some((member) => member.userId === senderId);

    if (!isMember) {
      throw new ForbiddenException(
        'No eres miembro de este negocio',
      );
    }

    // Verificar que el remitente existe
    const sender = await this.appUserRepository.findById(senderId);
    if (!sender) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Crear el mensaje
    const message = await this.businessChatMessageRepository.create({
      businessId,
      senderId,
      message: createBusinessChatMessageDto.message.trim(),
    });

    // Crear notificaciones para todos los miembros excepto el remitente
    await this.notificationService.createBusinessMessageNotification(
      businessId,
      senderId,
      sender.name,
      business.name,
      createBusinessChatMessageDto.message.trim(),
    );

    return {
      id: message.id!,
      businessId: message.businessId,
      senderId: message.senderId,
      message: message.message,
      senderName: sender.name,
      senderImage: sender.image,
      likes: message.likes,
      dislikes: message.dislikes,
      createdAt: message.createdAt!,
      updatedAt: message.updatedAt!,
    };
  }

  async reactToBusinessMessage(
    messageId: string,
    userId: string,
    reactMessageDto: ReactMessageDto,
  ): Promise<BusinessChatMessageResponse> {
    const message = await this.businessChatMessageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    // Verificar que el usuario es miembro del negocio
    const members = await this.businessMemberRepository.findByBusinessId(
      message.businessId,
    );
    const business = await this.businessRepository.findById(message.businessId);
    const isMember =
      business?.userId === userId ||
      members.some((member) => member.userId === userId);

    if (!isMember) {
      throw new ForbiddenException(
        'No eres miembro de este negocio',
      );
    }

    // Actualizar likes/dislikes
    const updateData: Partial<BusinessChatMessage> = {};
    if (reactMessageDto.reaction === 'like') {
      updateData.likes = message.likes + 1;
    } else {
      updateData.dislikes = message.dislikes + 1;
    }

    const updated = await this.businessChatMessageRepository.update(
      messageId,
      updateData,
    );

    if (!updated) {
      throw new NotFoundException('Error al actualizar el mensaje');
    }

    const sender = await this.appUserRepository.findById(updated.senderId);

    return {
      id: updated.id!,
      businessId: updated.businessId,
      senderId: updated.senderId,
      message: updated.message,
      senderName: sender?.name,
      senderImage: sender?.image,
      likes: updated.likes,
      dislikes: updated.dislikes,
      createdAt: updated.createdAt!,
      updatedAt: updated.updatedAt!,
    };
  }
}
