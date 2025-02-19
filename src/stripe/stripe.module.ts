import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscription, SubscriptionSchema } from '../subscriptions/schemas/subscription.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema }
    ]),
  ],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}

