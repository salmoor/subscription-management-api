import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from './schemas/subscription.schema';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    private stripeService: StripeService,
  ) {}

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const subscription = await this.subscriptionModel
      .findOne({ 
        userId, 
        status: 'active'
      })
      .exec();

    if (!subscription) {
      return null;
    }

    return subscription;
  }

  async cancelSubscription(userId: string): Promise<void> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId);
  }
}
