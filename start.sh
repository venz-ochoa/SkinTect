#!/bin/bash
docker start my-pg
#kills any previous ones running that use 3000
lsof -ti :3000 | xargs -r kill -9
(cd server && node --env-file=.env server.js) &
cd client && npm run dev