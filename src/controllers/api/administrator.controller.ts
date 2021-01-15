import { Body, Controller, Get, Param, Post, Put, SetMetadata, UseGuards } from "@nestjs/common";
import { Administrator } from "src/entities/administrator.entity";
import { AddAdministratorDto } from "src/dtos/administrator/add.aministrator.dto";
import { EditAdministratorDto } from "src/dtos/administrator/edit.administrator.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { AdministratorService } from "src/services/administrator/administrator.service";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { RoleCheckerGuard } from "src/misc/role.checker.guard";

@Controller('api/administrator')  //ruta kojom dolaze zahtevi za ovaj kontroler
export class AdministratorController {
    constructor(
        private administratorService: AdministratorService
    ){ }

    //uzeti sve admine
    // GET http://localhost:3000/api/administrator 
    @Get() 
    @UseGuards(RoleCheckerGuard) //koristi RoleCheckerGuard i dozvoli pristup samo administratoru(AllowToRoles - administrator)
    //@SetMetadata('allow_to_roles', ['aministrator']) //koje role imaju pravo pristupa ovoj getAll metodi
    @AllowToRoles('administrator') //AllowToRoles iz allow.to.roles.descriptor.ts -  roli administrator je dozvoljen pristup getAll metodi
    getAll(): Promise<Administrator[]>{
        return this.administratorService.getAll();
    }

    //uzeti jednog admina
    // GET http://localhost:3000/api/administrator/4
    @Get(':id') 
    @UseGuards(RoleCheckerGuard) //koristi RoleCheckerGuard i dozvoli pristup samo administratoru(AllowToRoles - administrator)
    @AllowToRoles('administrator')
    getById( @Param('id') administratorId: number): Promise<Administrator | ApiResponse>{ //Param - kaze da se taj parametar zove id koji stavljamo u promenljivu administratorId
        return new Promise(async(resolve) => {
            let admin = await this.administratorService.getById(administratorId);

            if (admin === undefined) {
              resolve(new ApiResponse("error", -1002));  
            }

            resolve(admin);
        });
    }

    //dodati novog admina
    // PUT http://localhost:3000/api/administrator
    @Put() 
    @UseGuards(RoleCheckerGuard) //koristi RoleCheckerGuard i dozvoli pristup samo administratoru(AllowToRoles - administrator)
    @AllowToRoles('administrator')
    add(@Body() data: AddAdministratorDto): Promise<Administrator | ApiResponse>{
        return this.administratorService.add(data); //servis ce transformisati data iz dto(username i password) u username i passwordHash 
    }

    // izmeniti admina - password
    // POST http://localhost:3000/api/administrator/4
    @Post(':id') //post metodom se salje telo sa novim sadrzajem admina, njih dobijamo kroz Body
    @UseGuards(RoleCheckerGuard) //koristi RoleCheckerGuard i dozvoli pristup samo administratoru(AllowToRoles - administrator)
    @AllowToRoles('administrator')
    edit(@Param('id') id:number, @Body() data: EditAdministratorDto): Promise<Administrator | ApiResponse> {
        return this.administratorService.editById(id, data);
    }

}