const path = require('path');
const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');

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

function greet(call, callback) {
  const firstName = call.request.greeting.first_name;
  const lastName = call.request.greeting.last_name;

  callback(null, {result: `Hello, ${firstName} ${lastName}`});
}

function main() {
  const server = new grpc.Server();

  server.addService(greetPackageDefinition.GreetService.service, {
    greet: greet
  });

  server.bind("localhost:50051", grpc.ServerCredentials.createInsecure());
  server.start();

  console.log("Server started at localhost:50051");
}

main();
