import { SetMetadata } from "@nestjs/common"

export const AllowToRoles = (...roles: ("administrator" | "user") []) => {
    return SetMetadata('allow_to_roles', roles);
}

//ovaj metod uzima ili administrator ili user ili i jedno i drugo kao niz takvih argumenata
//te argumente pretvara u niz pojedinacnih elemenata (...roles)
//i setuje u MetaData koji se zove 'allow_to_roles' spisak tih rola