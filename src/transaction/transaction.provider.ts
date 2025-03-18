import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './transaction.schema';
import { Model } from 'mongoose';
import { badRequestException, requestTimeoutException } from 'src/common/errors';
import { FindAllDto } from 'src/common/findAll.dto';
import { FindOneDto } from 'src/common/findOne.dto';

@Injectable()
export class TransactionProvider {

  /** Inject the dependencies */
  constructor(
    /**  Inject the Transaction Model */
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>
  ) { }

  readonly userPopulationObject = { path: "userId", select: 'name phone' }
  readonly productPopulationObject = { path: "boughtProducts.productId", select: 'nameFA' }

  async findAll(condition: object, limit: number, page: number): Promise<FindAllDto<Transaction>> {
    try {
      const skip = (page - 1) * limit;

      const query = this.transactionModel.find(condition).populate(this.userPopulationObject).populate(this.productPopulationObject).sort('desc').skip(skip).limit(limit)

      const [transactions, count] = await Promise.all([
        query.lean().exec() as unknown as Transaction[],
        this.transactionModel.countDocuments(condition)
      ]);

      return {
        count,
        items: transactions
      }

    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن تراکنش ها رخ داده است')
    }
  }

  async findOne(findOneDto: FindOneDto): Promise<Transaction> {
    try {
      return await this.transactionModel.findById(findOneDto.id).populate(this.productPopulationObject).lean().exec();
    } catch (error) {
      if (error?.name == 'TypeError' || error?.name == 'CastError')
        throw badRequestException('آیدی تراکنش مورد نظر صحیح نمیباشد')
      throw requestTimeoutException('مشکلی در گرفتن تراکنش رخ داده است')
    }
  }
}
