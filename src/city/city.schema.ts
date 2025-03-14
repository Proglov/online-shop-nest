import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, SchemaTypes, Types } from 'mongoose';

@Schema({ versionKey: false })
export class City extends Document {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId

    @Prop({ type: String, required: true, unique: true })
    name: string;

    @Prop({ type: Types.ObjectId, ref: 'Province', required: true })
    provinceId: mongoose.Schema.Types.ObjectId;

}


export const CitySchema = SchemaFactory.createForClass(City)