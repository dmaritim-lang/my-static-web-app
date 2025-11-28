import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UssdRequestDto {
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  input?: string;
}

export interface UssdSessionState {
  flow: 'main' | 'fare' | 'redeem' | 'owner' | 'register';
  step: number;
  data: Record<string, any>;
}

export interface UssdResponse {
  type: 'CON' | 'END';
  message: string;
}
