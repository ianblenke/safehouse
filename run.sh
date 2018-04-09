#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${DIR}"
export ES_URL=${ES_URL:-http://localhost:9200}
export ES_HTTP_AUTH=${ES_HTTP_AUTH:-admin:changeme}
export ES_INDEX=${ES_INDEX:-json}
exec nodejs server.js $@
