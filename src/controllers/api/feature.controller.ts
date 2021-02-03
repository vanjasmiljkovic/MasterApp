import { All, Controller, Get, Param, UseGuards } from "@nestjs/common";
import { Crud } from "@nestjsx/crud";
import DistinctFeatureValuesDto from "src/dtos/feature/distinct.feature.values.dto";
import { Feature } from "src/entities/feature.entity";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { RoleCheckerGuard } from "src/misc/role.checker.guard";
import { FeatureService } from "src/services/feature/feature.service";

@Controller('api/feature')
@Crud({  //zelimo da imamo Crud operacije za model podataka koji je definisan tipom propisanim u definiciji Feature entiteta
    model: {
        type: Feature
    },
    params: {
        id: {
            field: 'featureId',
            type: 'number',
            primary: true
        }
    },
    query: {
        join: {
            category: {
                eager: true
            },
            articleFeatures: {
                eager: false
            },
            articles: {
                eager: false
            }
        }
    },
    routes: {
        only: [  //ovo ce biti dostupno od mehanizama za upravljanje podacima nad feature controllerom
            "createOneBase",
            "createManyBase",
            "updateOneBase",
            "getManyBase",
            "getOneBase",
        ],
        createOneBase: {
            decorators: [  //niz dekoratora koje zelimo da primenimo na createOneBase metod
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator'),
            ]
        },
        createManyBase: {
            decorators: [  //niz dekoratora koje zelimo da primenimo na createOneBase metod
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator'),
            ]
        },
        updateOneBase: {
            decorators: [  //niz dekoratora koje zelimo da primenimo na createOneBase metod
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator'),
            ]
        },
        getManyBase: {
            decorators: [  //niz dekoratora koje zelimo da primenimo na createOneBase metod
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator', 'user'),
            ]
        },
        getOneBase: {
            decorators: [  //niz dekoratora koje zelimo da primenimo na createOneBase metod
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator', 'user'),
            ]
        },
    }
})
export class FeatureController {
    constructor(public service: FeatureService) {}

    @Get('values/:categoryId')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator', 'user')
    async getDistinctValuesByCategoryId(@Param('categoryId') categoryId:number): Promise<DistinctFeatureValuesDto> {
        return await this.service.getDistinctValuesByCategoryId(categoryId);
    }
}