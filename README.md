# IoT Website - Next.js & Node.js

## 📋 Description

This is a fullstack IoT web application built with **Next.js** for the frontend and **Node.js (Express)** for the backend. It demonstrates modern web development best practices, including server-side rendering, RESTful APIs, authentication, and database integration.

## 🚀 Features

* 🔥 Frontend with Next.js 14 (App Router)
* ⚙️ Backend with Node.js and Express
* 🛠️ RESTful API communication
* 🔐 JWT-based Authentication (Login/Register) using [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
* 🗔️ Database integration (MongoDB)
* 🌐 CORS and environment variable support
* 📄 Form validation (Client using [Just-validate Lib](https://github.com/horprogs/Just-validate) & Server side using [Joi Lib](https://joi.dev/api/?v=17.13.3))
* 💻 Responsive UI with Tailwind CSS 
* ✉️ Automatic email sending for OTP Reset password using [NodeMailer](https://nodemailer.com/)

## 🧱 Tech Stack

| Layer          | Technology                                                 |
| -------------- | ---------------------------------------------------------- |
| Frontend       | Next.js, React, Tailwind CSS                               |
| Backend        | Node.js, Express.js                                        |
| Database       | MongoDB                                                    |
| Authentication | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) |

## 🛠️ How to Run

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install Dependencies

#### Frontend (Next.js)

```bash
cd client
npm install
```

#### Backend (Express)

```bash
cd server
yarn install
```

### 3. Set Up Environment Variables

Create the following environment configuration files:

* `client/.env.local` for the Next.js frontend
* `server/.env` for the Express backend

These should include necessary variables such as API base URLs, JWT secrets, database URIs, SMTP settings, etc.

### 4. Run the Project

#### Start Backend Server

```bash
cd server
npm run dev
```

#### Start Frontend

```bash
cd client
yarn start
```

Your application should now be running locally.

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend API: [http://localhost:8000](http://localhost:8000)
