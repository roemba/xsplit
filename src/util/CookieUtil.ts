export class CookieUtil {
    static async getUsername(): Promise<string> {
         const response = await fetch("/api/login/whoAmI", {
             method: "GET",
             headers: {
                 "Content-Type": "application/json"
             },
         });
         const string = await response.json();
         return string.username;
     }
 }