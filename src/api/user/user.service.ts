import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Roles } from 'src/common/enum';
import { config } from 'src/config';
import { User } from 'src/core/entity/user.entity';
import { BaseService } from 'src/infrastructure/base/base.service';
import { CryptoService } from 'src/infrastructure/crypt/Crypto';
import { successRes } from 'src/infrastructure/response/success';
import { IToken } from 'src/infrastructure/token/interface';
import { TokenService } from 'src/infrastructure/token/Token';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { SignInDto } from './dto/signIn.dto';
import { ISuccess } from 'src/infrastructure/response/success.interface';

@Injectable()
export class UserService
  extends BaseService<CreateUserDto, UpdateUserDto, User>
  implements OnModuleInit
{
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly crypto: CryptoService,
    private readonly tokenService: TokenService,
  ) {
    super(userRepo);
  }

  async onModuleInit(): Promise<void> {
    try {
      const existsSuperadmin = await this.userRepo.findOne({
        where: { role: Roles.SUPERADMIN },
      });

      const hashedPassword = await this.crypto.encrypt(config.ADMIN_PASSWORD);
      if (!existsSuperadmin) {
        const superadmin = this.userRepo.create({
          email: config.ADMIN_EMAIL,
          hashed_password: hashedPassword,
          full_name: config.ADMIN_USERNAME,
          role: Roles.SUPERADMIN,
        });

        await this.userRepo.save(superadmin);
        console.log('Super admin created successfully');
      }
    } catch (error) {
      throw new InternalServerErrorException('Error on creaeting super admin');
    }
  }

  async createUser(creteUserDto: CreateUserDto, role: Roles): Promise<ISuccess> {
    const { password, email } = creteUserDto;
    let existsEmail: any = await this.userRepo.findOne({
      where: { email },
    });

    if (existsEmail) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.crypto.encrypt(password);
    const newUser = this.userRepo.create({
      full_name: creteUserDto.full_name,
      email,
      hashed_password: hashedPassword,
      role,
    });
    await this.userRepo.save(newUser);
    return successRes(newUser, 201);
  }

  async signIn(signIn: SignInDto, res: Response): Promise<ISuccess> {
    const {email,password} = signIn;
    const user = await this.userRepo.findOne({ where: { email } });
    const isMatchPassword = await this.crypto.decrypt(
      password,
      user?.hashed_password || '',
    );
    if (!user || !isMatchPassword) {
      throw new BadRequestException('Email or password incorrect');
    }
    const payload: IToken = {
      id: user.id,
      role: user.role,
    };
    const accessToken = await this.tokenService.accessToken(payload);
    const refreshToken = await this.tokenService.refreshToken(payload);
    await this.tokenService.writeCookie(res, 'adminToken', refreshToken, 15);
    return successRes({ token: accessToken });
  }
  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    userToken: IToken,
  ): Promise<ISuccess> {
    const { full_name, email, password } = updateUserDto;
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    let fullName = user.full_name;
    if (full_name) {
      fullName = full_name;
    }
    if (email) {
      const existsEmail = await this.userRepo.findOne({
        where: { email },
      });
      if (existsEmail && existsEmail.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }
    let hashedPassword = user?.hashed_password;
    if (password) {
      if(userToken.role === Roles.SUPERADMIN || userToken.id === user.id) {
        hashedPassword = await this.crypto.encrypt(password);
      }
    }
    await this.userRepo.update(
      { id },
      { email, hashed_password: hashedPassword, full_name: fullName },
    );
    const data = await this.findOneById(id);
    return successRes(data);
  }
}
