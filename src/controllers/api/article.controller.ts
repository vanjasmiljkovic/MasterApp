import { Body, Controller, Delete, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Crud } from "@nestjsx/crud";
import { StorageConfig } from "config/storage.config";
import { Article } from "src/entities/article.entity";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { ArticleService } from "src/services/article/article.service";
import { diskStorage } from "multer";
import { PhotoService } from "src/services/photo/photo.service";
import { Photo } from "src/entities/photo.entity";
import { ApiResponse } from "src/misc/api.response.class";
import * as fileType from 'file-type';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { EditArticleDto } from "src/dtos/article/edit.article.dto";
import { RoleCheckerGuard } from "src/misc/role.checker.guard";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { ArticleSearchDto } from "src/dtos/article/article.search.dto";


@Controller('api/article')
@Crud({     //zelimo da imamo Crud operacije za model podataka koji je definisan tipom propisanim u definiciji Category entiteta
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
    },
    routes: {
        only: [ //OD SVIH FUNKCIONALNOSTI KOJE SU DOSTUPNE U CRUD KONTROLERU MI DOZVOLJAVAMO SAMO OVE DVE, JER SMO OSTALE RUCNO IMPLEMENTIRALI DOLE
            'getOneBase',
            'getManyBase'
        ],
        getOneBase: {
            decorators: [
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator', 'user')
            ]
        },
        getManyBase: {
            decorators: [
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator', 'user')
            ]
        },
    }
})
export class ArticleController {
    constructor(
        public service: ArticleService, 
        public photoService: PhotoService    
    ) {}

    //metod za dodavanje novog artikla
    @Post() //POST http://localhost:3000/api/article/
    @UseGuards(RoleCheckerGuard) //koristi RoleCheckerGuard i dozvoli pristup samo administratoru(AllowToRoles - administrator)
    @AllowToRoles('administrator')
    createFullArticle(@Body() data: AddArticleDto){ //ovaj Dto ima vise informacija nego sto sam artikal entitet ima, jer smo tu ukljucili i osobine, cenu itd.
        return this.service.createFullArticle(data);
    }

    //metod za editovanje postojeceg artikla PATCH http://localhost:3000/api/article/2/
    @Patch(':id')
    @UseGuards(RoleCheckerGuard) //koristi RoleCheckerGuard i dozvoli pristup samo administratoru(AllowToRoles - administrator)
    @AllowToRoles('administrator')
    //zahteva id, ali i da iz body-ja izvucemo informacije o tom data tranfer objektu
    editFullArticle(@Param('id') id: number, @Body() data: EditArticleDto){
        return this.service.editFullArticle(id, data);  //vracamo sve ono sto ce nas servis da vrati kada pozovemo editFullArticle - njemu prosledjujemo id artikla koji se menja i data kojima ce se zameniti
    }

    @Post(':id/uploadPhoto/') //POST https://localhost:3000/api/article/:id/uploadPhoto/
    @UseGuards(RoleCheckerGuard) //koristi RoleCheckerGuard i dozvoli pristup samo administratoru(AllowToRoles - administrator)
    @AllowToRoles('administrator')
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: StorageConfig.photo.destination,
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
                    req.fileFilterError = 'Bad file content type!';
                    callback(null, false);
                    return;
                }
                //Kada je sve kako treba
                callback(null, true); //nema erora, true znaci prihvatiti taj fajl

            },
            limits: {
                files: 1, //dozvoljavamo da se upload 1 fajl
                fileSize: StorageConfig.photo.maxSize, //taj max kapacitet je definisam u photo.config
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
        //1) proveravamo da li mozemo da detektujemo file type
        //2)ako smo detektovali uzimamo mime komponentu i pitamo da li je jpeg ili png
        const fileTypeResult = await fileType.fromFile(photo.path); 
        if(!fileTypeResult){ //nismo uspeli da detektujemo fileType
            fs.unlinkSync(photo.path);//Obrisati taj fajl
            return new ApiResponse('error', -4002,'Can not detect file type!'); //treci argument je poruka koja ce biti poslata
        }

        const realMimeType = fileTypeResult.mime;
        if (!(realMimeType.includes('jpeg') || realMimeType.includes('png'))){
            fs.unlinkSync(photo.path);//Obrisati taj fajl - sacekamo da se obrise pa saljemo response
            return new ApiResponse('error', -4002,'Bad file content type!'); //treci argument je poruka koja ce biti poslata
        }

        //TODO: Save a resized file
        await this.createResizedImage(photo, StorageConfig.photo.resize.thumb); //primenjuje settings za thumb - iz storage.config.ts
        await this.createResizedImage(photo, StorageConfig.photo.resize.small); //primenjuje settings za small - iz storage.config.ts

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

    async createResizedImage(photo, resizeSettings){
        const originalFilePath = photo.path;
        const fileName = photo.filename;

        const destinationFilePath = 
        StorageConfig.photo.destination + 
        resizeSettings.directory + 
        fileName;

        await sharp(originalFilePath)  //pomocu sharp-a uzmi originalnu sliku
            .resize({
                fit: 'contain', //zelimo da se cela slika sacuva, pa ako nije istih proporcija dodace se beline - suprotno je 'cover' gube se delovi slike ako nije ista proporcija kao zeljena
                width: resizeSettings.width,
                height: resizeSettings.height,
                background: {
                    r: 255, g: 255, b: 255, alpha: 0.0 //bela pozadina ako je full color, ili bezbojno alpha: 0.0 za png
                }
            })
            .toFile(destinationFilePath); //kada resize-uje sliku da je sacuva
 
    }

    //Mehanizam za brisanje datoteka
    //http://localhost:3000/api/article/1/deletePhoto/45
    @Delete(':articleId/deletePhoto/:photoId')
    @UseGuards(RoleCheckerGuard) //koristi RoleCheckerGuard i dozvoli pristup samo administratoru(AllowToRoles - administrator)
    @AllowToRoles('administrator')
    public async deletePhoto(
        @Param('articleId') articleId: number,
        @Param('photoId') photoId: number
    ) {
        //1) proveravamo da li uopste ta fotografija koja se brise postoji i da li se zajedno articleid i photoId match-uju
        const photo = await this.photoService.findOne({
            articleId: articleId, //articleId tog photo entiteta koji izvlacimo da je jednak articleId parametru iz request metoda
            photoId: photoId
        });

        //ako fotografija ne postoji
        if(!photo) {
            return new ApiResponse('error', -4004,'Photo not found!'); 
        }

        //ako postoji treba da brisemo te fotografije iz photos, thumb i small foldera
        try{
            fs.unlinkSync(StorageConfig.photo.destination + photo.imagePath);
            fs.unlinkSync(StorageConfig.photo.destination + 
                        StorageConfig.photo.resize.thumb.directory + 
                        photo.imagePath);
            fs.unlinkSync(StorageConfig.photo.destination + 
                        StorageConfig.photo.resize.small.directory + 
                        photo.imagePath);
        } catch (e) { }

        //zahtev za brisanje fotografije iz baze podataka
        const deleteResult = await this.photoService.deleteById(photo.photoId);
        
        if (deleteResult.affected === 0){  //affected - broj koji ako je 0 - 0 fajlova je obrisano / 1 - 1 fajl je obrisan 
            return new ApiResponse('error', -4004,'Photo not found!'); 
        }

        return new ApiResponse('ok', 0,' One photo deleted!'); 
    }

    @Post('search')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator', 'user')
    async search(@Body() data: ArticleSearchDto): Promise<Article[]> { //search uzima iz Body-ja data tipa articleSearchDto
        return await this.service.search(data);
    }
}