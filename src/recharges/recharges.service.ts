import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TransactionsService } from '../transactions/transactions.service';
import { Transaction } from '../transactions/entities/transaction.entity';

import { Recharge } from './entities/recharge.entity';

@Injectable()
export class RechargesService {
  constructor(
    @InjectRepository(Recharge)
    private readonly rechargesRepository: Repository<Recharge>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly transactionsService: TransactionsService
  ) {}

  async create(userId: string, amount: number, phoneNumber: string): Promise<any> {
    if (amount < 1000 || amount > 100000) {
      throw new ConflictException('Monto no válido');
    }

    // Registrar el ID de transacción en base de datos
    const transaction = await this.transactionsService.create(amount, userId);

    const recharge = new Recharge();
    recharge.phone_number = phoneNumber;
    recharge.transaction_id = transaction.id;
    recharge.created_at = new Date().toISOString();

    // Registrar el número de la recarga en base de datos
    const new_recharge = await this.rechargesRepository.save(recharge);

    return {
      id: transaction.id,
      phoneNumber: new_recharge.phone_number,
      amount: transaction.amount,
      userId: transaction.user_id,
      createdAt: transaction.created_at
    };
  }

  async findByUser(userId: string): Promise<any> {
    const transactionsByUser = await this.transactionsRepository
      .createQueryBuilder('a')
      .innerJoinAndSelect('a.recharge', 'b')
      .where('a.user_id = :userId', { userId: userId })
      .select([
        'a.id AS id',
        'b.phone_number AS phoneNumber',
        'a.amount AS amount',
        'a.user_id AS userId',
        'a.created_at AS createdAt'
      ])
      .orderBy('a.created_at', 'ASC')
      .getRawMany();

    if (transactionsByUser.length === 0) {
      throw new NotFoundException();
    }

    return transactionsByUser;
  }
}
