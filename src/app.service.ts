import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getOnline(): string {
    return 'HELP DESK - Api RestFull... Online!';
  }
}
