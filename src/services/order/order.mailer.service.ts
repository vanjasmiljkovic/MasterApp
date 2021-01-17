import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { MailConfig } from "config/mail.config";
import { CartArticle } from "src/entities/cart-article.entity";
import { Order } from "src/entities/order.entity";

@Injectable()
export class OrderMailer {
    constructor(private readonly mailService: MailerService) {}

    async sendOrderEmail(order: Order){
        await this.mailService.sendMail({
            to: order.cart.user.email,
            bcc: MailConfig.orderNotificationMail,
            subject: 'Order details',
            encoding: 'UTF-8',
            html: this.makeOrderHtml(order),
        });
    }

    private makeOrderHtml(order: Order): string {
        let suma = order.cart.cartArticles.reduce((sum, currentCartArticle: CartArticle) => {
            return sum + 
                   currentCartArticle.quantity * 
                   currentCartArticle.article.articlePrices[currentCartArticle.article.articlePrices.length - 1].price
        }, 0); //na pocetku je suma 0

        return `<p> Zahvaljujemo se na Vasoj porudzbini! </p>
                <p> Detalji Vase porudzbine:</p>
                <ul>
                   ${ order.cart.cartArticles.map((CartArticle: CartArticle) => {
                    return `<li>
                        ${ CartArticle.article.name } x 
                        ${ CartArticle.quantity }
                    </li>`
                   }).join("") } 
                </ul>
                <p>Ukupan iznos: ${ suma.toFixed(2) } DIN. </p>
                <p> Hvala na ukazanom poverenju! </p>
                `;
    }
}