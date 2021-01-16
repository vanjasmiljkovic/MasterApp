import * as Validator from "class-validator";

export class AddAdministratorDto {
    //ova dva podatka ocekujemo od klijenta kada se pravi administrator
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Matches(/^[a-z][a-z0-9\.]{3,30}[a-z0-9]$/) //prvi je obavezno slovo(a-z) i poslednji obavezno broj ili slovo
    username: string;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(6, 128)
    password: string;
}
