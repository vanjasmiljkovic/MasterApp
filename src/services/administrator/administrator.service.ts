import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'entities/administrator.entity';
import { AddAdministratorDto } from 'src/dtos/administrator/add.aministrator.dto';
import { EditAdministratorDto } from 'src/dtos/administrator/edit.administrator.dto';
import { Repository } from 'typeorm';

@Injectable()
export class AdministratorService {
    constructor(
        @InjectRepository(Administrator) 
        private readonly administrator: Repository<Administrator>
    ) { }

    //poziva find koji pronalazi sve zapise koji u tabeli dobijenoj kroz repozitorijum entiteta Administrator
    getAll(): Promise<Administrator[]>{ //funkcija getAll treba da vrati obecanje da ce vratiti niz administratora
        //find vraca promise da ce nam biti vracena lista svih administratora iz tabele administrator
        return this.administrator.find(); 
    }

    getById(id: number): Promise<Administrator>{
        return this.administrator.findOne(id);
    }

    //pravljenje novog administratora
    add(data: AddAdministratorDto): Promise<Administrator>{  //nas servis dobija neki objekat data koji je zapravo AdministratorDto
        const crypto = require('crypto');                   //DTO -> Model transformacija  
        const passwordHash = crypto.createHash('sha512');    //username -> username
        passwordHash.update(data.password);                  //password -[~] -> passwordHash SHA512
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        let newAdmin: Administrator = new Administrator();
        newAdmin.username = data.username;
        newAdmin.passwordHash = passwordHashString;

        return this.administrator.save(newAdmin); 
    }

    //vracamo promise da cemo vratiti informacije o novom izmenjenom administratoru
    async editById(id:number, data: EditAdministratorDto): Promise<Administrator> {
        let admin: Administrator = await this.administrator.findOne(id); //sacekaj dostavljanje jednog admina po Id-ju

        const crypto = require('crypto');                   //DTO -> Model transformacija  
        const passwordHash = crypto.createHash('sha512');    //username -> username
        passwordHash.update(data.password);                  //password -[~] -> passwordHash SHA512
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        admin.passwordHash = passwordHashString;

        return this.administrator.save(admin);
    }
    //add
    //editById
    //deleteById
}


