import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema()
export class Payment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  stripePaymentIntentId: string;

  @Prop({ required: true })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Subscription' })
  subscriptionId: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
