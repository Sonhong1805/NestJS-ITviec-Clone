import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from 'src/commons/decorators/public.decorator';
import { LoginGoogleDto } from './dto/login-google.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { GetUser } from 'src/commons/decorators/get-current-user.decorator';
import { User } from 'src/databases/entities/user.entity';
import { Roles } from 'src/commons/decorators/roles.decorator';
import { ROLE } from 'src/commons/enums/user.enum';
import { Request, Response } from 'express';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';

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
  login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(body, response);
  }

  @Roles(ROLE.ADMIN, ROLE.APPLICANT, ROLE.COMPANY)
  @Get('account')
  account(@GetUser() user: User) {
    return this.authService.account(user);
  }

  @Public()
  @Post('login-google')
  loginGoogle(
    @Body() body: LoginGoogleDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.loginGoogle(body, response);
  }

  @Public()
  @Get('refresh')
  refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.refresh(request, response);
  }

  @Roles(ROLE.ADMIN, ROLE.APPLICANT, ROLE.COMPANY)
  @Post('logout')
  logout(
    @GetUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logout(user, response);
  }

  @Public()
  @Post('register-company')
  registerCompany(@Body() body: RegisterCompanyDto) {
    return this.authService.registerCompany(body);
  }
  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @Roles(ROLE.ADMIN, ROLE.APPLICANT, ROLE.COMPANY)
  @Post('change-password')
  changePassword(@Body() body: ChangePasswordDto, @GetUser() user: User) {
    return this.authService.changePassword(body, user);
  }

  @Roles(ROLE.APPLICANT)
  @Get('delete-code')
  createDeleteCode(@GetUser() user: User) {
    return this.authService.createDeleteCode(user);
  }

  @Roles(ROLE.APPLICANT)
  @Post('delete-account')
  deleteAccount(@Body() body: DeleteAccountDto, @GetUser() user: User) {
    return this.authService.deleteAccount(body, user);
  }
}
