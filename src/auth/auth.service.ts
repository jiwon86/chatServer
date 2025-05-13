import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    // 이메일, 비밀번호 확인
    async vaildateUser(email:string, password: string):Promise<any>{
        const user = await this.usersService.findByEmail(email);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');

        // 비밀번호 제거 후 반환
        const { password: _, ...result } = user;
        return result;
    }

    // JWT 발급
    async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

}

