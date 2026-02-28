# syntax=docker/dockerfile:1

FROM node:lts-alpine AS build
WORKDIR /movinin/frontend
COPY ./frontend ./
COPY ./frontend/.env.docker.example .env
COPY ./packages /movinin/packages

ARG SERVICE_URL_MI_BACKEND
RUN if [ -n "$SERVICE_URL_MI_BACKEND" ]; then \
      sed -i "s|VITE_MI_API_HOST=.*|VITE_MI_API_HOST=${SERVICE_URL_MI_BACKEND}|" .env && \
      sed -i "s|VITE_MI_CDN_USERS=.*|VITE_MI_CDN_USERS=${SERVICE_URL_MI_BACKEND}/cdn/movinin/users|" .env && \
      sed -i "s|VITE_MI_CDN_PROPERTIES=.*|VITE_MI_CDN_PROPERTIES=${SERVICE_URL_MI_BACKEND}/cdn/movinin/properties|" .env && \
      sed -i "s|VITE_MI_CDN_LOCATIONS=.*|VITE_MI_CDN_LOCATIONS=${SERVICE_URL_MI_BACKEND}/cdn/movinin/locations|" .env; \
    fi

RUN npm install --force
RUN npm run build

FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf -- *
COPY --from=build /movinin/frontend/build .
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80
EXPOSE 443
