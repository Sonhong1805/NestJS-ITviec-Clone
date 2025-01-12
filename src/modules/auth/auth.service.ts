import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserRepository } from 'src/databases/repositories/user.repository';
import * as argon2 from 'argon2';
import { LOGIN_TYPE, ROLE } from 'src/commons/enums/user.enum';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly applicantRepository: ApplicantRepository,
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

    return {
      message: 'Register user successfully',
    };
  }
}
