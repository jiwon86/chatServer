import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService){}
    
  /** 회원 가입 */
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  /** 전체 목록 */
  @Get('all')
  findAll() {
    return this.usersService.findAll();
  }

  /** 단건 이메일 조회 */
  @Get('get')
  findOne(@Query('email') email: string) {
    return this.usersService.findByEmail(email);
  }

    /** JWT 인증이 필요한 API */
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Req() req){
    return req.user
  }


  /** 수정(PATCH) */
  @Patch(':email')
  update(
    @Param('email') email: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(email, dto);
  }

  /** 삭제 */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

}
