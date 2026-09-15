// ==========================================
// PASSWORD HASHING
// ==========================================

async function hashPassword(password) {

    const encoder = new TextEncoder();

    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        data
    );

    const hashArray = Array.from(
        new Uint8Array(hashBuffer)
    );

    const hashHex = hashArray
        .map(function (byte) {
            return byte.toString(16).padStart(2, "0");
        })
        .join("");

    return hashHex;
}


// ==========================================
// GET USERS FROM LOCAL STORAGE
// ==========================================

function getUsers() {

    const savedUsers =
        localStorage.getItem("users");

    if (!savedUsers) {
        return [];
    }

    try {

        return JSON.parse(savedUsers);

    } catch (error) {

        return [];
    }
}


// ==========================================
// REGISTRATION
// ==========================================

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const username =
                document
                    .getElementById("username")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById("password")
                    .value;


            const message =
                document.getElementById(
                    "registerMessage"
                );


            // Check empty fields
            if (
                username === "" ||
                email === "" ||
                password === ""
            ) {

                message.textContent =
                    "Please fill in all fields.";

                message.style.color = "red";

                return;
            }


            // Check password
            if (
                password.length < 8 ||
                !/[0-9]/.test(password)
            ) {

                message.textContent =
                    "Password must be at least 8 characters and contain at least 1 number.";

                message.style.color = "red";

                return;
            }


            // Get existing users
            const users = getUsers();


            // Check duplicate username or email
            const userExists =
                users.some(function (user) {

                    return (
                        user.username.toLowerCase() ===
                            username.toLowerCase()
                        ||
                        user.email.toLowerCase() ===
                            email
                    );

                });


            if (userExists) {

                message.textContent =
                    "Username or email already exists.";

                message.style.color = "red";

                return;
            }


            // Hash password
            const passwordHash =
                await hashPassword(password);


            // Create new user
            const newUser = {

                username: username,

                email: email,

                passwordHash: passwordHash

            };


            // Add user
            users.push(newUser);


            // Save user
            localStorage.setItem(
                "users",
                JSON.stringify(users)
            );


            // Show success
            message.textContent =
                "Registration successful! You can now log in.";

            message.style.color = "green";


            // Clear form
            registerForm.reset();

        }
    );
}


// ==========================================
// LOGIN// ==========================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const identifier =
                document
                    .getElementById(
                        "loginIdentifier"
                    )
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById(
                        "loginPassword"
                    )
                    .value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            // Check empty fields
            if (
                identifier === "" ||
                password === ""
            ) {

                message.textContent =
                    "Please fill in all fields.";

                message.style.color = "red";

                return;
            }


            // Get registered users
            const users = getUsers();


            // Hash entered password
            const passwordHash =
                await hashPassword(password);


            // Find matching user
            const user =
                users.find(function (user) {

                    const usernameMatch =
                        user.username
                            .toLowerCase() ===
                        identifier;


                    const emailMatch =
                        user.email
                            .toLowerCase() ===
                        identifier;


                    const passwordMatch =
                        user.passwordHash ===
                        passwordHash;


                    return (
                        (usernameMatch ||
                            emailMatch) &&
                        passwordMatch
                    );

                });


            // Invalid login
            if (!user) {

                message.textContent =
                    "Invalid username/email or password.";

                message.style.color = "red";

                return;
            }


            // Create login session
            const loggedInUser = {

                username: user.username,

                email: user.email

            };


            // Save session
            sessionStorage.setItem(
                "loggedInUser",
                JSON.stringify(loggedInUser)
            );


            // Redirect to dashboard
            window.location.href =
                "dashboard.html";

        }
    );
}


// ==========================================
// PROTECT DASHBOARD
// ==========================================

const welcomeMessage =
    document.getElementById(
        "welcomeMessage"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (welcomeMessage && logoutBtn) {

    const loggedInUser =
        sessionStorage.getItem(
            "loggedInUser"
        );


    // User is NOT logged in
    if (!loggedInUser) {

        window.location.href =
            "login.html";

    } else {

        const user =
            JSON.parse(loggedInUser);


        welcomeMessage.textContent =
            "Hello, " + user.username + "!";

    }


    // Logout
    logoutBtn.addEventListener(
        "click",
        function () {

            sessionStorage.removeItem(
                "loggedInUser"
            );


            window.location.href =
                "login.html";

        }
    );
}