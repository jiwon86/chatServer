// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';

@Module({
  // 1) .env → ConfigService 전역 주입
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // 2) DB 커넥션 설정을 비동기 팩토리로 작성
    //    └ .env 값이 아직 로딩되지 않았을 타이밍에서도 안전
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],          // ConfigService 의존성 주입
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        /** 
         * .env에 DB_SSL=true 라면 TLS를 강제
         *   – AWS RDS 기본값(rds.force_ssl=1)을 만족
         *   – local/docker 개발용 DB는 false로 두면 편리
         */
        const sslEnabled = cfg.get('DB_SSL') === 'true';
        
        const caPath = join(process.cwd(),           // ← 실행 시점의 루트
                          cfg.get('RDS_CA_PATH')   // .env에서 지정
                      || 'rds-ca.pem');      // 기본값
        return {
          // ─────────────── 기본 DB 접속 파라미터 ───────────────
          type: 'postgres',
          host: cfg.get('DB_HOST'),     // DNS 엔드포인트
          port: cfg.get<number>('DB_PORT', 5432),
          username: cfg.get('DB_USER'),
          password: cfg.get('DB_PASS'),
          database: cfg.get('DB_NAME', 'postgres'),

          // 엔티티 자동 인식 (빌드된 JS, 개발 시 TS 모두)
          entities: [__dirname + '/../**/*.entity.{ts,js}'],

          // dev 단계만 true → production 에선 마이그레이션 사용
          synchronize: true,

          logging: ['error', 'schema'], // 필요 시 'query' 도 추가

          

          // ─────────────── TLS(SSL) 설정 영역 ───────────────
          ssl: sslEnabled
            ? {
                /**
                 * RDS에서 내려받은 CA 번들을 읽어 *문자열*로 전달
                 *  - join() 사용: 운영/테스트 어느 경로에서도 안전
                 */
                ca: readFileSync(caPath).toString(),
                rejectUnauthorized: true,
              }
            : undefined,

          /**
           * node-postgres(PG) 드라이버가 내부적으로 `ssl` 옵션을
           * 중첩해서 요구할 때가 있어 extra.ssl 도 같이 넘김
           *  - sslEnabled가 false면 keys가 완전히 사라지므로
           *    plain 커넥션에 영향을 주지 않음
           */
          extra: sslEnabled
            ? { ssl: { rejectUnauthorized: false } }
            : {},
        };
      },
    }),
  ],
})
export class DatabaseModule {}
