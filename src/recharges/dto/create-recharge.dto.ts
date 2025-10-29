import { IsNumber, IsMobilePhone } from 'class-validator';

export class CreateRechargeDto {
  @IsNumber()
  amount: number;

  @IsMobilePhone('es-CO')
  phoneNumber: string;
}
