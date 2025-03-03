import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { Public } from 'src/commons/decorators/public.decorator';
import { LoginGoogleDto } from './dto/login-google.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { GetCurrentUser } from 'src/commons/decorators/get-current-user.decorator';
import { User } from 'src/databases/entities/user.entity';
import { Roles } from 'src/commons/decorators/roles.decorator';
import { ROLE } from 'src/commons/enums/user.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('register')
  register(@Body() body: RegisterUserDto) {
    return this.authService.register(body);
  }

  @Public()
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Roles(ROLE.ADMIN, ROLE.APPLICANT, ROLE.COMPANY)
  @Get('account')
  account(@GetCurrentUser() user: User) {
    return this.authService.account(user);
  }

  @Public()
  @Post('login-google')
  loginGoogle(@Body() body: LoginGoogleDto) {
    return this.authService.loginGoogle(body);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body);
  }

  @Public()
  @Post('register-company')
  registerCompany(@Body() body: RegisterCompanyDto) {
    return this.authService.registerCompany(body);
  }
}
