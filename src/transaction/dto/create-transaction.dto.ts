
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsObject, IsPositive, IsString, Max, Min, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import messages from 'src/common/dto.messages';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { idDocGenerator } from 'src/common/findOne.dto';
import { BoughtProducts } from '../transaction.schema';
import { Volume } from '../enums/transaction.enums';


const addressDoc = {
    description: 'the address of the location',
    type: String,
    example: 'تهران سوهانک'
}

const quantityDoc = {
    description: 'the quantity of the tx, should be a number between 1 and 100',
    type: Number,
    example: 3
}

const volumeDoc = {
    enum: Object.values(Volume),
    description: 'the volume of the tx, should be a number either 30,50,100 ml',
    type: Number,
    example: Volume.V30
}

class BoughtProductsDto implements BoughtProducts {
    @ApiProperty(quantityDoc)
    @IsPositive(messages.isPositive('تعداد محصولات'))
    @Min(...messages.min('تعداد محصولات', 1))
    @Max(...messages.max('تعداد محصولات', 100))
    quantity: number;

    @ApiProperty(volumeDoc)
    @IsPositive(messages.isPositive('حجم محصولات'))
    @IsEnum(Volume, { message: messages.isEnum('حجم محصول', Volume).message })
    volume: number;

    @ApiProperty(idDocGenerator('productId', 'product'))
    @IsString(messages.isString('آیدی محصول'))
    @IsNotEmpty(messages.notEmpty('آیدی محصول'))
    productId: Types.ObjectId;
}

const boughtProductsDoc = {
    description: 'Array of bought Products Id with their quantity.',
    type: BoughtProductsDto,
    example: [
        { quantity: 4, productId: '67d80a025776f2ae1628725a', volume: 30 },
        { quantity: 6, productId: '67d953efbc7a803b1b24c58c', volume: 50 }
    ]
}

export class CreateTransactionDto {
    @ApiProperty(addressDoc)
    @IsString(messages.isString('آدرس ارسال'))
    @IsNotEmpty(messages.notEmpty('آدرس ارسال'))
    address: string;

    @ApiProperty(boughtProductsDoc)
    @ValidateNested({ each: true })
    @Type(() => BoughtProductsDto)
    @IsObject({ each: true })
    @IsArray(messages.isArray('آیدی محصولات خریداری شده به همراه تعداد'))
    @ArrayNotEmpty(messages.notEmpty('آیدی محصولات خریداری شده به همراه تعداد'))
    boughtProducts: BoughtProductsDto[];
}