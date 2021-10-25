# **Authentication system**

This is a project meant to be used as a starting point for APIs that require user authentication (sign up and sign in). And each user should has a role (user or admin) so based on his role can access some endpoints and perform some operations.

# Project Setup

## Requirements:

- install docker
- install docker-compose
- MongoDB database

## To run project locally:

- Clone repo `git clone https://github.com/abdelrhmanali29/authentication.git`
- Add your environment variables in `.env.example`
- Change `.env.example` to '.env.production`
- Run `docker-compose up --build` in root folder
- Use [postman](https://www.postman.com/downloads/) to test endpoints or curl if you're cool
- Can find API docs ([swagger](https://swagger.io/)) at [http://localhost/api/v1/docs](http://localhost/api/v1/docs) **(username: admin, password: admin)**

## Features

- Signup, Login, Logout
- Forget password
- Reset password
- Update password or profile
- Delete user profile
- Create roles and permissions
- Set roles for users
- List roles and permissions
- List users

## Overview

1. User sign up with his email, name and password.
2. Login by email and password then token will send on response cookie.
3. User can get his profile at `/users/me` endpoint
4. User can update his profile at `/users/updateMe` endpoint
5. User can user `/users/forgotPassword` endpoint if he forget his password and will receive reset token at his email
6. User will reset his passwrod after receiving reset token via email by `/users/resetPAssword/:token`
7. Admin can create roles and permissions
8. Admin can set role for specific user
**(NOTE)**: first off all you must create user and set his role with 'admin'

## How to ...?

### Protect endpoints

- check if token is provided
- Verfication token if not valid it will
- Check if user still exists
- Check if user changed password after the token was issued
- If everything is OK, retrun current use

### Restrict endpoints

- Set some of roles that can access the endpoint
- For each request on this endpoint check if user as one or more role for this endpoint

## Security

- Set security HTTP headers
- Limit requests from same API
- Body parser, reading data from body into req.body
- Data sanitization against NoSQL query injection
- Data sanitization against XSS
- Prevent parameter pollution

## TODO

- Email verification.
- Persistent login.
- Account lockout.
