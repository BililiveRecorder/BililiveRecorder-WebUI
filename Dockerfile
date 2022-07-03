FROM node:16-alpine AS BUILD
COPY . /src
RUN apk add git
RUN cd /src && npm install && npx vite build

FROM nginx:1.22.0-alpine
COPY --from=BUILD /src/dist /usr/share/nginx/html
COPY --from=BUILD /src/.github/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80