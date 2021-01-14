export class UserRegistrationDto {
    email: string;
    password: string; //posle ga hash-ujemo
    forename: string;
    surname: string;
    phoneNumber: string;
    postalAddress: string;
}