import {Controller, Param, Get, Render} from "routing-controllers";

@Controller("/web") 
export class RouteController {

    @Get("/")
    @Render("index.ejs")    
    getEJSHome(): unknown {
        return {page: "home"};
   }


    @Get("/:page")
    @Render("index.ejs")    
    getEJSView(@Param("page") page: string): unknown {
        return {page};
   }
}