import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";
import { Reflector } from "@nestjs/core";


@Injectable()
export class RoleCheckerGuard implements CanActivate{ //da bi bio guard mora da implementira interfejs CanActivate
    constructor(private reflector: Reflector) { }
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        //iz tokena izvlacimo korisnikovu rolu
        //true - odobravamo izvrsavanje metoda
        //false - ne odobravamo izvrsavanje metoda

        const req: Request = context.switchToHttp().getRequest();  //uzimamo request iz http zahteva
        const role = req.token.role; //iz requesta pristupamo tokenu, pa u njemu pristupamo roli

        //ovde cemo dobiti koja rola je dozvoljena za neku funkciju (handler)
        const allowedToRoles = 
            this
            .reflector 
            .get<("administrator" | "user")[]>('allow_to_roles', context.getHandler());  //uzeti niz vrednosti koje su administrator ili user

        if(!allowedToRoles.includes(role)) { //ako u spisku dozvoljenih rola nema ove nase role koju smo izvukli iz tokena
            return false;
        }

        return true;

        //iz contexta uzimamo handler(npr. add funkcija u administrator.controller)
        //iz tog handler-a pristupamo AllowToRoles metapodatku
        //taj metapodatak sadrzi vrednosti koje su niz podataka vrednosti ili user ili administrator 
        //i to nam dostavlja taj reflector
        //i stavlja u allowedToRoles

    }
    
}