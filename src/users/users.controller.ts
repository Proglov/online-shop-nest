import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-types';
import { CurrentUserData } from 'src/auth/interfacesAndType/current-user-data.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { RestrictedUser } from './dto/types';
import { FindOneDto } from 'src/common/findOne.dto';


/** End points related to the users */
@ApiTags('Users')
@Controller('users')
export class UsersController {

    /** Inject the dependencies */
    constructor(
        /** Inject the Users Service */
        private readonly userService: UsersService
    ) { }


    /**
     * find a single User using their extracted Id, doesn't return the password
     * Authenticated Users Only
     */
    @Auth(AuthType.Bearer)
    @Get('get-me')
    @ApiOperation({ summary: 'user gets its own data' })
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'User found', type: RestrictedUser })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User Not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
    async getMe(
        @CurrentUser() userInfo: CurrentUserData
    ): Promise<RestrictedUser> {
        return this.userService.findOne({ id: userInfo.userId });
    }

    /**
     * find a single User by Id, doesn't return the password
     * Admin Only
     */
    @Auth(AuthType.Admin)
    @Get(':id')
    @ApiOperation({ summary: 'returns a specific user based on its id' })
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'User found', type: RestrictedUser })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User Not found' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'User Id is not correct' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
    async findOne(
        @Param() findOneDtoFindOneDto: FindOneDto
    ): Promise<RestrictedUser> {
        return this.userService.findOne(findOneDtoFindOneDto);
    }
}