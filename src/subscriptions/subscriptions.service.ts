import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from './schemas/subscription.schema';
import { StripeService } from '../stripe/stripe.service';
import { PlansService } from '../plans/plans.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    private stripeService: StripeService,
    private plansService: PlansService,
  ) {}

  async createSubscription(userId: string, planId: string) {
    const plan = this.plansService.getPlanById(planId);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const sessionId = await this.stripeService.createCheckoutSession(
      userId,
      plan.stripePriceId,
      `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      `${process.env.FRONTEND_URL}/cancel`
    );

    return { sessionId };
  }

  async handleSubscriptionCreated(event: any) {
    const subscription = event.data.object;
    const { userId } = event.data.object.metadata;

    await this.subscriptionModel.create({
      userId,
      planId: subscription.items.data[0].price.id,
      status: subscription.status,
      stripeSubscriptionId: subscription.id,
    });
  }

  async handleSubscriptionUpdated(event: any) {
    const subscription = event.data.object;
    await this.subscriptionModel.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      { status: subscription.status },
    );
  }

  async getUserSubscription(userId: string) {
    return this.subscriptionModel
      .findOne({ userId, status: 'active' })
      .exec();
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId);
    await this.subscriptionModel.findByIdAndUpdate(subscription._id, {
      status: 'canceled',
    });
  }
}

