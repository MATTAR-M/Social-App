# Social Media Backend API

A scalable and robust backend infrastructure for a social media platform. This API handles secure user authentication, post creation, and media management, while utilizing WebSockets for real-time messaging and GraphQL for optimized data querying.

## 🚀 Key Features

*   **User Authentication:** Secure registration and login using JWT (JSON Web Tokens) and password hashing.
*   **Media Management:** Direct integration with **AWS S3** for secure, high-performance profile picture and media uploads.
*   **Real-Time Communication:** Live messaging and instant notifications implemented via **Socket.io**.
*   **Advanced Querying:** Flexible and efficient data retrieval using **GraphQL** alongside standard REST endpoints.
*   **Post & Feed Logic:** Endpoints for creating posts, commenting, liking, and generating user-specific timelines.

## 🛠️ Tech Stack

*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **API Architecture:** GraphQL & REST
*   **Real-Time:** Socket.io
*   **Database:** MongoDB & Mongoose ORM *(Update if using MySQL)*
*   **Cloud Storage:** Amazon S3

## ⚙️ Local Installation & Setup

**1. Clone the repository:**
\`\`\`bash
git clone https://github.com/yourusername/social-media-api.git
cd social-media-api
\`\`\`

**2. Install dependencies:**
\`\`\`bash
npm install
\`\`\`

**3. Configure Environment Variables:**
Create a `.env` file in the root directory based on the provided `.env.example`. You will need:
\`\`\`env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
\`\`\`

**4. Start the development server:**
\`\`\`bash
npm run dev
\`\`\`
*The server will start on `http://localhost:3000` and the GraphQL playground will be available at `http://localhost:3000/graphql`.*

## 📖 API Documentation

*   **GraphQL API:** Access the interactive GraphQL playground at `/graphql` to explore schemas and test queries/mutations.
*   **REST Endpoints:** Access the full Postman collection here: **[Insert link to your published Postman collection or Swagger UI]**
