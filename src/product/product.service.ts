import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { badRequestException, notFoundException, requestTimeoutException } from 'src/common/errors';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.schema';
import { Model } from 'mongoose';
import { BrandService } from 'src/brand/brand.service';
import { NoteService } from 'src/note/note.service';
import { ImageService } from 'src/image/image.service';

@Injectable()
export class ProductService {

  /** Inject the dependencies */
  constructor(
    /**  Inject the Product Model */
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,

    /**  Inject the brand service */
    private readonly brandService: BrandService,

    /**  Inject the note service */
    private readonly noteService: NoteService,

    /**  Inject the image service to replace the image link */
    private readonly imageService: ImageService,

  ) { }

  async create(createProductDto: CreateProductDto, replaceTheImageKey?: boolean) {
    enum Notes {
      initialNote,
      midNote,
      baseNote
    }

    const brand = await this.brandService.findOne({ id: createProductDto.brandId }, true);
    if (!brand) throw notFoundException('برند مورد نظر یافت نشد');

    // Create an array of promises paired with their type of note id
    const notePromises = [
      ...createProductDto.baseNoteIds.map(baseNoteId =>
        this.noteService.findOne({ id: baseNoteId }, true).then(note => ({ note, type: Notes.baseNote }))
      ),
      ...createProductDto.midNoteIds.map(midNoteId =>
        this.noteService.findOne({ id: midNoteId }, true).then(note => ({ note, type: Notes.midNote }))
      ),
      ...createProductDto.initialNoteIds.map(initialNoteId =>
        this.noteService.findOne({ id: initialNoteId }, true).then(note => ({ note, type: Notes.initialNote }))
      )
    ];

    const notesWithTypes = await Promise.all(notePromises);
    if (notesWithTypes.some(item => !item.note)) throw notFoundException('نوت مورد نظر یافت نشد');

    // organize the notes based on their types
    const notes = notesWithTypes.reduce((acc, { note, type }) => {
      acc[type] = [...(acc[type] || []), note];
      return acc;
    }, { [Notes.baseNote]: [], [Notes.initialNote]: [], [Notes.midNote]: [] });

    try {
      const newProduct = await new this.productModel(createProductDto).save();
      const result = {
        ...newProduct.toObject(),
        brandId: brand,
        initialNoteIds: notes[Notes.initialNote],
        baseNoteIds: notes[Notes.baseNote],
        midNoteIds: notes[Notes.midNote],
      };

      if (!replaceTheImageKey) return result;

      const imageKeys = await this.imageService.getImages(result.imageKeys);
      return { ...result, imageKeys: imageKeys.map(imageObj => imageObj.url) };

    } catch (error) {
      if (error?.code === 11000 && ['nameFA', 'nameEN'].includes(Object.keys(error?.keyPattern)[0])) {
        throw badRequestException('محصولی با همین نام موجود است');
      }
      throw requestTimeoutException('مشکلی در ایجاد محصول رخ داده است');
    }
  }

  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }
}
