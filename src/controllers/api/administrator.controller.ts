import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { Administrator } from "entities/administrator.entity";
import { AddAdministratorDto } from "src/dtos/administrator/add.aministrator.dto";
import { EditAdministratorDto } from "src/dtos/administrator/edit.administrator.dto";
import { AdministratorService } from "src/services/administrator/administrator.service";

@Controller('api/administrator')  //ruta kojom dolaze zahtevi za ovaj kontroler
export class AdministratorController {
    constructor(
        private administratorService: AdministratorService
    ){ }

    //uzeti sve admine
    // GET http://localhost:3000/api/administrator 
    @Get() 
    getAll(): Promise<Administrator[]>{
        return this.administratorService.getAll();
    }

    //uzeti jednog admina
    // GET http://localhost:3000/api/administrator/4
    @Get(':id') 
    getById( @Param('id') administratorId: number): Promise<Administrator>{ //Param - kaze da se taj parametar zove id koji stavljamo u promenljivu administratorId
        return this.administratorService.getById(administratorId);
    }

    //dodati novog admina
    // PUT http://localhost:3000/api/administrator
    @Put() 
    add(@Body() data: AddAdministratorDto): Promise<Administrator>{
        return this.administratorService.add(data); //servis ce transformisati data iz dto(username i password) u username i passwordHash 
    }

    // izmeniti admina - password
    // POST http://localhost:3000/api/administrator/4
    @Post(':id') //post metodom se salje telo sa novim sadrzajem admina, njih dobijamo kroz Body
    edit(@Param('id') id:number, @Body() data: EditAdministratorDto): Promise<Administrator> {
        return this.administratorService.editById(id, data);
    }

}