import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>
  ) {}

  async create(amount: number, userId: string): Promise<Transaction> {
    const transaction = new Transaction();
    transaction.id = randomUUID();
    transaction.amount = amount;
    transaction.user_id = userId;
    transaction.created_at = new Date().toISOString();

    // Registrar transacción en base de datos
    return await this.transactionsRepository.save(transaction);
  }
}
