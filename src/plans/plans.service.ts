import { Injectable } from '@nestjs/common';
import { PlanDto } from './dto/plan.dto';

@Injectable()
export class PlansService {
  private readonly plans: PlanDto[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      description: 'Perfect for individuals and small projects',
      price: 9.99,
      features: ['Basic features', 'Email support', 'Limited access'],
      stripePriceId: 'price_basic_monthly',
    },
    {
      id: 'standard',
      name: 'Standard Plan',
      description: 'Great for growing businesses',
      price: 19.99,
      features: [
        'All Basic features',
        'Priority support',
        'Advanced features',
        'API access',
      ],
      stripePriceId: 'price_standard_monthly',
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      description: 'For enterprises and large scale operations',
      price: 49.99,
      features: [
        'All Standard features',
        '24/7 Support',
        'Custom solutions',
        'Dedicated account manager',
        'Advanced analytics',
      ],
      stripePriceId: 'price_premium_monthly',
    },
  ];

  getAllPlans(): PlanDto[] {
    return this.plans;
  }

  getPlanById(id: string): PlanDto | undefined {
    return this.plans.find((plan) => plan.id === id);
  }
}
