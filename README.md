# jsonpmock
[![Build Status](https://travis-ci.org/loveky/jsonpmock.svg?branch=master)](https://travis-ci.org/loveky/jsonpmock)
[![Coverage Status](https://coveralls.io/repos/github/loveky/jsonpmock/badge.svg?branch=master)](https://coveralls.io/github/loveky/jsonpmock?branch=master)

mock up your jsonp API with ease 

developed & tested under Node version 5.4.1

### Development
```shell
git clone https://github.com/loveky/jsonpmock.git
cd jsonpmock
cp config/development.json.sample config/development.json
npm install
npm start
```
[Check here](https://github.com/luin/ioredis/blob/master/API.md#new_Redis_new) for available redis configuration in `development.json`

### Test
```shell
npm test
```
Then, you can view the coverage report in `coverage/lcov-report/index.html` file.
