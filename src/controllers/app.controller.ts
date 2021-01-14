import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get() //home page, root nase aplikacije http://localhost:3000/
  getIndex(): string {
    return 'Home page!';
  }

}

