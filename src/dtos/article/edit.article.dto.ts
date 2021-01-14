export class EditArticleDto{
    name: string;
    categoryId: number;
    excerpt: string;
    description: string;
    status: 'available' | 'visible' | 'hidden';
    isPromoted: 0 | 1;
    price: number;
    //features je ovakvih objekata niz gde svaki ima id i value
    features: {
        featureId: number;
        value: string;
    }[] | null; //niz ili null
}

/*
    "features": { //key value parovi
        "1": "1TB", //pod id=1 feature-a je vrednost 1TB
        "3": "SSD" 
*/
