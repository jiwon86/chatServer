import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

  // TypeORM 레포지토리를 DI로 주입
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ){}

  // 가입
  async createUser(dto: CreateUserDto): Promise<User>{
    //1 : 중복 이메일 체크
    const exists = await this.userRepo.findOne({
      where : { email: dto.email},
    });

    if (exists) throw new ConflictException('이미 가입된 메일 입니다.');

    // 2) 비밀번호 해시
    const hash = await bcrypt.hash(dto.password, 10);

    // 3) 엔티티 생성 & 저장
    const entity = this.userRepo.create({ 
      email: dto.email,
      name: dto.name,
      password: hash });
    return this.userRepo.save(entity);
  }

  /** 전체 목록 */
  findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

    /** 단건 조회 */
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findOne({ 
      // select: { 
      //   id: true,
      //   email: true,
      // },
      where: { email } });
    if (!user) throw new NotFoundException(`${email} 사용자를 찾을 수 없습니다.`);
    return user;
  }

    /** 수정(PATCH) */
  async update(email: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findByEmail(email);      // 존재 확인
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  /** 삭제 */
  async remove(id: number): Promise<void> {
    await this.userRepo.delete(id);
  }

}
