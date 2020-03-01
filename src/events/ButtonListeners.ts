function registerUser() {
    const fullName = (document.getElementById("fullName") as HTMLInputElement).value;
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const username = (document.getElementById("username") as HTMLInputElement).value;
    const publicKey = (document.getElementById("publicKey") as HTMLInputElement).value;
    const user = {
        name: fullName,
        email: email,
        username: username,
        publicKey: publicKey
    }

    const data = JSON.stringify(user);
    alert(data);
    
}

document.getElementById("register").addEventListener("click", registerUser);
