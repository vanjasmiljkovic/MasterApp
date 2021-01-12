export class AddArticleDto{
    name: string;
    categoryId: number;
    excerpt: string;
    description: string;
    price: number;
    //features je ovakvih objekata niz gde svaki ima id i value
    features: {
        featureId: number;
        value: string;
    }[]; //niz
}

/*
    "features": { //key value parovi
        "1": "1TB", //pod id=1 feature-a je vrednost 1TB
        "3": "SSD" 
*/
