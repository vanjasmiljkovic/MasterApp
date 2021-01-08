import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'entities/administrator.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdministratorService {
    constructor(
        @InjectRepository(Administrator) 
        private readonly administrator: Repository<Administrator>
    ) { }

    getAll(): Promise<Administrator[]>{ //funkcija getAll treba da vrati obecanje da ce vratiti niz administratora
        //find vraca promise da ce nam biti vracena lista svih administratora iz tabele administrator
        return this.administrator.find(); 
    }

    getById(id: number): Promise<Administrator>{
        return this.administrator.findOne(id);
    }
}
