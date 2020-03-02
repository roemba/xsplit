import {Get, JsonController} from "routing-controllers";
import {Container} from "typedi";
import winston, {Logger} from "winston";
import {RippleLibService} from "../services/RippleLibService";
import {GetServerInfoResponse} from "ripple-lib/dist/npm/common/serverinfo";

@JsonController("/api")
export class AppController {
   log: Logger;
   constructor() {
      this.log = winston.createLogger({
          transports: [
              new winston.transports.Console()
            ]
      });
  }

  @Get("")
  getAll(): Promise<GetServerInfoResponse> {
     return Container.get(RippleLibService).getServerInfo();
  }
}