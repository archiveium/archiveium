#!/usr/bin/env bash

set -e

# START - App related checks
role=${CONTAINER_ROLE:-app}
queue=${QUEUE_NAME:-default}
timeout=${QUEUE_TIMEOUT:-default}

until PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -d "$DB_DATABASE" -U "$DB_USERNAME" -c '\q'; do
  echo "Postgres is unavailable - sleeping"
  sleep 1
done
echo "Postgres is up, executing commands"

mkdir -p /var/www/html/storage/app/attachments /var/www/html/storage/app/public
mkdir -p /var/www/html/storage/framework/cache /var/www/html/storage/framework/sessions /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/logs
chown -R unit:unit /var/www/html/storage
chown -R unit:unit /var/www/html/bootstrap
php artisan config:cache
php artisan route:cache

echo "Running container under '$role' role"

if [ "$role" = "queue" ]; then
    echo "Running '$queue' queue"
    php /var/www/html/artisan queue:work --queue="$queue" --timeout="$timeout"
    exit 1
elif [ "$role" = "scheduler" ]; then
    while [ true ]
    do
      php /var/www/html/artisan schedule:run --no-interaction &
      sleep 60
    done
    exit 1
fi

php artisan migrate --force
php artisan db:seed --force
# END - App related checks

curl_put()
{
    RET=`/usr/bin/curl -s -w '%{http_code}' -X PUT --data-binary @$1 --unix-socket /var/run/control.unit.sock http://localhost/$2`
    RET_BODY=${RET::-3}
    RET_STATUS=$(echo $RET | /usr/bin/tail -c 4)
    if [ "$RET_STATUS" -ne "200" ]; then
        echo "$0: Error: HTTP response status code is '$RET_STATUS'"
        echo "$RET_BODY"
        return 1
    else
        echo "$0: OK: HTTP response status code is '$RET_STATUS'"
        echo "$RET_BODY"
    fi
    return 0
}

if [ "$1" = "unitd" -o "$1" = "unitd-debug" ]; then
    if /usr/bin/find "/var/lib/unit/" -mindepth 1 -print -quit 2>/dev/null | /bin/grep -q .; then
        echo "$0: /var/lib/unit/ is not empty, skipping initial configuration..."
    else
        if /usr/bin/find "/docker-entrypoint.d/" -mindepth 1 -print -quit 2>/dev/null | /bin/grep -q .; then
            echo "$0: /docker-entrypoint.d/ is not empty, launching Unit daemon to perform initial configuration..."
            /usr/sbin/$1 --control unix:/var/run/control.unit.sock

            while [ ! -S /var/run/control.unit.sock ]; do echo "$0: Waiting for control socket to be created..."; /bin/sleep 0.1; done
            # even when the control socket exists, it does not mean unit has finished initialisation
            # this curl call will get a reply once unit is fully launched
            /usr/bin/curl -s -X GET --unix-socket /var/run/control.unit.sock http://localhost/

            echo "$0: Looking for certificate bundles in /docker-entrypoint.d/..."
            for f in $(/usr/bin/find /docker-entrypoint.d/ -type f -name "*.pem"); do
                echo "$0: Uploading certificates bundle: $f"
                curl_put $f "certificates/$(basename $f .pem)"
            done

            echo "$0: Looking for configuration snippets in /docker-entrypoint.d/..."
            for f in $(/usr/bin/find /docker-entrypoint.d/ -type f -name "*.json"); do
                echo "$0: Applying configuration $f";
                curl_put $f "config"
            done

            echo "$0: Looking for shell scripts in /docker-entrypoint.d/..."
            for f in $(/usr/bin/find /docker-entrypoint.d/ -type f -name "*.sh"); do
                echo "$0: Launching $f";
                "$f"
            done

            # warn on filetypes we don't know what to do with
            for f in $(/usr/bin/find /docker-entrypoint.d/ -type f -not -name "*.sh" -not -name "*.json" -not -name "*.pem"); do
                echo "$0: Ignoring $f";
            done

            echo "$0: Stopping Unit daemon after initial configuration..."
            kill -TERM `/bin/cat /var/run/unit.pid`

            while [ -S /var/run/control.unit.sock ]; do echo "$0: Waiting for control socket to be removed..."; /bin/sleep 0.1; done

            echo
            echo "$0: Unit initial configuration complete; ready for start up..."
            echo
        else
            echo "$0: /docker-entrypoint.d/ is empty, skipping initial configuration..."
        fi
    fi
fi

exec "$@"
