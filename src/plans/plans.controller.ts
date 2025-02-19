import { Controller, Get } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlanDto } from './dto/plan.dto';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  getAllPlans(): PlanDto[] {
    return this.plansService.getAllPlans();
  }
}
