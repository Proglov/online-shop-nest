import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { PasswordProvider } from 'src/auth/providers/password.provider';
import { TCreateUser, TFindUserByIdentifier } from './dto/types';
import { badRequestException, requestTimeoutException } from 'src/common/errors';


/** Class to preform business operations related to the users, used by other modules mostly */
@Injectable()
export class UsersProvider {

    /** Inject the dependencies */
    constructor(
        /**  Inject the User Model */
        @InjectModel(User.name)
        private readonly userModel: Model<User>,

        /** Inject the PasswordProvider from auth module */
        @Inject(forwardRef(() => PasswordProvider))
        private readonly passwordProvider: PasswordProvider
    ) { }

    /**
     * Create a single User
     */
    async create(createUserDto: CreateUserDto): Promise<TCreateUser> {
        try {
            const hashedPassword = await this.passwordProvider.hashPassword(createUserDto.password)
            const createdUser = new this.userModel({ ...createUserDto, password: hashedPassword });

            //TODO you should check the existingSellerByPhone and username. email is fine i guess

            const newUser = (await createdUser.save()).toObject();
            delete newUser.password
            return newUser
        } catch (error) {
            //* mongoose duplication error
            if (error?.code === 11000) {
                const DB_Error = Object.keys(error?.keyPattern)[0]
                switch (DB_Error) {
                    case 'email':
                        throw badRequestException('این ایمیل قبلا ثبت نام شده است')
                    case 'phone':
                        throw badRequestException('این شماره قبلا ثبت نام شده است')
                    case 'username':
                        throw badRequestException('این نام کاربری قبلا ثبت نام شده است')
                }
            }
            throw requestTimeoutException('مشکلی در ثبت کاربر رخ داده است')
        }
    }

    /**
     * find a single User by Identifiers, doesn't return the password
     */
    async findOneByIdentifier(input: TFindUserByIdentifier): Promise<User> {
        try {
            const existingUser = await this.userModel.findOne(input).select('-password');
            return existingUser;
        } catch (error) {
            if (error.name == 'CastError')
                throw badRequestException('آیدی کاربر صحیح نمیباشد')
            throw requestTimeoutException('مشکلی در پیدا کردن کاربر رخ داده است')
        }
    }

    /**
     * find a single User by Identifiers, returns only the password
     */
    async findOneByIdentifierAndGetPassword(input: TFindUserByIdentifier): Promise<Pick<User, 'password'>> {
        try {
            const existingUser = await this.userModel.findOne(input).select('password');
            return existingUser;
        } catch (error) {
            if (error.name == 'CastError')
                throw badRequestException('آیدی کاربر صحیح نمیباشد')
            throw requestTimeoutException('مشکلی در پیدا کردن کاربر رخ داده است')
        }
    }

    /**
     * find a single User by Id, doesn't return the password
     */
    async findOneByID(id: string): Promise<User> {
        try {
            const existingUser = await this.userModel.findById(id).select('-password');
            return existingUser;
        } catch (error) {
            if (error.name == 'CastError')
                throw badRequestException('آیدی کاربر صحیح نمیباشد')
            throw requestTimeoutException('مشکلی در پیدا کردن کاربر رخ داده است')
        }
    }

}