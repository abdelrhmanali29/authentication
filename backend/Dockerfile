FROM node:14.14.0-alpine
WORKDIR '/app'
COPY ./package.json ./
COPY ./*.js ./
RUN npm install
EXPOSE 3000
COPY . .

CMD [ "npm" , "run" , "start" ]