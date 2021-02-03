import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Documentation } from "src/entities/documentation.entity";
import { Repository } from "typeorm";

@Injectable()
export class PdfService extends TypeOrmCrudService<Documentation> {
    constructor(@InjectRepository(Documentation) private readonly pdf: Repository<Documentation>)   
    { 
        super(pdf); //prosledjujemo konstruktoru super klase TypeOrmCrudService
    }

    add(newPdf: Documentation): Promise<Documentation> {
        return this.pdf.save(newPdf);
    }

    //uzima id one fotografije koju servis zahteva da obrise
    //prosledice repozitorijumu (Photo) zahtev za brisanje fotografije tog id-ja
    //sacekace ishod i taj ishod ce vratiti kao rezultat
    async deleteById(id: number){
        return await this.pdf.delete(id);
    }
}