import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ChangeOrderStatusDto } from "src/dtos/order/change.order.status.dto";
import { Order } from "src/entities/order.entity";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { ApiResponse } from "src/misc/api.response.class";
import { RoleCheckerGuard } from "src/misc/role.checker.guard";
import { OrderService } from "src/services/order/order.services";

@Controller('api/order')
export class AdministratorOrderController {
    constructor(
        private OrderService: OrderService,
    ) { }

    //doprema informacije o jednoj porudzbini na osnovu njenog id
    @Get(':id')  //GET http://localhost:3000/api/order/:id/
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator')
    async get(@Param('id') id: number): Promise<Order | ApiResponse> {
        const order = await this.OrderService.getById(id);

        if (!order) { //porudzbina sa tim id ne postoji
           return new ApiResponse("error", -9001, "No such order found") 
        }   

        //ako postoji vraca order
        return order;
    }

    @Patch(':id') //promena vrednosti za status porudzbine
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator')
    async changeStatus(@Param('id') id: number, @Body() data: ChangeOrderStatusDto): Promise<Order | ApiResponse> {
        return await this.OrderService.changeStatus(id, data.newStatus);
    }
}