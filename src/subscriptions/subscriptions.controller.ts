import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
  RawBodyRequest,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StripeService } from '../stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

interface CheckoutSessionDto {
  priceId: string;
}

interface CancelSubscriptionDto {
  subscriptionId: string;
}

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
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

    const sessionId = await this.stripeService.createCheckoutSession(
      req.user.userId,
      body.priceId,
      `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/cancel`,
    );

    return { sessionId };
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancel')
  async cancelSubscription(@Body() body: CancelSubscriptionDto) {
    await this.stripeService.cancelSubscription(body.subscriptionId);
    return { status: 'canceled' };
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
