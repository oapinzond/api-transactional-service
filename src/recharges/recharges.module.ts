import { Module } from '@nestjs/common';

import { TransactionsModule } from 'src/transactions/transactions.module';
import { TransactionsService } from 'src/transactions/transactions.service';

import { RechargesController } from './recharges.controller';
import { RechargesService } from './recharges.service';

@Module({
  controllers: [RechargesController],
  providers: [RechargesService, TransactionsService],
  imports: [TransactionsModule]
})
export class RechargesModule {}
