// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';                         // JWT 발급/검증용 모듈
import { PassportModule } from '@nestjs/passport';               // 인증 전략을 처리해주는 Nest 래퍼
import { AuthService } from './auth.service';                    // 로그인 & 토큰 발급 핵심 로직
import { AuthController } from './auth.controller';              // /auth/login 라우터
import { JwtStrategy } from './jwt.strategy';                    // JWT 검증 전략 (헤더에서 토큰 추출 & 디코딩)
import { UsersModule } from 'src/users/users.module';            // 사용자 조회에 필요
import { ConfigModule, ConfigService } from '@nestjs/config';    // 환경변수 로딩을 위한 Nest 모듈

@Module({
  imports: [
    UsersModule,           // AuthService 내부에서 UsersService를 사용하기 위해 의존성 주입
    PassportModule,        // Nest에서 제공하는 Passport 래퍼 모듈 (Guard 등 사용 가능해짐)
    ConfigModule,          // .env 사용을 위해 글로벌 등록 (ConfigService 주입 가능)

    /**
     * JWT 설정 비동기 등록
     *  - 환경변수로부터 secret 키를 로딩
     *  - 토큰 유효기간을 1시간으로 설정
     */
    JwtModule.registerAsync({
      imports: [ConfigModule],         // ConfigService 주입을 위해 필요
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get('JWT_SECRET'), // .env → JWT_SECRET 값을 사용
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],

  providers: [
    AuthService,  // 로그인 및 JWT 발급 로직 담당
    JwtStrategy,  // 토큰 검증 전략 (PassportStrategy)
  ],

  controllers: [AuthController], // /auth/login 엔드포인트 제공
})
export class AuthModule {}
