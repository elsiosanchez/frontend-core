#!/bin/sh

# Set Public Path to static assets *.html, *.css, *.img, *.js ("publicPath":"/")
cd /usr/share/nginx/html
find . -type f -exec sed -i "s|/base-public-path/|$PUBLIC_PATH|g" {} +
# find -name 'app.*.js' -exec sed -i "s|/base-public-path/|$PUBLIC_PATH|g" {} \;


# folder with dist app files
cd /usr/share/nginx/html/static/js


# Set API Proxy connection
find -name 'app.*.js' -exec sed -i "s|http://localhost/api/|$API_URL|g" {} \;

# Set Task Manager connection
find -name 'app.*.js' -exec sed -i "s|http://localhost:8080/v1|$TASK_MANAGER_URL|g" {} \;

# Set Deploy Version
find -name 'app.*.js' -exec sed -i "s|vue_app_deploy_version_variable|$VUE_APP_DEPLOY_VERSION|g" {} \;

# Set Service Type `dev`, `qa`
find -name 'app.*.js' -exec sed -i "s|vue_app_service_type_variable|$VUE_APP_GENERAL_SERVICE_TYPE|g" {} \;

# Start nginx web server
nginx && tail -f /dev/null
