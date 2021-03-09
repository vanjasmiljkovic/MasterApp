import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Crud } from "@nestjsx/crud";
import { ArticleSearchDto } from "src/dtos/article/article.search.dto";
import DistinctFeatureValuesDto from "src/dtos/feature/distinct.feature.values.dto";
import { Article } from "src/entities/article.entity";
import { Category } from "src/entities/category.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { ArticleService } from "src/services/article/article.service";
import { CategoryService } from "src/services/category/category.service";
import { FeatureService } from "src/services/feature/feature.service";

@Controller('/products')
@Crud({  //zelimo da imamo Crud operacije za model podataka koji je definisan tipom propisanim u definiciji Category entiteta
    model: {
        type: Category
    },
    params: {
        id: {
            field: 'categoryId',
            type: 'number',
            primary: true
        }
    },
    query: {
        join: {
            categories: {
                eager: true //odmah prikazuje potkateogrije
            },
            features: {
                eager: true //da odmah prikaze osobine koje ima ta kateogrija
            },
            parentCategory: {
                eager: false
            },
            articles: {
                eager: false
            }
        }
    },
    routes: {
        only: [  //ovo ce biti dostupno od mehanizama za upravljanje podacima nad feature controllerom
            "createOneBase",
            "createManyBase",
            "updateOneBase",
            "getManyBase",
            "getOneBase",
        ],
    }
})
export class ProductsController {
    constructor(public service: CategoryService,
        public artService: ArticleService,
        public featureService: FeatureService,
        ) {}

    @Post('search')
    async search(@Body() data: ArticleSearchDto): Promise<Article[] | ApiResponse> { //search uzima iz Body-ja data tipa articleSearchDto
        return await this.artService.search(data);
    }

    @Get('/:categoryId')
    async getDistinctValuesByCategoryId(@Param('categoryId') categoryId:number): Promise<DistinctFeatureValuesDto> {
        return await this.featureService.getDistinctValuesByCategoryId(categoryId);
    }
}