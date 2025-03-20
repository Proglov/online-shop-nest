import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Product } from 'src/product/product.schema';

@Schema({ versionKey: false })
export class Festival extends Document {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId;

    @Prop({ type: SchemaTypes.ObjectId, ref: Product.name, required: true, unique: true })
    productId: Types.ObjectId;

    @Prop({ type: Number, min: 1, max: 99 })
    offPercentage: number;

    @Prop({ type: String })
    until: string;
}


export const FestivalSchema = SchemaFactory.createForClass(Festival)