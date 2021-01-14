import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { AdministratorService } from "src/services/administrator/administrator.service";
import * as jwt from "jsonwebtoken";
import { JwtDataDto } from "src/dtos/auth/jwt.data.dto";
import { jwtSecret } from "config/jwt.secret";
import { UserService } from "src/services/user/user.service";

//proveravamo token - da li middleware treba da presretne i prekine dalje izvrsavanje nasih metoda
@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor( 
        public administratorService: AdministratorService,
        public userService: UserService,
    ) { }
    //1)ovaj middleware - presretne odredjeni request
    //2)proveri da li ima autorizacioni header
    async use(req: Request, res: Response, next: NextFunction) {
        if (!req.headers.authorization){  //ako nemamo header koji se zove authorization prekidamo dalji rad
            throw new HttpException('Token not found', HttpStatus.UNAUTHORIZED);
        }

        //3)uzima token iz tog header-a
        const token = req.headers.authorization;

        const tokenParts = token.split(' ');
        if (tokenParts.length !== 2){
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        const tokenString = tokenParts[1]; //2. deo tog token parts je zapravo nas token

        //4) taj drugi string tokena provlacimo kroz verify od jwt
        let jwtData: JwtDataDto; 

        try {
            jwtData = jwt.verify(tokenString, jwtSecret);
        }catch(e){
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        if (!jwtData){  //ako nemamo jwtData znaci nije validan objekat
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        if (jwtData.ip != req.ip.toString()){ //da li je isti ip iz jwtData i ovaj nas koji trenutno imamo
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        if (jwtData.ua != req.headers["user-agent"]){ 
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        if (jwtData.role === "administrator") {
            const administrator = await this.administratorService.getById(jwtData.id);
            if(!administrator){
                throw new HttpException('Account not found', HttpStatus.UNAUTHORIZED);
            }
        } else if ( jwtData.role === "user") {
            const user = await this.userService.getById(jwtData.id);
            if(!user){
                throw new HttpException('Account not found', HttpStatus.UNAUTHORIZED);
            }
        }

        const nowTimeStamp = new Date().getTime() / 1000;

        if (nowTimeStamp >= jwtData.exp){
            throw new HttpException('The token has expired', HttpStatus.UNAUTHORIZED);
        }

        next();  //ako nista od ovog gore nije tacno, odnosno nista nas nije prekinula mi kazemo next
    }

}