import * as Validator from "class-validator";

export class ArticleSearchFeatureComponentDto {
    featureId: number;

    @Validator.IsArray() //values je niz 
    @Validator.IsNotEmpty({ each: true }) //svaki od njih nije prazan
    @Validator.IsString({ each: true }) // da svaki u nizu bude validiran kao string
    @Validator.Length(1, 255, { each: true }) // svaki je ove duzine
    values: string[];
}