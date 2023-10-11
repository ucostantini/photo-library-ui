# Welcome to the Photo Library project, organizing and finding photos made easier !

# Docker
1. Clone this project
2. docker-compose up -d
3. Access localhost:5100
4. Profit !

# Run this project for development

## Requirements

- Running MinIO Instance
- SQLite installed
- SQLite file database created and tables created (tables located in /server/resources/tables.sql)

## Run !

1. Clone this project
2. Run "npm install" in both server/ and client/ folders
3. Fill out .env.bak file with relevant information and rename it to ".env"
4. Run "npm run start" in server/ folder then "ng start" in client/folder
5. Server is served at localhost:3000 and client at localhost:4200
6. Enjoy !
