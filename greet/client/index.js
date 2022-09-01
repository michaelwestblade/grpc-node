const grpc = require('@grpc/grpc-js');
const {GreetServiceClient} = require('../proto/greet_grpc_pb');
const {GreetRequest} = require('../proto/greet_pb');

function doGreet(client) {
  console.log('doGreet was invoked');

  const req = new GreetRequest()
    .setFirstName('Michael');

  client.greet(req, (error, response) => {
    if (error) {
      return console.error(error);
    }

    console.log(`Greet ${response.getResult()}`)
  })
}

function main() {
  const creds = grpc.ChannelCredentials.createInsecure();
  const client = new GreetServiceClient('localhost:50051', creds);

  doGreet(client)

  client.close();
}

main();
