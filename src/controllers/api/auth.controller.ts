import { Body, Controller, Post, Put, Req } from "@nestjs/common";
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

        let now = new Date();
        now.setDate(now.getDate() + 14); //dodali smo jos 14 dana na sadasnje vreme
        const expireTimestamp = now.getTime() /1000 ; //dobijamo broj sekundi
        jwtData.exp = expireTimestamp;

        jwtData.ip = req.ip.toString();
        jwtData.ua = req.headers["user-agent"];

        let token: string = jwt.sign(jwtData.toPlainObject(), jwtSecret);

        const responseObject = new LoginInfoDto(
            administrator.administratorId,
            administrator.username,
            token
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
            return new Promise(resolve => resolve(new ApiResponse('error', -3002)));
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

        let now = new Date();
        now.setDate(now.getDate() + 14); //dodali smo jos 14 dana na sadasnje vreme
        const expireTimestamp = now.getTime() /1000 ; //dobijamo broj sekundi
        jwtData.exp = expireTimestamp;

        jwtData.ip = req.ip.toString();
        jwtData.ua = req.headers["user-agent"];

        let token: string = jwt.sign(jwtData.toPlainObject(), jwtSecret);

        const responseObject = new LoginInfoDto(
            user.userId,
            user.email,
            token
        );
            return new Promise(resolve => resolve(responseObject));
    }

}

//admin admin token
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbmlzdHJhdG9ySWQiOjQsInVzZXJuYW1lIjoiYWRtaW4iLCJleHAiOjE2MTE2ODIxMDAuNTM3LCJpcCI6Ijo6MSIsInVhIjoiUG9zdG1hblJ1bnRpbWUvNy4yNi44IiwiaWF0IjoxNjEwNDcyNTAwfQ.VTizrPu1EFEeDu1VXk4rqzCMpkV2GpcHhsE9CKy-foY