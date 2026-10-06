import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Testing')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getOnline(): string {
    return this.appService.getOnline();
  }
}
