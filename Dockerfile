FROM node:9.4.0 as builder
WORKDIR /usr/src/la-trace-front
ADD . /usr/src/la-trace-front/
RUN rm -rf node_modules && yarn install --only=production
RUN yarn run build

FROM nginx
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /usr/src/la-trace-front/dist /usr/share/nginx/html/
