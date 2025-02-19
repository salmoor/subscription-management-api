import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from '../subscriptions/schemas/subscription.schema';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(Subscription.name) private subscriptionModel: Model<Subscription>,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    this.stripe = new Stripe(secretKey);
  }

  async createCheckoutSession(
    userId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const customer = await this.stripe.customers.create({
        metadata: {
          userId: userId
        }
      });

      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
        },
      });

      return session;
    } catch (error) {
      this.logger.error('Error creating checkout session:', error);
      throw new BadRequestException('Could not create checkout session');
    }
  }

  async handleSubscriptionCreated(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    const customer = subscription.customer as string;

    try {
      const customerData = await this.stripe.customers.retrieve(customer);
      if ('deleted' in customerData) {
        throw new Error('Customer has been deleted');
      }

      const userId = customerData.metadata?.userId;
      if (!userId) {
        throw new Error('No userId found in customer metadata');
      }

      await this.subscriptionModel.create({
        userId,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        planId: subscription.items.data[0].price.id,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });
    } catch (error) {
      this.logger.error('Error handling subscription created:', error);
      throw error;
    }
  }

  async handleWebhook(
    signature: string | undefined,
    payload: Buffer,
  ): Promise<{ received: boolean }> {
    if (!signature) {
      throw new BadRequestException('No signature provided');
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event);
          break;
      }

      return { received: true };
    } catch (err) {
      this.logger.error('Error processing webhook:', err);
      throw new BadRequestException('Webhook error');
    }
  }

  async cancelSubscription(stripeSubscriptionId: string): Promise<void> {
    try {
      await this.stripe.subscriptions.cancel(stripeSubscriptionId);

      const subscription = await this.subscriptionModel.findOne({ stripeSubscriptionId });
      if (!subscription) {
        throw new Error('Subscription not found in database');
      }

      subscription.status = 'canceled';
      await subscription.save();
    } catch (error) {
      this.logger.error('Error canceling subscription:', error);
      throw new BadRequestException('Could not cancel subscription');
    }
  }
}
