import { Controller, UseGuards } from "@nestjs/common";
import { Crud } from "@nestjsx/crud";
import { Category } from "src/entities/category.entity";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { RoleCheckerGuard } from "src/misc/role.checker.guard";
import { CategoryService } from "src/services/category/category.service";

@Controller('api/category')
@Crud({  //zelimo da imamo Crud operacije za model podataka koji je definisan tipom propisanim u definiciji Category entiteta
    model: {
        type: Category
    },
    params: {
        id: {
            field: 'categoryId',
            type: 'number',
            primary: true
        }
    },
    query: {
        join: {
            categories: {
                eager: true //odmah prikazuje potkateogrije
            },
            features: {
                eager: true //da odmah prikaze osobine koje ima ta kateogrija
            },
            parentCategory: {
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
export class CategoryController {
    constructor(public service: CategoryService) {}
}