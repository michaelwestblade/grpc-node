const grpc = require('@grpc/grpc-js');
const {CalculatorServiceClient} = require('../proto/calculator_grpc_pb');
const {SumRequest} = require('../proto/sum_pb');

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

function main() {
  const creds = grpc.ChannelCredentials.createInsecure();
  const client = new CalculatorServiceClient('localhost:50051', creds);

  doSum(client)

  client.close();
}

main();
