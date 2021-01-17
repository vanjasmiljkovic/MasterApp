import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfiguration } from 'config/database.configuration';
import { Administrator } from 'src/entities/administrator.entity';
import { AdministratorService } from './services/administrator/administrator.service';
import { ArticleFeature } from 'src/entities/article-feature.entity';
import { ArticlePrice } from 'src/entities/article-price.entity';
import { Article } from 'src/entities/article.entity';
import { CartArticle } from 'src/entities/cart-article.entity';
import { Cart } from 'src/entities/cart.entity';
import { Category } from 'src/entities/category.entity';
import { Feature } from 'src/entities/feature.entity';
import { Order } from 'src/entities/order.entity';
import { Photo } from 'src/entities/photo.entity';
import { User } from 'src/entities/user.entity';
import { AdministratorController } from './controllers/api/administrator.controller';
import { Documentation } from 'src/entities/documentation.entity';
import { CategoryController } from './controllers/api/category.controller';
import { CategoryService } from './services/category/category.service';
import { ArticleService } from './services/article/article.service';
import { ArticleController } from './controllers/api/article.controller';
import { AuthController } from './controllers/api/auth.controller';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { PhotoService } from './services/photo/photo.service';
import { FeatureService } from './services/feature/feature.service';
import { FeatureController } from './controllers/api/feature.controller';
import { UserService } from './services/user/user.service';
import { CartService } from './services/cart/cart.service';
import { UserCartController } from './controllers/api/user.cart.controller';
import { OrderService } from './services/order/order.services';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailConfig } from 'config/mail.config';
import { OrderMailer } from './services/order/order.mailer.service';
import { AdministratorOrderController } from './controllers/api/administrator.order.controller';

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
    ]),
    MailerModule.forRoot({
      // smtps://username:password@smtp.gmail.com
      transport: 'smtps://' + MailConfig.username + ':' +
                              MailConfig.password + '@' +
                              MailConfig.hostname,
      defaults: {
        from: MailConfig.senderEmail,
      },
    }),
  ],
  controllers: [
    AppController,
    AdministratorController, 
    CategoryController,
    ArticleController,
    AuthController,
    FeatureController,
    UserCartController,
    AdministratorOrderController,
  ],
  providers: [ //komunikacija sa eksternim resursima - baza, api ...
    AdministratorService,
    CategoryService,
    ArticleService,
    PhotoService,
    FeatureService,
    UserService,
    CartService,
    OrderService,
    OrderMailer,
  ], 
  exports: [
    AdministratorService, //njega export-ujemo jer se on koristi u jednom od middleware-a (AuthMiddleware) koji sluzi da proveri da li admin i dalje postoji u bazi sa tim tokenom
    UserService,
  ],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) { //ovaj Consumer treba da primeni Middleware
    consumer
      .apply(AuthMiddleware) //primeni AuthMiddleware na sve rute koje nisu auth/* a jesu api/*
      .exclude('auth/*') //na ovoj ruti se preskace middleware
      .forRoutes('api/*'); //a ovde se primenjuje
  } 
}
