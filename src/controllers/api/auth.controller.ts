import { Body, Controller, HttpException, HttpStatus, Post, Put, Req } from "@nestjs/common";
import { LoginAdministratorDto } from "src/dtos/administrator/login.administrator.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { AdministratorService } from "src/services/administrator/administrator.service";
import * as crypto from "crypto";
import { LoginInfoDto } from "src/dtos/auth/login.info.dto";
import * as jwt from "jsonwebtoken";
import { JwtDataDto } from "src/dtos/auth/jwt.data.dto";
import { Request } from "express";
import { jwtSecret } from "config/jwt.secret";
import { UserRegistrationDto } from "src/dtos/user/user.registration.dto";
import { UserService } from "src/services/user/user.service";
import { LoginUserDto } from "src/dtos/user/login.user.dto";
import { JwtRefreshDataDto } from "src/dtos/auth/jwt.refresh.dto";
import { UserRefreshTokenDto } from "src/dtos/auth/user.refresh.token.dto";

@Controller('auth')
export class AuthController {
    constructor(
        public administratorService: AdministratorService,
        public userService: UserService,
        ) {}

    //LOGOVANJE ADMINA
    @Post('administrator/login') //http://localhost:3000/auth/administrator/login
    async doAdministratorLogin(@Body() data: LoginAdministratorDto, @Req() req: Request): Promise<LoginInfoDto | ApiResponse>{ //ocekujemo DTO da bude dostavljen u telu - tu dobijamo username i pass
        const administrator = await this.administratorService.getByUsername(data.username);

        if (!administrator){ //ako ne postoji administrator sa ovim username-om
            return new Promise(resolve => resolve(new ApiResponse('error', -3001)));
        }

        const passwordHash = crypto.createHash('sha512');    //username -> username
        passwordHash.update(data.password);                  //password -[~] -> passwordHash SHA512
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        //da li je passwordHash administratora kojeg smo dopremili iz baze isti kao passwordHashString koji smo generisali
        if (administrator.passwordHash !== passwordHashString) {
            return new Promise(resolve => resolve(new ApiResponse('error', -3002)));
        }

        //administratorId, username, tokejn (JWT)
        //Tajna sifra 
        //Sifrovanje kojim primenjujem tajnu sifru na ovaj nas JSON i dobijamo nekakav sifrovani binarni podataka i pomocu BASE64 
        // ga kodiramo i dobijamo HEX STRING

        //TOKEN (JWT) = JSON { adminId, username, exp, ip, ua}
        const jwtData = new JwtDataDto();
        jwtData.role = "administrator";
        jwtData.id = administrator.administratorId;
        jwtData.identity = administrator.username;

        jwtData.exp = this.getDatePlus(60 * 60 * 24 * 14);

        jwtData.ip = req.ip.toString();
        jwtData.ua = req.headers["user-agent"];

        let token: string = jwt.sign(jwtData.toPlainObject(), jwtSecret);

        const responseObject = new LoginInfoDto(
            administrator.administratorId,
            administrator.username,
            token,
            "",
            "",
        );
            return new Promise(resolve => resolve(responseObject));
    }

    //Registracija korisnika
    @Post('user/register') // POST http://localhost:3000/auth/user/register
    async userRegister(@Body() data: UserRegistrationDto){ //body ovog put zahteva za registraciju korisnika ce dostavljati data strukture u obliku UserRegistrationDto
        //pozivamo mehanizam iz user.service i prosledjujemo mu data tranfer objekat
        return await this.userService.register(data);
    }

