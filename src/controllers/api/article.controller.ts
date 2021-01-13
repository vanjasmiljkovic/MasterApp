import { Body, Controller, Param, Post, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Crud } from "@nestjsx/crud";
import { StorageConfig } from "config/storage.config";
import { Article } from "entities/article.entity";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { ArticleService } from "src/services/article/article.service";
import { diskStorage } from "multer";
import { PhotoService } from "src/services/photo/photo.service";
import { Photo } from "entities/photo.entity";
import { ApiResponse } from "src/misc/api.response.class";

@Controller('api/article')
@Crud({  //zelimo da imamo Crud operacije za model podataka koji je definisan tipom propisanim u definiciji Category entiteta
    model: {
        type: Article
    },
    params: {
        id: {
            field: 'articleId',
            type: 'number',
            primary: true
        }
    },
    query: {
        join: {
            category: { //odmah da vidim kojoj kategoriji artikal pripada category - se zove u article entity
                eager: true 
            },
            photos: { //dobijamo odmah i fotografije vezane za taj artikal
                eager: true
            },
            articlePrices: {
                eager: true
            },
            documentations: {
                eager: true
            },
            articleFeatures: {
                eager: true
            },
            features: {
                eager: true
            }
        }
    }
})
export class ArticleController {
    constructor(
        public service: ArticleService, 
        public photoService: PhotoService    
    ) {}

    @Post('createFull') //POST http://localhost:3000/api/article/createFull/
    createFullArticle(@Body() data: AddArticleDto){
        return this.service.createFullArticle(data);
    }

    @Post(':id/uploadPhoto/') //POST https://localhost:3000/api/article/:id/uploadPhoto/
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: StorageConfig.photoDestination,
                filename: (req, file, callback) => { //ova funkcija generise file name na osnovu originalnog file name-a
                    // 'Neka   slika.jpg' -> 20200420-3456765432-Neka-slika.jpg datum-random 10 brojeva i naziv slike

                    let original: string = file.originalname;

                    let normalized = original.replace(/\s+/g, '-'); //bilo koju belinu koja se ponavlja jednom ili vise puta na nivou celog stringa zameni jednom -
                    normalized = normalized.replace(/[^A-z0-9\.\-]/g, ''); //sve sto nije slova od a do z brojevi, tacka i - zameni praznim stringom
                    let now = new Date();
                    let datePart = '';
                    datePart += now.getFullYear().toString();
                    datePart += (now.getMonth() + 1).toString();
                    datePart += now.getDate().toString();

                    let randomPart: string = 
                    new Array(10)  // novi niz ciji
                        .fill(0)
                        .map(e => (Math.random() * 9).toFixed(0).toString()) //svaki element menjamo sa random vrednoscu string od 0 do 9 
                        .join('');  //joinujemo sve te pojedinacne elemente i upisemo u randomPart

                    let fileName = datePart + '-' + randomPart + '-' + normalized;

                    fileName = fileName.toLowerCase();

                    callback(null, fileName);
                }
            }),
            //fileFilter -> Da li dozvoljavamo upload fajla, pre nego sto se taj fajl sacuva u storage - Provera ekstenzije i mimetype-a
            fileFilter: (req, file, callback) => {
                //1. proveri ektenzije: JPG, PNG
                if(!file.originalname.toLowerCase().match(/\.(jpg|png)$/)){
                    req.fileFilterError = 'Bad file extension!';
                    callback(null, false); //kazemo ovde da nema errora, ali i dalje je false - ne treba prihvatiti ovaj fajl
                    return;
                }
                //2. Tip sadrzaja: image/jpeg, image/png (mimetype)
                if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))){
                    req.fileFilterError = 'Bad file content!';
                    callback(null, false);
                    return;
                }
                //Kada je sve kako treba
                callback(null, true); //nema erora, true znaci prihvatiti taj fajl

            },
            limits: {
                files: 1, //dozvoljavamo da se upload 1 fajl
                fileSize: StorageConfig.photoMaxFileSize, //taj max kapacitet je definisam u photo.config
            },

        })
    )

    //KADA JE FAJL UPLOAD-OVAN pravi se zapis koji se salje bazi podataka posredstvom servisa 
    async uploadPhoto(
        @Param('id') articleId: number, 
        @UploadedFile() photo,
        @Req() req
    ): Promise < ApiResponse | Photo> {
        if(req.fileFilterError){ //ako postoji ovaj fileFilterError necemo nista dalje da radimo
            return new ApiResponse('error', -4002, req.fileFilterError); //treci argument je poruka koja ce biti poslata, a mi saljemo bas taj fileFilterError
        }

        if(!photo){ //ako iz nekog razloga ne postoji uploadovana slika
            return new ApiResponse('error', -4002,'File not uploaded!'); //treci argument je poruka koja ce biti poslata
        }

        //TODO: Real Mime Type check

        //TODO: Save a resized file

        //ako se ne desi neka greska odozgo, cuvamo fotografiju
        let imagePath = photo.filename; //u zapis u bazu podataka

        const newPhoto: Photo = new Photo();
        newPhoto.articleId = articleId;
        newPhoto.imagePath = imagePath;

        const savedPhoto = await this.photoService.add(newPhoto); //add iz photoService

        if (!savedPhoto) {
            return new ApiResponse('error', -4001);
        }

        return savedPhoto; //uspesno sacuvana fotografija
    }
}