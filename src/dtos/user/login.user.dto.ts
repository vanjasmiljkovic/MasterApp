import * as Validator from "class-validator";

export class LoginUserDto {

    @Validator.IsNotEmpty()
    @Validator.IsEmail({
        allow_ip_domain: false, //vs@127.0.0.1 ne moze
        allow_utf8_local_part: true,
        require_tld: true, //vs@localhost ne moze mora da ima neki top level domain (.com ....)
    })
    email: string;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(6, 128)
    password: string;
}