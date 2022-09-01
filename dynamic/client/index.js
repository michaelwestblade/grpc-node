const path = require('path');
const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');
const {greet} = require('../../greet/server/service_impl');

// grpc service definition for greet

const greetProtoPath = path.join(__dirname, "..", "protos", "greet.proto");
const greetProtoDefinition = protoLoader.loadSync(greetProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const greetPackageDefinition = grpc.loadPackageDefinition(greetProtoDefinition).greet
const client = new greetPackageDefinition.GreetService("localhost:50051", grpc.credentials.createInsecure());

function callGreetings() {
  const request = {
    greeting: {
      first_name: "Jerry",
      last_name: "Jones"
    }
  };
  client.greet(request, (error, response) => {
    if (error) {
      return console.error(error);
    }

    console.log(`Greeting response: ${response.result}`);
  })
}

function main() {
  callGreetings();
}

main();
