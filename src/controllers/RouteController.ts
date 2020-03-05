import {Controller, Param, Get, Render} from "routing-controllers";

@Controller() 
export class RouteController {

    @Get("/:page")
    @Render("index.ejs")    
    getEJSView(@Param("page") page: string): unknown {
        return {page};
   }
}