    @Post('user/login') //http://localhost:3000/auth/user/login
    async doUserLogin(@Body() data: LoginUserDto, @Req() req: Request): Promise<LoginInfoDto | ApiResponse>{ //ocekujemo DTO da bude dostavljen u telu - tu dobijamo username i pass
        const user = await this.userService.getByEmail(data.email);

        if (!user){ //ako ne postoji administrator sa ovim username-om
            return new Promise(resolve => resolve(new ApiResponse('error', -3001)));
        }

        const passwordHash = crypto.createHash('sha512');    //username -> username
        passwordHash.update(data.password);                  //password -[~] -> passwordHash SHA512
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        //da li je passwordHash administratora kojeg smo dopremili iz baze isti kao passwordHashString koji smo generisali
        if (user.passwordHash !== passwordHashString) {
            return new Promise(resolve => resolve(new ApiResponse('error', -3002, "Password is not correct")));
        }

        //administratorId, username, tokejn (JWT)
        //Tajna sifra 
        //Sifrovanje kojim primenjujem tajnu sifru na ovaj nas JSON i dobijamo nekakav sifrovani binarni podataka i pomocu BASE64 
        // ga kodiramo i dobijamo HEX STRING

        //TOKEN (JWT) = JSON { adminId, username, exp, ip, ua}
        const jwtData = new JwtDataDto();
        jwtData.role = "user";
        jwtData.id = user.userId;
        jwtData.identity = user.email;
        jwtData.exp = this.getDatePlus(60 * 5);
        jwtData.ip = req.ip.toString();
        jwtData.ua = req.headers["user-agent"];

        let token: string = jwt.sign(jwtData.toPlainObject(), jwtSecret);

        const jwtRefreshData = new JwtRefreshDataDto();
        jwtRefreshData.role = jwtData.role;
        jwtRefreshData.id = jwtData.id;
        jwtRefreshData.identity = jwtData.identity;
        jwtRefreshData.exp = this.getDatePlus(60 * 60 * 24 * 31); 
        jwtRefreshData.ip = jwtData.ip;
        jwtRefreshData.ua = jwtData.ua;

        let refreshToken: string = jwt.sign(jwtRefreshData.toPlainObject(), jwtSecret);

        const responseObject = new LoginInfoDto(
            user.userId,
            user.email,
            token,
            refreshToken,
            this.getIsoDate(jwtRefreshData.exp),
        );

        //u bazu podataka dodajemo token : 
        await this.userService.addToken(
            user.userId, 
            refreshToken, 
            this.getDatabaseDateFormat(this.getIsoDate(jwtRefreshData.exp))
        );

        return new Promise(resolve => resolve(responseObject));
    }

    @Post('user/refresh') //POST http://localhost:3000/auth/user/refresh
    async userTokenRefresh(@Req() req: Request, @Body() data: UserRefreshTokenDto): Promise <LoginInfoDto | ApiResponse> {
        const userToken = await this.userService.getUserToken(data.token);

        if (!userToken){ //ne postoji aktivni token
            return new ApiResponse("error", -10002, "No such refresh token!");
        }

        if (userToken.isValid === 0) {
            return new ApiResponse("error", -10003, "The token is no longer valid!");
        }

        const now = new Date();
        const expiresDate = new Date(userToken.expiresAt);

        if (expiresDate.getTime() < now.getTime()) {
            return new ApiResponse("error", -10004, "The token has expired!");
        }

        //Token postoji, nije istekao i validan je 
        //obnavljamo ga
        let jwtRefreshData: JwtRefreshDataDto; 

        try {
            jwtRefreshData = jwt.verify(data.token, jwtSecret);
        }catch(e){
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        if (!jwtRefreshData){  //ako nemamo jwtData znaci nije validan objekat
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        if (jwtRefreshData.ip != req.ip.toString()){ //da li je isti ip iz jwtData i ovaj nas koji trenutno imamo
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        if (jwtRefreshData.ua != req.headers["user-agent"]){ 
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        //sada pravimo novi token
        const jwtData = new JwtDataDto();
        jwtData.role = jwtRefreshData.role;
        jwtData.id = jwtRefreshData.id;
        jwtData.identity = jwtRefreshData.identity;
        jwtData.exp = this.getDatePlus(60 * 5);
        jwtData.ip = jwtRefreshData.ip;
        jwtData.ua = jwtRefreshData.ua;

        let token: string = jwt.sign(jwtData.toPlainObject(), jwtSecret);

        const responseObject = new LoginInfoDto(
            jwtData.id,
            jwtData.identity,
            token,
            data.token,
            this.getIsoDate(jwtRefreshData.exp),
        );

        return responseObject;
    }

    private getDatePlus(numberOfSeconds: number): number {
        return new Date().getTime() / 1000 + numberOfSeconds; //dobijamo broj sekundi   
    }

    private getIsoDate(timestamp: number): string {
        const date = new Date();
        date.setTime(timestamp * 1000); //u sekundama
        return date.toISOString();
    }

    private getDatabaseDateFormat(isoFormat: string): string {
        //2021-02-18T09:56:03.411Z
        return isoFormat.substr(0, 19).replace('T', ' '); //T menjamo razmakom
    }

}

//admin admin token
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbmlzdHJhdG9ySWQiOjQsInVzZXJuYW1lIjoiYWRtaW4iLCJleHAiOjE2MTE2ODIxMDAuNTM3LCJpcCI6Ijo6MSIsInVhIjoiUG9zdG1hblJ1bnRpbWUvNy4yNi44IiwiaWF0IjoxNjEwNDcyNTAwfQ.VTizrPu1EFEeDu1VXk4rqzCMpkV2GpcHhsE9CKy-foY