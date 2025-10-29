import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'src/auth/auth.guard';

import { RechargesService } from './recharges.service';
import { CreateRechargeDto } from './dto/create-recharge.dto';

@Controller('recharges')
export class RechargesController {
  constructor(private readonly rechargesService: RechargesService) {}

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('buy')
  async createRecharge(
    @Request() req: any,
    @Body() createRechargeDto: CreateRechargeDto
  ): Promise<any> {   
    return this.rechargesService.create(
      req.user.username,
      createRechargeDto.amount,
      createRechargeDto.phoneNumber
    )
  }
}
