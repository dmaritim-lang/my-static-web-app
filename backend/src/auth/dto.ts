import { IsIn, IsNotEmpty, IsPhoneNumber, MinLength } from 'class-validator';

export class RegisterDto {
  @IsPhoneNumber('KE')
  phone!: string;

  @MinLength(4)
  password!: string;

  @IsIn(['passenger', 'owner', 'sacco_admin'])
  role!: 'passenger' | 'owner' | 'sacco_admin';
}

export class LoginDto {
  @IsPhoneNumber('KE')
  phone!: string;

  @IsNotEmpty()
  password!: string;
}
