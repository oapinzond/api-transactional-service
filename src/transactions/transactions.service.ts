import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { Transaction } from './interfaces/transaction.interface';

@Injectable()
export class TransactionsService {
  async create(amount: number, userId: string): Promise<Transaction> {
    const transaction: Transaction = {
      id: randomUUID(),
      amount: amount,
      userId: userId,
      createdAt: new Date()
    };

    return transaction;
  }
}
