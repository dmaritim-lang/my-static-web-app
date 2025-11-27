import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SplitRule } from '../common/in-memory.store';

class SplitRuleDto implements SplitRule {
  @IsString()
  label!: string;

  @IsString()
  accountType!: SplitRule['accountType'];

  @IsNumber()
  @Min(0)
  @Max(100)
  percentage!: number;
}

export class RegisterVehicleDto {
  @IsString()
  ownerId!: string;

  @IsString()
  plate!: string;

  @IsOptional()
  @IsString()
  saccoId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SplitRuleDto)
  splitRules!: SplitRuleDto[];
}
