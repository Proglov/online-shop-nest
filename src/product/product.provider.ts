import { Injectable } from '@nestjs/common';
import { requestTimeoutException } from 'src/common/errors';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.schema';
import { Model, Types } from 'mongoose';
import { FindOneDto } from 'src/common/findOne.dto';
import { PopulatedNoteWithCent, PopulatedProduct } from './dto/populated-product.type';
import { ImageService } from 'src/image/image.service';

@Injectable()
export class ProductProvider {

  /** Inject the dependencies */
  constructor(
    /**  Inject the Product Model */
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,

    /**  Inject the image service to replace the image link */
    private readonly imageService: ImageService,

  ) { }


  async replaceTheImageKeysOfProducts(products: PopulatedProduct[]): Promise<PopulatedProduct[]> {
    const noteKeys: (keyof PopulatedProduct)[] = ['initialNoteObjects', 'midNoteObjects', 'baseNoteObjects']

    //get the links of notes imageKeys, brand imageKey, and the imageKeys
    const links = await this.imageService.getImages(products.map(product => [...noteKeys.map(noteKey => product[noteKey].map((noteObj: PopulatedNoteWithCent) => noteObj.noteId.imageKey)), product.brandId.imageKey, product.imageKeys]).flat(2));

    // Create a map for fast access by filename
    const linkMap = new Map(links.map(link => [link.filename, link.url]));

    // Map the products and replace the imageKey where available
    return products.map(product => {
      //deep clone
      const newObj = JSON.parse(JSON.stringify(product))
      //replace the brandId
      newObj.brandId = { ...product.brandId, imageKey: linkMap.get(product.brandId.imageKey) }
      //replace the imageKeys
      newObj.imageKeys = product.imageKeys.map(imageKey => linkMap.get(imageKey));
      //replace the notes
      noteKeys.map(noteKey => {
        newObj[noteKey] = product[noteKey].map((note: PopulatedNoteWithCent) => ({ ...note, imageKey: linkMap.get(note.noteId.imageKey) }))
      })
      return newObj as PopulatedProduct;
    });
  }

  async replaceTheImageKeysOnlyOfProducts(products: Product[]): Promise<Product[]> {
    //get the links of notes imageKeys, brand imageKey, and the imageKeys
    const links = await this.imageService.getImages(products.map(product => product.imageKeys).flat());

    // Create a map for fast access by filename
    const linkMap = new Map(links.map(link => [link.filename, link.url]));

    // Map the products and replace the imageKey where available
    return products.map(product => {
      //deep clone
      const newObj = JSON.parse(JSON.stringify(product))
      //replace the imageKeys
      newObj.imageKeys = product.imageKeys.map(imageKey => linkMap.get(imageKey));
      return newObj as Product;
    });
  }

  async findOne(findOneDto: FindOneDto): Promise<Product> {
    try {
      return await this.productModel.findById(findOneDto.id).lean().exec() as unknown as Product
    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن محصول رخ داده است')
    }
  }

  async findMany(ids: Types.ObjectId[]): Promise<Product[]> {
    try {
      return await this.productModel.find({ _id: { $in: ids } }).lean().exec() as unknown as Product[]
    } catch (error) {
      throw requestTimeoutException('مشکلی در گرفتن محصولات رخ داده است')
    }
  }
}
