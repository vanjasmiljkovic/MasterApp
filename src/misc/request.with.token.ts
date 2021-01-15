//radimo nad express modulom
//formiramo ili editujemo Request interfejs

import { JwtDataDto } from "src/dtos/auth/jwt.data.dto";

declare module 'express' {
    interface Request { //dopunjujemo ga sa token
        token: JwtDataDto; //token je jwtDataDto tipa
    }
}   