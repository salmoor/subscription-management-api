import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
  RawBodyRequest,
  BadRequestException,
  Get,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StripeService } from '../stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';

interface CheckoutSessionDto {
  priceId: string;
}

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body() body: CheckoutSessionDto,
    @Req() req: Request & { user: { userId: string } },
  ) {
    const baseUrl = this.configService.get<string>('FRONTEND_URL');
    if (!baseUrl) {
      throw new BadRequestException('FRONTEND_URL not configured');
    }

    const session = await this.stripeService.createCheckoutSession(
      req.user.userId,
      body.priceId,
      `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/cancel`,
    );

    return { sessionId: session.id };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getCurrentSubscription(@Req() req: Request & { user: { userId: string } }) {
    const subscription = await this.subscriptionsService.getUserSubscription(
      req.user.userId,
    );
    return subscription;
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async cancelSubscription(@Req() req: Request & { user: { userId: string } }) {
    await this.subscriptionsService.cancelSubscription(req.user.userId);
    return { message: 'Subscription cancelled successfully' };
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!request.rawBody) {
      throw new BadRequestException('No raw body provided');
    }

    return this.stripeService.handleWebhook(signature, request.rawBody);
  }
}
