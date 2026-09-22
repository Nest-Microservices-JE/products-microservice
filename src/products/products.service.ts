import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: createProductDto,
    });

    return product;
  }

  async findAll(paginationDto:PaginationDto) {

    const {page, limit} = paginationDto;
    const totalPages = await  this.prisma.product.count({where:{available:true}});
    const lastPage = Math.ceil(totalPages/limit!);


    return {
      data: await this.prisma.product.findMany({
        skip: (page! - 1) * limit!,
        take:limit,
        where:{
          available:true
        }
      }),

      metadata:{
        total:totalPages,
        page:page,
        lastPage: lastPage
      }
    }
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id, available: true },
    });

    if (!product) {
      throw new RpcException({
        message:`Product with id #${id} not found`,
        status: HttpStatus.BAD_REQUEST
      });
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const {id: __,...data} =updateProductDto
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

   /* return this.prisma.product.delete({
      where: { id },
    });*/

    const product = await this.prisma.product.update({
      where:{id},
      data:{
        available:false
      }
    });

    return product;
  }


  async validateProducts(ids: number[]){

    ids = Array.from(new Set(ids)); //quitar duplicados

    const products = await this.prisma.product.findMany({
      where:{
        id:{
          in: ids
        }
      }
    });

    if(products.length !== ids.length){
      throw new RpcException({
        message:`Some products were not found`,
        status: HttpStatus.BAD_REQUEST
      });
    }


    return products;
  }


}
