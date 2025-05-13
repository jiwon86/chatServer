import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * PartialType ➜ 모든 필드를 optional 로 복사
 *   PUT 말고 PATCH 방식을 가정
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}