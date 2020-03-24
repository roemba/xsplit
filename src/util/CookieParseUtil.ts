export class CookieParseUtil {
    static getUsername(): string {

        const cookie = "; " + document.cookie;
        const bearerStr = cookie.split("; ")[1];
        const bearer = window.atob(bearerStr.replace("bearer=",""));
        const username = bearer.split(":")[0];

        return username;
    } 
}