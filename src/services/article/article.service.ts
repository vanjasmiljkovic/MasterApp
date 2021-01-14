import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { ArticleFeature } from "src/entities/article-feature.entity";
import { ArticlePrice } from "src/entities/article-price.entity";
import { Article } from "src/entities/article.entity";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { Repository } from "typeorm";
import { EditArticleDto } from "src/dtos/article/edit.article.dto";

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

    async editFullArticle(articleId: number, data: EditArticleDto): Promise<Article | ApiResponse> {
        const existingArticle: Article = await this.article.findOne(articleId, {
            relations: [ 'articlePrices', 'articleFeatures' ] //uvezi relaciju articlePrices i articleFeatures iz entiteta article
            //ukljucujemo informaciju o cenama i article feature-ima jer ce nam trebati 
        });

        //ako ne postoji artikal sa tim id-ijem
        if (!existingArticle) {
            return new ApiResponse('error', -5001, 'Article not found');
        }

        //sada izmenjujemo artikal 

        existingArticle.name = data.name;
        existingArticle.categoryId = data.categoryId;
        existingArticle.excerpt = data.excerpt;
        existingArticle.description = data.description;
        existingArticle.status = data.status;
        existingArticle.isPromoted = data.isPromoted;

        //sacuvati izmenjeni artikal u bazi podataka
        const savedArticle = await this.article.save(existingArticle);

        //ako iz nekog razloga nije mogao da se sacuva izmenjeni artikal
        if (!savedArticle){
            return new ApiResponse('error', -5002, 'Could not save new article data');
        }

        //uzimamo novu cenu iz Dto objekta
        //50.1 -> "50.10"
        const newPriceString: string = Number(data.price).toFixed(2);  //uzimamo numericki podatak i kazemo maksimum dve decimale da ima i pretvaramo ga u string

        const lastPrice = existingArticle.articlePrices[existingArticle.articlePrices.length - 1].price;  //poslednji element
        const lastPriceString: string = Number(lastPrice).toFixed(2); // 50 -> "50.00"

        //Restriktivno dodavanje dopunskih informacija - ako nema razloga da se menja informacija, nema razloga da se dodaje evidencija njene izmene u tabeli koja je relacijom povezana - articlePrices
        if (newPriceString !== lastPriceString) { //proveravamo da li je promenjena cena i samo onda radimo promenu cene, ako su iste nista
            const newArticlePrice = new ArticlePrice();
            newArticlePrice.articleId = articleId;
            newArticlePrice.price = data.price;

            const savedArticlePrice = await this.articlePrice.save(newArticlePrice);
            if (!savedArticlePrice) {
                return new ApiResponse('error', -5003, 'Could not save the new article price');
            }
        }

        if (data.features !== null) { //ako u nasem Dto imamo features koji nije null tada pristupamo njihovom kreiranju jer ako je null znaci korisnik ih nije menjao i ostaju isti
            //prvo moramo da obrisemo postojece article feature-e pa tek onda da dodamo te nove 
            await this.articleFeature.remove(existingArticle.articleFeatures);  //dajemo niz articleFeature-a za ovaj existing Article

            //dodajemo nove feature-e
            for (let feature of data.features) { //data.features je niz objekata, dakle svaki nas feature ce biti objekat
                let newArticleFeature: ArticleFeature = new ArticleFeature();
                newArticleFeature.articleId = articleId;
                newArticleFeature.featureId = feature.featureId;
                newArticleFeature.value = feature.value;
    
                await this.articleFeature.save(newArticleFeature);
            }
        }  
        
        return await this.article.findOne(articleId, {
            relations: [ //relacije se zovu kao u article entitetu
                "category",
                "articleFeatures",
                "features",
                "articlePrices"
            ]
        });
    }
}

