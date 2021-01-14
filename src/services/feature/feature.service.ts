import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Feature } from "src/entities/feature.entity";
import { Repository } from "typeorm";

@Injectable()
export class FeatureService extends TypeOrmCrudService<Feature> {
    constructor(@InjectRepository(Feature)private readonly feature: Repository<Feature>){ //KADA POMENEM NEKI REPOZITORIJUM, ODMAH U app.module MORAM DA GA DODAM U TypeOrmModule
        super(feature); //prosledjujemo konstruktoru super klase TypeOrmCrudService
    }
}

