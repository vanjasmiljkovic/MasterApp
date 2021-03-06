import { Body, Controller, Get, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AddArticleToCartDto } from "src/dtos/cart/add.article.to.cart.dto";
import { Cart } from "src/entities/cart.entity";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { RoleCheckerGuard } from "src/misc/role.checker.guard";
import { CartService } from "src/services/cart/cart.service";
import { Request } from "express";
import { userInfo } from "os";
import { EditArticleInCartDto } from "src/dtos/cart/edit.article.in.cart.dto";
import { promises } from "fs";
import { OrderService } from "src/services/order/order.services";
import { ApiResponse } from "src/misc/api.response.class";
import { Order } from "src/entities/order.entity";
import { OrderMailer } from "src/services/order/order.mailer.service";

@Controller('api/user/cart')  //ruta kojom dolaze zahtevi za ovaj kontroler
export class UserCartController {
    constructor(
        private cartService: CartService,
        private orderService: OrderService,
        private orderMailer: OrderMailer,
    ){ }

    private async getActiveCartForUserId(userId: number): Promise <Cart> { //private - metod dostupan samo u okviru ove klase, ne moze od spolja da se poziva
        let cart = await this.cartService.getLastActiveCartByUserId(userId);

        if (!cart){
            cart = await this.cartService.createNewCartForUser(userId);
        }

        return await this.cartService.getById(cart.cartId); //jer u metodu getById je dopunjena verzija korpe - ukljucene su i relacije (cart.service.ts)
    }
    
    // zelimo da vratimo trenutno aktivnu korpu
    // GET http://localhost:3000/api/user/cart/ 
    @Get() 
    @UseGuards(RoleCheckerGuard) //koristi RoleCheckerGuard i dozvoli pristup samo administratoru(AllowToRoles - administrator)
    //@SetMetadata('allow_to_roles', ['aministrator']) //koje role imaju pravo pristupa ovoj getAll metodi
    @AllowToRoles('user') //AllowToRoles iz allow.to.roles.descriptor.ts -  roli administrator je dozvoljen pristup getAll metodi
    async getCurrentCart(@Req() req: Request): Promise<Cart> {
        return await this.getActiveCartForUserId(req.token.id);
    }

    // POST http://localhost:3000/api/user/cart/addToCart
    @Post('addToCart')
    @UseGuards(RoleCheckerGuard) //koristi RoleCheckerGuard i dozvoli pristup samo administratoru(AllowToRoles - administrator)
    @AllowToRoles('user') //AllowToRoles iz allow.to.roles.descriptor.ts -  roli administrator je dozvoljen pristup getAll metodi
    async addToCart(@Body() data: AddArticleToCartDto, @Req() req: Request): Promise<Cart> {
        const cart = await this.getActiveCartForUserId(req.token.id);
        return await this.cartService.addArticleToCart(cart.cartId, data.articleId, data.quantity);
    }

    //promena artikla u korpi (kolicina)
    //PATCH http://localhost:3000/api/user/cart/
    @Patch()
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('user')
    async changeQuantity(@Body() data:EditArticleInCartDto, @Req() req: Request): Promise<Cart> {
        const cart = await this.getActiveCartForUserId(req.token.id);
        return await this.cartService.changeQuantity(cart.cartId, data.articleId, data.quantity)
    }

    //POST http://localhost:3000/api/user/cart/makeOrder/
    @Post('makeOrder')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('user')
    async makeOrder(@Req() req: Request): Promise<Order | ApiResponse> {
        const cart = await this.getActiveCartForUserId(req.token.id);
        const order = await this.orderService.add(cart.cartId); //add metoda upisuje u bazu tu porudzbinu

        if ( order instanceof ApiResponse ) { //ako je bio ApiResponse znaci doslo je do greske pa ne salji mejl
            return order;
        }

        //Slanje email porudzbine - ako nije bilo greske
        await this.orderMailer.sendOrderEmail(order);

        return order;
    }

    //GET http://localhost:3000/api/user/cart/orders/
    @Get('orders')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('user')
    async getOrders(@Req() req: Request): Promise<Order[]> {
        return await this.orderService.getAllByUserId(req.token.id);
    }
}
