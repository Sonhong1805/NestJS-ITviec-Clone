import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserRepository } from 'src/databases/repositories/user.repository';
import * as argon2 from 'argon2';
import { LOGIN_TYPE, ROLE } from 'src/commons/enums/user.enum';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/databases/entities/user.entity';
import { LoginGoogleDto } from './dto/login-google.dto';
import { OAuth2Client } from 'google-auth-library';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { DataSource } from 'typeorm';
import { Company } from 'src/databases/entities/company.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Request, Response } from 'express';
import * as ms from 'ms';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { generateRandomCode, randomPassword } from 'src/commons/utils/random';
import { convertToSlug } from 'src/commons/utils/convertToSlug';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { StorageService } from '../storage/storage.service';
import { CompanyRepository } from 'src/databases/repositories/company.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly applicantRepository: ApplicantRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
    private readonly companyRepository: CompanyRepository,
    @InjectQueue('mail-queue') private mailQueue: Queue,
  ) {}

  async register(body: RegisterUserDto) {
    const { username, email, password } = body;
    const userRecord = await this.userRepository.findOneBy({ email });
    if (userRecord) {
      throw new HttpException('Email is already exist', HttpStatus.BAD_REQUEST);
    }

    const hashPassword = await argon2.hash(password);
    const newUser = await this.userRepository.save({
      username,
      email,
      password: hashPassword,
      loginType: LOGIN_TYPE.EMAIL,
      role: ROLE.APPLICANT,
    });

    await this.applicantRepository.save({
      userId: newUser.id,
    });

    await this.mailQueue.add('register-applicant', {
      name: username,
      email,
    });

    return {
      message: 'Register user successfully',
    };
  }

  async login(body: LoginDto, response: Response) {
    const { email, password } = body;

    const findUser = await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });
    if (!findUser) {
      throw new HttpException(
        'Account not found. Please check your email or sign up.',
        HttpStatus.NOT_FOUND,
      );
    }

    const isPasswordValid = await argon2.verify(findUser.password, password);
    if (!isPasswordValid) {
      throw new HttpException(
        'Incorrect email address or password',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (findUser.deletedAt) {
      throw new HttpException(
        'Your account has been deleted. Please sign up new account to continue using ITviec',
        HttpStatus.BAD_REQUEST,
      );
    }

    const {
      id,
      username,
      phoneNumber,
      loginType,
      role,
      createdAt,
      updatedAt,
      deletedAt,
    } = findUser;
    const payload = {
      id,
      username,
      phoneNumber,
      loginType,
      role,
      email,
      createdAt,
      updatedAt,
      deletedAt,
    };

    const newAccessToken = await this.createAccessToken(payload);
    const newRefreshToken = await this.createRefreshToken(payload);
    await this.userRepository.update(
      {
        email,
      },
      {
        refreshToken: newRefreshToken,
      },
    );

    response.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      maxAge: ms(this.configService.get('jwt').refreshTokenExpires),
    });

    payload['avatar'] = await this.getAvatar(findUser);

    return {
      message: 'Login successfully',
      result: {
        accessToken: newAccessToken,
        user: payload,
      },
    };
  }

  async account(user: User) {
    const userInfo = await this.userRepository.findOne({
      where: {
        id: user.id,
      },
    });

    delete userInfo.password;
    delete userInfo.refreshToken;

    userInfo['avatar'] = await this.getAvatar(user);

    return {
      message: 'get user info successfully',
      result: userInfo,
    };
  }

  async getAvatar(user: User): Promise<string> {
    const findApplicant = await this.applicantRepository.findOneBy({
      userId: user.id,
    });
    if (findApplicant?.avatar && user.loginType !== LOGIN_TYPE.GOOGLE) {
      return await this.storageService.getSignedUrl(findApplicant.avatar);
    }
    if (findApplicant?.avatar && user.loginType === LOGIN_TYPE.GOOGLE) {
      return findApplicant?.avatar;
    }
    const findCompany = await this.companyRepository.findOneBy({
      userId: user.id,
    });
    if (findCompany?.logo) {
      return await this.storageService.getSignedUrl(findCompany.logo);
    }

    return '';
  }

  async refresh(request: Request, response: Response) {
    const refreshTokenCookie = request.cookies['refresh_token'];

    if (!refreshTokenCookie) {
      throw new BadRequestException('token invalid');
    }

    const findUser = await this.userRepository.findOne({
      where: {
        refreshToken: refreshTokenCookie,
      },
    });

    if (!findUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    try {
      const { id, username, loginType, role, createdAt, updatedAt, deletedAt } =
        findUser;
      const payload = {
        id,
        username,
        loginType,
        role,
        createdAt,
        updatedAt,
        deletedAt,
      };

      const newAccessToken = await this.createAccessToken(payload);
      const newRefreshToken = await this.createRefreshToken(payload);
      await this.userRepository.update(
        {
          id,
        },
        {
          refreshToken: newRefreshToken,
        },
      );

      payload['avatar'] = await this.getAvatar(findUser);

      response.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        maxAge: ms(this.configService.get('jwt').refreshTokenExpires),
      });

      return {
        message: 'Refresh Token successfully',
        result: {
          accessToken: newAccessToken,
          user: payload,
        },
      };
    } catch (error) {
      throw new BadRequestException('Refresh Token failed');
    }
  }

  async createAccessToken(payload: any): Promise<any> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt').accessTokenSecret,
      expiresIn: this.configService.get('jwt').accessTokenExpires,
    });
    return accessToken;
  }

  async createRefreshToken(payload: any): Promise<any> {
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt').refreshTokenSecret,
      expiresIn: this.configService.get('jwt').refreshTokenExpires,
    });
    return refreshToken;
  }

  async loginGoogle(body: LoginGoogleDto, response: Response) {
    const { token } = body;

    const ggClientId = this.configService.get('google').clientId;
    const ggClientSecret = this.configService.get('google').clientSecret;
    const oAuthClient = new OAuth2Client(ggClientId, ggClientSecret);
    const ggLoginTicket = await oAuthClient.verifyIdToken({
      idToken: token,
      audience: ggClientId,
    });

    const { email_verified, email, name, picture } = (
      await ggLoginTicket
    ).getPayload();
    if (!email_verified) {
      throw new HttpException(
        'Email is not verified' + email,
        HttpStatus.FORBIDDEN,
      );
    }

    let findUser = await this.userRepository.findOneBy({
      email,
      loginType: LOGIN_TYPE.GOOGLE,
    });

    if (findUser && findUser.loginType === LOGIN_TYPE.EMAIL) {
      throw new HttpException(
        'Email use to login:' + email,
        HttpStatus.FORBIDDEN,
      );
    }

    if (!findUser) {
      findUser = await this.userRepository.save({
        email,
        username: name,
        loginType: LOGIN_TYPE.GOOGLE,
        role: ROLE.APPLICANT,
      });
      await this.applicantRepository.save({
        userId: findUser.id,
        avatar: picture,
      });
    }

    const {
      id,
      username,
      phoneNumber,
      loginType,
      role,
      createdAt,
      updatedAt,
      deletedAt,
    } = findUser;
    const payload = {
      id,
      username,
      phoneNumber,
      loginType,
      role,
      createdAt,
      updatedAt,
      deletedAt,
    };

    const newAccessToken = await this.createAccessToken(payload);
    const newRefreshToken = await this.createRefreshToken(payload);
    await this.userRepository.update(
      {
        email,
      },
      {
        refreshToken: newRefreshToken,
      },
    );

    response.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      maxAge: ms(this.configService.get('jwt').refreshTokenExpires),
    });

    payload['avatar'] = picture || '';

    return {
      message: 'Login with google successfully',
      result: {
        accessToken: newAccessToken,
        user: payload,
      },
    };
  }

  async registerCompany(body: RegisterCompanyDto) {
    const {
      username,
      email,
      position,
      phoneNumber,
      companyName,
      location,
      website,
    } = body;

    const password = randomPassword();

    const userRecord = await this.userRepository.findOneBy({ email });
    if (userRecord) {
      throw new HttpException('Email is already exist', HttpStatus.BAD_REQUEST);
    }

    const hashPassword = await argon2.hash(password);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      const newUser = await queryRunner.manager.save(User, {
        username,
        email,
        phoneNumber,
        password: hashPassword,
        loginType: LOGIN_TYPE.EMAIL,
        role: ROLE.COMPANY,
      });
      const slug = convertToSlug(companyName);

      await queryRunner.manager.save(Company, {
        userId: newUser.id,
        position,
        name: companyName,
        slug,
        location,
        website,
      });
      await queryRunner.commitTransaction();

      await this.mailQueue.add('register-company', {
        name: username,
        email,
        password,
        company: companyName,
      });

      return {
        message: 'Register company successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async logout(user: User, response: Response) {
    await this.userRepository.update(
      { id: user.id },
      {
        refreshToken: null,
      },
    );
    response.clearCookie('refresh_token');
    return {
      message: 'logout successfully',
    };
  }

  async forgotPassword(body: ForgotPasswordDto) {
    const { email, isCompany } = body;
    const findEmail = await this.userRepository.findOneBy({ email });
    if (!findEmail) {
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
    }

    if (isCompany) {
      const findEmailCompany = await this.userRepository.findOneBy({
        email,
        role: ROLE.COMPANY,
      });
      if (!findEmailCompany) {
        throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
      }
    }

    const clientUrl = this.configService.get('clientUrl');

    await this.mailQueue.add('forgot-password', {
      email,
      path: isCompany ? clientUrl + '/employer' : clientUrl,
    });
    return {
      message: 'send mail to reset password successfully',
    };
  }

  async resetPassword(body: ResetPasswordDto) {
    const { email, password } = body;
    const findEmail = await this.userRepository.findOneBy({ email });
    if (!findEmail) {
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
    }
    const hashPassword = await argon2.hash(password);

    await this.userRepository.update(
      {
        email,
      },
      {
        password: hashPassword,
      },
    );
    return {
      message: 'reset password successfully',
    };
  }

  async changePassword(body: ChangePasswordDto, user: User) {
    const { currentPassword, newPassword } = body;
    const findUser = await this.userRepository.findOneBy({ id: user.id });
    if (!findUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const isMatch = await argon2.verify(findUser.password, currentPassword);
    if (!isMatch) {
      throw new HttpException(
        'Update new password failed!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashPassword = await argon2.hash(newPassword);

    const updatedPassword = await this.userRepository.update(
      {
        id: findUser.id,
      },
      {
        password: hashPassword,
      },
    );

    const clientUrl = this.configService.get('clientUrl');

    await this.mailQueue.add('change-password', {
      username: findUser.username,
      email: findUser.email,
      path: clientUrl,
    });
    return {
      message: 'Update password successfully',
      result: updatedPassword ? true : false,
    };
  }

  async createDeleteCode(user: User) {
    const findUser = await this.userRepository.findOneBy({ id: user.id });
    if (!findUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const randomDeleteCode = generateRandomCode(24);
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);

    const updatedUserCode = await this.userRepository.update(
      {
        id: user.id,
      },
      {
        deleteCode: randomDeleteCode,
        deleteCodeExpiresAt: expiresAt,
      },
    );
    await this.mailQueue.add('delete-account', {
      username: findUser.username,
      email: findUser.email,
      code: randomDeleteCode,
    });
    return {
      message: 'Created delete code successfully',
      result: updatedUserCode ? true : false,
    };
  }

  async deleteAccount(body: DeleteAccountDto, user: User) {
    const findUser = await this.userRepository.findOneBy({ id: user.id });
    if (!findUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const now = new Date();
    if (findUser.deleteCodeExpiresAt < now) {
      throw new HttpException(
        'The delete code has expired. Please request a new code.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { code } = body;
    if (findUser.deleteCode === code) {
      const result = await this.userRepository.softDelete(user.id);
      return {
        message: 'Delete account successfully',
        result: result ? true : false,
      };
    } else {
      throw new HttpException(
        'The code you entered is incorrect or no longer valid. Please double-check and try again.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
