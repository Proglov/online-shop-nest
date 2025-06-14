import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Product } from 'src/product/product.schema';
import { User } from 'src/users/user.schema';
import { Status } from './enums/transaction.enums';
import { Volume } from './enums/transaction.enums';

export interface BoughtProducts {
    productId: Types.ObjectId;
    quantity: number;
    volume: number;
}

export interface ICanceled {
    didSellerCanceled: boolean;
    reason: string;
}

export interface IOpinion {
    rate: number;
    comment?: string;
}

@Schema({ versionKey: false })
export class Transaction extends Document {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId

    @Prop({ type: SchemaTypes.ObjectId, ref: User.name, required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ type: Number, index: true })
    totalDiscount?: number;

    @Prop({ type: Number, required: true, index: true })
    totalPrice: number;

    @Prop({ type: Number, required: true })
    shippingCost: number;

    @Prop({ type: [{ _id: false, productId: { type: SchemaTypes.ObjectId, ref: Product.name }, quantity: { type: Number, min: 1, max: 100 }, volume: { type: Number, enum: Volume } }] })
    boughtProducts: BoughtProducts[];

    @Prop({ type: { _id: false, didSellerCanceled: { type: Boolean }, reason: { type: String } } })
    canceled?: ICanceled;

    @Prop({ type: { _id: false, rate: { type: Number, min: 1, max: 5 }, comment: { type: String, default: '' } } })
    opinion?: IOpinion;

    @Prop({ type: String, required: true })
    address: string;

    @Prop({ type: String, index: true })
    refId?: string;

    @Prop({ type: String, required: true, index: true })
    shouldBeSentAt: string;

    @Prop({ type: String, default: Status.Initial, enum: Status, index: true })
    status: string;

    @Prop({ default: () => new Date(), index: true })
    createdAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Add compound indexes for common query patterns
TransactionSchema.index({ userId: 1, status: 1 });
TransactionSchema.index({ status: 1, createdAt: 1 });
TransactionSchema.index({ totalPrice: 1, status: 1 });
TransactionSchema.index({ shouldBeSentAt: 1, status: 1 });