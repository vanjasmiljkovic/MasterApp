import { Controller } from "@nestjs/common";
import { Crud } from "@nestjsx/crud";
import { Article } from "entities/article.entity";
import { ArticleService } from "src/services/article/article.service";

@Controller('api/article')
@Crud({  //zelimo da imamo Crud operacije za model podataka koji je definisan tipom propisanim u definiciji Category entiteta
    model: {
        type: Article
    },
    params: {
        id: {
            field: 'articleId',
            type: 'number',
            primary: true
        }
    },
    query: {
        join: {
            category: { //odmah da vidim kojoj kategoriji artikal pripada category - se zove u article entity
                eager: true 
            },
            photos: { //dobijamo odmah i fotografije vezane za taj artikal
                eager: true
            },
            articlePrices: {
                eager: true
            },
            documentations: {
                eager: true
            },
            articleFeatures: {
                eager: true
            },
            features: {
                eager: true
            }
        }
    }
})
export class ArticleController {
    constructor(public service: ArticleService) {}
}