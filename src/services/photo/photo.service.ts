import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Photo } from "src/entities/photo.entity";
import { Repository } from "typeorm";

@Injectable()
export class PhotoService extends TypeOrmCrudService<Photo> {
    constructor(@InjectRepository(Photo) private readonly photo: Repository<Photo>)   
    { 
        super(photo); //prosledjujemo konstruktoru super klase TypeOrmCrudService
    }

    add(newPhoto: Photo): Promise<Photo> {
        return this.photo.save(newPhoto);
    }

    //uzima id one fotografije koju servis zahteva da obrise
    //prosledice repozitorijumu (Photo) zahtev za brisanje fotografije tog id-ja
    //sacekace ishod i taj ishod ce vratiti kao rezultat
    async deleteById(id: number){
        return await this.photo.delete(id);
    }
}