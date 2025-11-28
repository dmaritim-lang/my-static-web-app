import { IsNumber, IsPhoneNumber, IsString } from 'class-validator';

export class MpesaC2BDto {
  @IsString()
  accountReference!: string; // vehicle plate

  @IsPhoneNumber('KE')
  msisdn!: string;

  @IsNumber()
  amount!: number;

  @IsString()
  transactionId!: string;
}

export class MpesaC2BValidationDto {
  @IsString()
  TransID!: string;

  @IsString()
  TransTime!: string;

  @IsNumber()
  TransAmount!: number;

  @IsString()
  BusinessShortCode!: string;

  @IsString()
  BillRefNumber!: string; // vehicle plate

  @IsPhoneNumber('KE')
  MSISDN!: string;
}

export class MpesaB2CDto {
  @IsString()
  ownerId!: string;

  @IsPhoneNumber('KE')
  msisdn!: string;

  @IsNumber()
  amount!: number;

  @IsString()
  reference!: string;
}

export class MpesaB2BDto {
  @IsString()
  ownerId!: string;

  @IsString()
  destinationShortcode!: string;

  @IsNumber()
  amount!: number;

  @IsString()
  accountReference!: string;

  @IsString()
  reference!: string;
}
