import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [], //komunikacija sa eksternim resursima - baza, api ...
})
export class AppModule {}
