import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('recharges')
export class Recharge {
  @PrimaryColumn()
  transaction_id: string;

  @Column()
  phone_number: string;

  @Column()
  created_at: string;

  @OneToOne(() => Transaction, (transaction) => transaction.recharge)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;
}
