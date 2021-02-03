import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { StorageConfig } from 'config/storage.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(StorageConfig.photo.destination, {
    prefix: StorageConfig.photo.urlPrefix,
    maxAge: StorageConfig.photo.maxAge,
    index: false, //ne moze da se indeksira - ne moze neko da prelistava sadrzaj naseg direktorijuma
    //http://localhost:3000/assets/photos/small/2021113-7681824124-profil.jpg i prikazace mi sliku
    //ali http://localhost:3000/assets/photos/ vraca error jer ne mzoe da prelistava folder - indeksiranje je zabranjeno
  });

  app.useStaticAssets(StorageConfig.pdf.destination, {
    prefix: StorageConfig.pdf.urlPrefix,
    maxAge: StorageConfig.pdf.maxAge,
    index: false, //ne moze da se indeksira - ne moze neko da prelistava sadrzaj naseg direktorijuma
    //http://localhost:3000/assets/photos/small/2021113-7681824124-profil.jpg i prikazace mi sliku
    //ali http://localhost:3000/assets/photos/ vraca error jer ne mzoe da prelistava folder - indeksiranje je zabranjeno
  });

  //zelimo da nasa aplikacija koristi mehanizam validacije
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors(); //omogucavamo komunikaciju sa nasim API-jem bez obzira odakle ona dolazi
  
  await app.listen(3000);
}
bootstrap();
