import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'src/entities/administrator.entity';
import { AddAdministratorDto } from 'src/dtos/administrator/add.aministrator.dto';
import { EditAdministratorDto } from 'src/dtos/administrator/edit.administrator.dto';
import { ApiResponse } from 'src/misc/api.response.class';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { AdministratorToken } from 'src/entities/administrator-token.entity';

@Injectable()
export class AdministratorService {
    constructor(
        @InjectRepository(Administrator) 
        private readonly administrator: Repository<Administrator>,

        @InjectRepository(AdministratorToken) 
        private readonly administratorToken: Repository<AdministratorToken>,
    ) { }

    //poziva find koji pronalazi sve zapise koji u tabeli dobijenoj kroz repozitorijum entiteta Administrator
    getAll(): Promise<Administrator[]>{ //funkcija getAll treba da vrati obecanje da ce vratiti niz administratora
        //find vraca promise da ce nam biti vracena lista svih administratora iz tabele administrator
        return this.administrator.find(); 
    }

    async getByUsername(username: string): Promise<Administrator | null> {
        const admin = await this.administrator.findOne({
            username: username
        });

        if(admin){
            return admin;
        }

        return null;
    }

    getById(id: number): Promise<Administrator>{
        return this.administrator.findOne(id);
    }

    //pravljenje novog administratora
    add(data: AddAdministratorDto): Promise<Administrator | ApiResponse> {  //nas servis dobija neki objekat data koji je zapravo AdministratorDto i vraca Administratora ili ApiResponse ako dodje do greske
       //DTO -> Model transformacija  
        const passwordHash = crypto.createHash('sha512');    //administratorname -> administratorname
        passwordHash.update(data.password);                  //password -[~] -> passwordHash SHA512
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        let newAdmin: Administrator = new Administrator();
        newAdmin.username = data.username;
        newAdmin.passwordHash = passwordHashString;

        return new Promise((resolve) => {
            this.administrator.save(newAdmin) //tek kada pokusa da save-uje admina moze da nastane greska - odnosno da npr nije dobar administratorname itd.
            .then(data => resolve(data))      //ako smo uspesno vratili info o adminu koji smo dodali vratimo admina 
            .catch(error => {
                const response: ApiResponse = new ApiResponse("error", -10001);
                resolve(response); 
            });
        }); 
    }

    //vracamo promise da cemo vratiti informacije o novom izmenjenom administratoru
    async editById(id:number, data: EditAdministratorDto): Promise<Administrator | ApiResponse> {
        let admin: Administrator = await this.administrator.findOne(id); //sacekaj dostavljanje jednog admina po Id-ju

        if (admin === undefined) {
            return new Promise((resolve) => {
                resolve(new ApiResponse("error", -1002))
            });
        }
                     
        //DTO -> Model transformacija  
        const passwordHash = crypto.createHash('sha512');    //administratorname -> administratorname
        passwordHash.update(data.password);                  //password -[~] -> passwordHash SHA512
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        admin.passwordHash = passwordHashString;

        return this.administrator.save(admin);
    }
    //add
    //editById
    //deleteById

    async addToken(administratorId: number, token: string, expiresAt: string) {
        const administratorToken = new AdministratorToken();
        administratorToken.administratorId = administratorId;
        administratorToken.token = token;
        administratorToken.expiresAt = expiresAt;

        return await this.administratorToken.save(administratorToken);
    }

    async getAdministratorToken(token: string): Promise<AdministratorToken> {
        return await this.administratorToken.findOne({
            token: token,
        });
    }

    async invalidateToken(token: string): Promise<AdministratorToken | ApiResponse> {
        const administratorToken = await this.administratorToken.findOne({
            token: token,
        });

        if (!administratorToken) {
            return new ApiResponse("error", -10001, "No such refresh token!")
        }

        administratorToken.isValid = 0;

        await this.administratorToken.save(administratorToken);

        return await this.getAdministratorToken(token);
    }

    //u vracenom nizu mogu da se nalaze i AdministratorToken i ApiResponsi
    async invalidateAdministratorTokens(administratorId: number): Promise<(AdministratorToken | ApiResponse)[]> {
        const administratorTokens = await this.administratorToken.find({
            administratorId: administratorId,
        });

        const results = [];

        for (const administratorToken of administratorTokens) {
            results.push(this.invalidateToken(administratorToken.token));
        }

        return results;
    }
}


