import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ){}

    @Post('login')
    async login(
        @Body('email') email: string,
        @Body('password') password: string
    ){
        const user = await this.authService.vaildateUser(email,password);
        return this.authService.login(user);
    }
}