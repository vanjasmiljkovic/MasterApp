import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfiguration } from 'config/database.configuration';
import { Administrator } from 'entities/administrator.entity';
import { AdministratorService } from './services/administrator/administrator.service';
import { ArticleFeature } from 'entities/article-feature.entity';
import { ArticlePrice } from 'entities/article-price.entity';
import { Article } from 'entities/article.entity';
import { CartArticle } from 'entities/cart-article.entity';
import { Cart } from 'entities/cart.entity';
import { Category } from 'entities/category.entity';
import { Feature } from 'entities/feature.entity';
import { Order } from 'entities/order.entity';
import { Photo } from 'entities/photo.entity';
import { User } from 'entities/user.entity';
import { AdministratorController } from './controllers/api/administrator.controller';
import { Documentation } from 'entities/documentation.entity';
import { CategoryController } from './controllers/api/category.controller';
import { CategoryService } from './services/category/category.service';
import { ArticleService } from './services/article/article.service';
import { ArticleController } from './controllers/api/article.controller';

//
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: DatabaseConfiguration.hostname,
      port: 8889,
      username: DatabaseConfiguration.username,
      password: DatabaseConfiguration.password,
      database: DatabaseConfiguration.database,
      entities: [ 
        Administrator,
        ArticleFeature,
        ArticlePrice,
        Article,
        CartArticle,
        Cart,
        Category,
        Feature,
        Order,
        Photo,
        Documentation,
        User
      ] //povezali smo entitet - Entitete moramo sve da najbrojimo
    }),
    TypeOrmModule.forFeature([  //Repozitorijume samo one koje koristimo
      Administrator,
      Category,
      Article,
    ])
  ],
  controllers: [
    AppController,
    AdministratorController, 
    CategoryController,
    ArticleController,
  ],
  providers: [ //komunikacija sa eksternim resursima - baza, api ...
    AdministratorService,
    CategoryService,
    ArticleService,
  ], 
})
export class AppModule {}
