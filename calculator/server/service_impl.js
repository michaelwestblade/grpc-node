const grpc = require('@grpc/grpc-js');
const {SumResponse} = require('../proto/sum_pb');
const {PrimeResponse} = require('../proto/primes_pb');
const {AvgResponse} = require('../proto/avg_pb');
const {MaxResponse} = require('../proto/max_pb');
const {SqrtResponse} = require('../proto/sqrt_pb');
const pb = require('../../greet/proto/greet_pb');

exports.sum = (call, callback) => {
  console.log('Sum was invoked');

  const res = new SumResponse()
    .setResult(
      call.request.getFirstNumber() + call.request.getSecondNumber()
    );

  callback(null, res);
}

exports.primes = (call, _) => {
  console.log('Primes was invoked');
  let number = call.request.getNumber();
  let divisor = 2;
  const res = new PrimeResponse();

  while (number > 1) {
    if (number % divisor === 0) {
      res.setResult(divisor);
      call.write(res);
      number /= divisor
    } else {
      ++divisor;
    }
  }

  call.end();
}

exports.avg = (call, callback) => {
  console.log('avg was invoked');

  let count = 0;
  let total = 0;

  call.on('data', (req) => {
    total+=req.getNumber();
    ++count;
  })

  call.on('end', () => {
    const res = new AvgResponse().setResult(total/count);

    callback(null, res);
  })
}

exports.max = (call, _) => {
  console.log('max was invoked');

  let max = 0;

  call.on('data', (req) => {
    const number = req.getNumber();

    if (number > max) {
      const res = new MaxResponse().setResult(number);

      call.write(res);
      max = number;
    }
  });

  call.on('end', () => call.end());
}

exports.sqrt = (call, callback) => {
  console.log('sqrt was invoked');
  const number = call.request.getNumber();

  if (number < 0) {
    callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: `number cannot be negative; received ${number}`
    })
  }

  const res = new SqrtResponse().setResult(Math.sqrt(number));

  callback(null, res);
}
