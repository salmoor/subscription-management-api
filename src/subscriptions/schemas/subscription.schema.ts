import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema()
export class Subscription extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true })
  planId: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  stripeSubscriptionId: string;

  @Prop({ required: true })
  currentPeriodEnd: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
