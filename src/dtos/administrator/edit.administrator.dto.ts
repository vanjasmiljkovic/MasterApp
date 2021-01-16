import * as Validator  from "class-validator";

export class EditAdministratorDto {
    //prilikom editovanja administratora dopustamo samo da menja svoj password ali ne i username!
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(6, 128)
    password: string;
}
