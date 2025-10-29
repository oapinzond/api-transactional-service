import { ConflictException, Injectable } from '@nestjs/common';

import { TransactionsService } from 'src/transactions/transactions.service';

@Injectable()
export class RechargesService {
  constructor(private readonly transactionsService: TransactionsService) {}

  async create(userId: string, amount: number, phoneNumber: string): Promise<any> {
    if(amount < 1000 || amount > 100000 ) {
      throw new ConflictException('Monto no válido');
    }

    const transaction: any = await this.transactionsService.create(amount, userId);
    const recharge: any = {
      phoneNumber: phoneNumber,
      amount: amount
    };
  
    return {...transaction, ...recharge};
  }
}
