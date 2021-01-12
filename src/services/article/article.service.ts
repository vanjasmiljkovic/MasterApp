import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { ArticleFeature } from "entities/article-feature.entity";
import { ArticlePrice } from "entities/article-price.entity";
import { Article } from "entities/article.entity";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { Repository } from "typeorm";

@Injectable()
export class ArticleService extends TypeOrmCrudService<Article> {
    constructor(
        @InjectRepository(Article)
        private readonly article: Repository<Article>,
        
        @InjectRepository(ArticlePrice)
        private readonly articlePrice: Repository<ArticlePrice>,

        @InjectRepository(ArticleFeature)
        private readonly articleFeature: Repository<ArticleFeature>,

    ){ //KADA POMENEM NEKI REPOZITORIJUM, ODMAH U app.module MORAM DA GA DODAM U TypeOrmModule
        super(article); //prosledjujemo konstruktoru super klase TypeOrmCrudService
    }

    //Nas DTO ima vise struktura u sebi - price i feature nisu iz te tabele article
    async createFullArticle(data: AddArticleDto): Promise<Article | ApiResponse> {
        let newArticle: Article = new Article();
        newArticle.name = data.name;
        newArticle.categoryId = data.categoryId;
        newArticle.excerpt = data.excerpt;
        newArticle.description = data.description;

        // funkcija save kada joj prosledimo novi artikal koji zelimo da sacuva vraca nam nazad save artikal i u njemu sad imamo articleId da bi povezali sa cenom i osobinama
        let savedArticle = await this.article.save(newArticle);

        let newArticlePrice: ArticlePrice = new ArticlePrice();
        newArticlePrice.articleId = savedArticle.articleId;
        newArticlePrice.price = data.price; //iz DTO

        await this.articlePrice.save(newArticlePrice);

        for (let feature of data.features) { //data.features je niz objekata, dakle svaki nas feature ce biti objekat
            let newArticleFeature: ArticleFeature = new ArticleFeature();
            newArticleFeature.articleId = savedArticle.articleId;
            newArticleFeature.featureId = feature.featureId;
            newArticleFeature.value = feature.value;

            await this.articleFeature.save(newArticleFeature);
        }

        return await this.article.findOne(savedArticle.articleId, {
            relations: [ //relacije se zovu kao u article entitetu
                "category",
                "articleFeatures",
                "features",
                "articlePrices"
            ]
        });
    }
}

