import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransactionsModule } from '../transactions/transactions.module';
import { TransactionsService } from '../transactions/transactions.service';
import { Transaction } from '../transactions/entities/transaction.entity';

import { RechargesController } from './recharges.controller';
import { RechargesService } from './recharges.service';
import { Recharge } from './entities/recharge.entity';

@Module({
  controllers: [RechargesController],
  providers: [RechargesService, TransactionsService],
  imports: [TransactionsModule, TypeOrmModule.forFeature([Transaction, Recharge])]
})
export class RechargesModule {}
