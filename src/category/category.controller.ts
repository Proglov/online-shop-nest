import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { AuthType } from 'src/auth/enums/auth-types';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/pagination.dto';
import { FindAllDto } from 'src/common/findAll.dto';
import { Category } from './category.schema';
import { FindOneDto } from 'src/common/findOne.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Auth(AuthType.Admin)
  @Post()
  @ApiOperation({ summary: 'creates a category' })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Category created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Category name has conflict' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Category is not created' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
  async create(
    @Body() createCategoryDto: CreateCategoryDto
  ) {
    return await this.categoryService.create(createCategoryDto, true);
  }

  @Get()
  @ApiOperation({ summary: 'returns all categories based on the pagination' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Categories found', type: FindAllDto<Category> })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Categories are not found' })
  async findAll(
    @Query() query: PaginationDto
  ) {
    return await this.categoryService.findAll(query.limit, query.page, true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'returns a category with its id' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Category found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Category Id is not correct' })
  @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Category is not found' })
  async findOne(
    @Param() findOneDto: FindOneDto
  ) {
    return await this.categoryService.findOne(findOneDto, true);
  }

}
