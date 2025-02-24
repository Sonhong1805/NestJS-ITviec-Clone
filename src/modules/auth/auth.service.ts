import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserRepository } from 'src/databases/repositories/user.repository';
import * as argon2 from 'argon2';
import { LOGIN_TYPE, ROLE } from 'src/commons/enums/user.enum';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { User } from 'src/databases/entities/user.entity';
import { LoginGoogleDto } from './dto/login-google.dto';
import { OAuth2Client } from 'google-auth-library';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { DataSource } from 'typeorm';
import { Company } from 'src/databases/entities/company.entity';
import { MailService } from '../mail/mail.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly applicantRepository: ApplicantRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly companyRepository: CompanyRepository,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
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

    // await this.mailService.sendMail(
    //   email,
    //   'welcome to ITviec',
    //   'welcome-applicant',
    //   { name: username, email: email },
    // );

    await this.mailQueue.add('send-mail-applicant', {
      name: username,
      email,
    });

    return {
      message: 'Register user successfully',
    };
  }

  async login(body: LoginDto) {
    const { email, password } = body;
    const userRecord = await this.userRepository.findOneBy({ email });
    if (!userRecord) {
      throw new HttpException(
        'Incorrect Email address or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await argon2.verify(userRecord.password, password);
    if (!isPasswordValid) {
      throw new HttpException(
        'Incorrect Email address or password',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const payload = await this.getPayload(userRecord);
    const { accessToken, refreshToken } = await this.signToken(payload);

    return {
      message: 'Login successfully',
      result: {
        accessToken,
        refreshToken,
      },
    };
  }

  async refresh(body: RefreshTokenDto) {
    const { refreshToken } = body;
    const payloadRefresh = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get('jwtAuth').jwtRefreshTokenSecret,
    });
    const userRecord = await this.userRepository.findOneBy({
      id: payloadRefresh.id,
    });

    if (!userRecord) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const payload = await this.getPayload(userRecord);
    const { accessToken, refreshToken: newRefreshToken } =
      await this.signToken(payload);
    return {
      message: 'Refresh Token successfully',
      result: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    };
  }

  async getPayload(user: User) {
    return {
      id: user.id,
      username: user.username,
      loginType: user.loginType,
      role: user.role,
    };
  }

  async signToken(payloadAccess) {
    const payloadRefresh = {
      id: payloadAccess.id,
    };

    const accessToken = await this.jwtService.signAsync(payloadAccess, {
      secret: this.configService.get('jwtAuth').jwtAccessTokenSecret,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payloadRefresh, {
      secret: this.configService.get('jwtAuth').jwtRefreshTokenSecret,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async loginGoogle(body: LoginGoogleDto) {
    const { token } = body;
    const ggClientId = this.configService.get('google').clientId;
    const ggClientSecret = this.configService.get('google').clientSecret;
    const oAuthClient = new OAuth2Client(ggClientId, ggClientSecret);
    const ggLoginTicket = await oAuthClient.verifyIdToken({
      idToken: token,
      audience: ggClientId,
    });

    const { email_verified, email, name } = (await ggLoginTicket).getPayload();
    if (!email_verified) {
      throw new HttpException(
        'Email is not verified' + email,
        HttpStatus.FORBIDDEN,
      );
    }

    let userRecord = await this.userRepository.findOneBy({
      email,
      loginType: LOGIN_TYPE.GOOGLE,
    });

    if (userRecord && userRecord.loginType === LOGIN_TYPE.EMAIL) {
      throw new HttpException(
        'Email use to login:' + email,
        HttpStatus.FORBIDDEN,
      );
    }

    if (!userRecord) {
      userRecord = await this.userRepository.save({
        email,
        username: name,
        loginType: LOGIN_TYPE.GOOGLE,
      });

      await this.applicantRepository.save({
        userId: userRecord.id,
      });
    }

    const payload = await this.getPayload(userRecord);
    const { accessToken, refreshToken: newRefreshToken } =
      await this.signToken(payload);
    return {
      message: 'Login with google successfully',
      result: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    };
  }

  async registerCompany(body: RegisterCompanyDto) {
    const {
      username,
      email,
      password,
      companyName,
      companyAddress,
      companyWebsite,
    } = body;

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
        password: hashPassword,
        loginType: LOGIN_TYPE.EMAIL,
        role: ROLE.COMPANY,
      });

      await queryRunner.manager.save(Company, {
        userId: newUser.id,
        name: companyName,
        location: companyAddress,
        website: companyWebsite,
      });
      await queryRunner.commitTransaction();

      await this.mailQueue.add('send-mail-company', {
        name: username,
        email,
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
}
