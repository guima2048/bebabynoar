server {
    listen 80;
    server_name bebaby.app www.bebaby.app;

    location /fonts/ {
        alias /CAMINHO/ABSOLUTO/DO/SEU/PROJETO/public/fonts/;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
        log_not_found off;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~* \.(woff2?|ttf|otf|eot)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
        log_not_found off;
    }
} 