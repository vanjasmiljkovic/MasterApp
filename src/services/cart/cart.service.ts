import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Article } from "src/entities/article.entity";
import { CartArticle } from "src/entities/cart-article.entity";
import { Cart } from "src/entities/cart.entity";
import { Order } from "src/entities/order.entity";
import { Repository } from "typeorm";

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart) 
        private readonly cart: Repository<Cart>,

        @InjectRepository(CartArticle) 
        private readonly cartArticle: Repository<CartArticle>,

        @InjectRepository(Article) 
        private readonly article: Repository<Article>,

        @InjectRepository(Order) 
        private readonly order: Repository<Order>
    ) { }

    async getLastActiveCartByUserId(userId: number): Promise<Cart | null>{  //moze da bude null - nema ni jedne korpe za tog korisnika, npr tek se registrovao
        const carts = await this.cart.find({
            where: {
                userId: userId,      // where userId iz cart entiteta se poklapa sa userId iz argumenta
            },
            order: {
                createdAt: "DESC", //da izvucemo korpe u opadajucem poretku
            },
            take: 1, //uzeti jednu korpu sortiranu u opadajucem poretku
            //ucitali smo order za tako pronadjenu korpu
            relations: [ "order" ], //da pronadjemo order za tu poslednju korpu koju smo izvukli
        });

        if (!carts || carts.length === 0) { //ako nema cart
            return null;
        }

        const cart = carts[0]; //izvlacimo taj cart - prvi po redu

        if (cart.order !== null) { //ako ima order ta korpa nije aktivna i nije nam na raspolaganju
            return null;
        }

        return cart;
    }

    async createNewCartForUser(userId: number): Promise<Cart> { //za tog usera vracamo obecanje da cemo napraviti korpu
        const newCart: Cart = new Cart(); //pravimo novu korpu
        newCart.userId = userId; //popunimo cart samo sa userId
        return await this.cart.save(newCart); //cuvamo taj newCart i vracamo ga rezultat
    }

    async addArticleToCart(cartId: number, articleId: number, quantity: number): Promise<Cart> {
        let record: CartArticle = await this.cartArticle. findOne({  //pronadji mi jedan zapis iz repozitorijuma cartArticle koji odgovara sledecim vrednostima
            cartId: cartId,
            articleId: articleId,
        });

        if (!record) { //ako ne postoji takav zapis u bazi pravimo novi zapis
            record = new CartArticle();
            record.cartId = cartId;
            record.articleId = articleId;
            record.quantity = quantity;
        } else { //ako postoji record
            record.quantity += quantity; //quantity iz tog recorda uvecavamo za quantity koji smo prosledili
        }

        //cuvamo taj novi record koji smo napravili ili taj sto smo mu izmenili quantity
        await this.cartArticle.save(record);

        return this.getById(cartId);
    }

    async getById(cartId: number): Promise<Cart> {
        return await this.cart.findOne(cartId, {
            relations: [
                "user",
                "cartArticles",  //dodajemo relaciju cartArticles jer zelimo da vidimo koji su sve to artikli dodati i u kojoj kolicini u nas cart
                "cartArticles.article",
                "cartArticles.article.category",
            ],
        });
    }

    //Menjamo kolicinu artikala u korpi
    //1. pokusamo da nadjemo tu korpu sa tim id i taj record taj articleId
    async changeQuantity(cartId: number, articleId: number, newQuantity: number): Promise<Cart> {
        let record: CartArticle = await this.cartArticle. findOne({  //pronadji mi jedan zapis iz repozitorijuma cartArticle koji odgovara sledecim vrednostima
            cartId: cartId,
            articleId: articleId,
        });

        if (record) { //ako je pronadjen record
            record.quantity = newQuantity; 

            if (record.quantity === 0) { //ako je nova kolicina 0 treba da uradimo brisanje tog proizvoda iz korpe
                await this.cartArticle.delete(record.cartArticleId);
            } else { //ako nije nula cuvamo novu vrednost
                await this.cartArticle.save(record);
            }
        }
            
        return await this.getById(cartId); //vracamo korpu nepromenjenu ili novosacuvanu 
      
    }
}