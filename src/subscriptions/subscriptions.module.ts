import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';
import { StripeModule } from '../stripe/stripe.module';
import { UsersModule } from '../users/users.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    StripeModule,
    UsersModule,
    PlansModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
