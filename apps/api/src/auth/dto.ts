import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';
export class RegisterDto {
  @ApiProperty() @IsEmail() email!: string;

  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) password!: string;

  @ApiPropertyOptional({ example: '+15551234567' })
  @IsOptional()
  @Matches(/^\+[1-9]\d{7,14}$/)
  phone?: string;
}
export class LoginDto {
  @ApiProperty() @IsEmail() email!: string;

  @ApiProperty() @IsString() password!: string;
}
export class TargetDto {
  @ApiProperty() @IsEmail() email!: string;
}
export class PhoneDto {
  @ApiProperty({ example: '+15551234567' }) @Matches(/^\+[1-9]\d{7,14}$/) phone!: string;
}
export class EmailCodeDto extends TargetDto {
  @ApiProperty({ example: '123456' }) @Matches(/^\d{6}$/) code!: string;
}
export class PhoneLoginDto extends PhoneDto {
  @ApiProperty({ example: '123456' }) @Matches(/^\d{6}$/) code!: string;
}
export class ResetPasswordDto extends TargetDto {
  @ApiProperty() @Matches(/^\d{6}$/) code!: string;

  @ApiProperty({ minLength: 8 }) @MinLength(8) password!: string;
}
