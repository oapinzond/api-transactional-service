import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

import { AuthGuard } from '../auth/auth.guard';

import { RechargesService } from './recharges.service';
import { CreateRechargeDto } from './dto/create-recharge.dto';

interface RequestUser {
  userId: number;
  username: string;
}

@Controller('recharges')
export class RechargesController {
  constructor(private readonly rechargesService: RechargesService) {}

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('buy')
  async createRecharge(@Request() req: ExpressRequest & { user: RequestUser }, @Body() createRechargeDto: CreateRechargeDto): Promise<any> {
    return this.rechargesService.create(req.user.username, createRechargeDto.amount, createRechargeDto.phoneNumber);
  }

  @UseGuards(AuthGuard)
  @Get('history')
  async findRecharges(@Request() req: ExpressRequest & { user: RequestUser }): Promise<any> {
    return this.rechargesService.findByUser(req.user.username);
  }
}
