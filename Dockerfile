FROM node

RUN mkdir -p /es-json
ADD package.json /es-json/

WORKDIR /es-json/

RUN npm install

ADD . /es-json/

CMD ./run.sh
