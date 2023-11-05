import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition:{
        openapi: "3.0.0",
        info:{
            title: "Rest Loan",
            version: "0.0.0",
        },
        servers: [
            {
                url: 'http://localhost:8080',
            },
            {
                url: 'https://r-loan.onrender.com',
            },
        ],
        components:{
            // securitySchemas: {
            //     bearerAuth: {
            //         type: "http",
            //         scheme: "bearer",
            //         bearerFormat: "JWT",
            //     }
            // }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: [
        "./routes/*.js",
        "./models/*.js",
    ]
}

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app, port) => {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.get('/docs.json', (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    })
}

export default swaggerDocs
