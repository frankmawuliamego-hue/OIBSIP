# Login Authentication System

## Description

A simple client-side authentication system that allows users to register, log in, access a protected dashboard, and log out.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Local Storage
- Session Storage
- SHA-256

## Features

- User registration
- Username and email validation
- Password validation
- Minimum 8-character password requirement
- Password must contain at least 1 number
- Duplicate username/email detection
- Login using username or email
- Invalid login error handling
- Protected dashboard
- Logout functionality
- Password hashing using SHA-256
- Responsive design

## How It Works

User registration details are stored in the browser's local storage. Passwords are hashed using SHA-256 instead of being stored as plain text.

After successful login, a session is created using session storage. Users who are not logged in cannot access the dashboard.

## How to Run

1. Download or clone the project.
2. Open the project folder.
3. Open register.html using a web browser or Live Server.
4. Create an account.
5. Log in using the registered username/email and password.

## Project Purpose

This project was developed as part of the Oasis Infobyte Web Development & Designing internship to practice form validation, JavaScript, browser storage, password hashing, and basic authentication concepts.

## Author

Frank Mawuli Amego