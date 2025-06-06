import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Note, NoteSchema } from './note.schema';
import { ImageModule } from 'src/image/image.module';
import { TemporaryImagesModule } from 'src/temporary-images/temporary-images.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),
    ImageModule,
    TemporaryImagesModule
  ],
  controllers: [NoteController],
  providers: [NoteService],
  exports: [NoteService],
})
export class NoteModule { }
