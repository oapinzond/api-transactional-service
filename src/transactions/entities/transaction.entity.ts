import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';

import { Recharge } from 'src/recharges/entities/recharge.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryColumn()
  id: string;

  @Column()
  amount: number;

  @Column()
  user_id: string;

  @Column()
  created_at: string;

  @OneToOne(() => Recharge, (recharge) => recharge.transaction)
  recharge: Recharge;
}
