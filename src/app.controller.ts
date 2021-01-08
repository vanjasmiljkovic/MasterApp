import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get() //home page, root nase aplikacije http://localhost:3000/
  getIndex(): string {
    return 'Home page!';
  }

  @Get('world') // http://localhost:3000/world
  getWorld(): string {
    return 'World!';
  }
}
