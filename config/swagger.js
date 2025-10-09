// swagger.js (FIXED)
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  // Định nghĩa thông tin cơ bản về API (metadata)
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dealer Management API", // Tên dự án của bạn
      version: "1.0.0",
      description: "API documentation for Dealer Management System",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    servers: [
      {
        url: "http://localhost:3000", // Thay đổi cổng nếu khác
        description: "Local Development Server",
      },
    ],
  }, // Chỉ định các file cần đọc JSDoc comments. // Thay đổi đường dẫn này để khớp với cấu trúc thư mục của bạn.
  apis: ["./routes/*.js"], // Ví dụ: Đọc tất cả các file .js trong thư mục 'routes'
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
