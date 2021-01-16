import * as Validator from "class-validator";
import { ArticleFeatureComponentDto } from "./article.feature.component.dto";

export class EditArticleDto{
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(5, 128)
    name: string;

    categoryId: number;
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(10, 255)
    excerpt: string;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(10, 255)
    description: string;

    @Validator.IsNotEmpty()
    @Validator.IsPositive()
    @Validator.IsNumber({
        allowInfinity: false,
        allowNaN: false,
        maxDecimalPlaces: 2,
    })
    price: number;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.IsIn(["available", "visible", "hidden"])
    status: 'available' | 'visible' | 'hidden';

    @Validator.IsNotEmpty()
    @Validator.IsIn([0,1])
    isPromoted: 0 | 1;

    @Validator.IsOptional() //jer moze biti i null
    @Validator.IsArray()
    @Validator.ValidateNested({
        always: true, //svi objekti unutar ovog niza trebaju da budu validirani
    })
    features: ArticleFeatureComponentDto[] | null; //niz ovih komponenata

}

/*
    "features": { //key value parovi
        "1": "1TB", //pod id=1 feature-a je vrednost 1TB
        "3": "SSD" 
*/
