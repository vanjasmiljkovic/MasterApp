import { Controller } from "@nestjs/common";
import { Crud } from "@nestjsx/crud";
import { Category } from "entities/category.entity";
import { CategoryService } from "src/services/category/category.service";

@Controller('api/category')
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
    }
})
export class CategoryController {
    constructor(public service: CategoryService) {}
}