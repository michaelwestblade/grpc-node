const grpc = require('@grpc/grpc-js');
const {CalculatorServiceClient} = require('../proto/calculator_grpc_pb');
const {SumRequest} = require('../proto/sum_pb');
const {PrimeRequest} = require('../proto/primes_pb');
const {AvgRequest} = require('../proto/avg_pb');
const {MaxRequest} = require('../proto/max_pb');

function doSum(client) {
  console.log('doSum was invoked');

  const req = new SumRequest()
    .setFirstNumber(5)
    .setSecondNumber(6);

  client.sum(req, (error, response) => {
    if (error) {
      return console.error(error);
    }

    console.log(`Sum: ${response.getResult()}`)
  })
}

function doPrimes(client) {
  console.log('doPrimes was invoked');

  const req = new PrimeRequest()
    .setNumber(12390392840);

  const call = client.primes(req);

  call.on('data', (res) => {
    console.log(`Primes: ${res.getResult()}`);
  })
}

function doAvg(client) {
  console.log('doAvg was invoked');

  const numbers = [...Array(11).keys()].slice(1);
  const call = client.avg((err, res) => {
    if (err) {
      return console.error(err);
    }

    console.log(`Avg: ${res.getResult()}`)
  });

  numbers.map(number => new AvgRequest().setNumber(number)).forEach(req => call.write(req));

  call.end();
}

function doMax(client) {
  console.log('doMax was invoked');

  const numbers = [4,7,2,19,4,6,32];
  const call = client.max();

  call.on('data', (res) => {
    console.log(`Max: ${res.getResult()}`);
  });

  numbers.map(number => new MaxRequest().setNumber(number)).forEach(req => call.write(req));

  call.end();
}

function main() {
  const creds = grpc.ChannelCredentials.createInsecure();
  const client = new CalculatorServiceClient('localhost:50051', creds);

  doSum(client);
  doPrimes(client);
  doAvg(client);
  doMax(client);

  client.close();
}

main();
